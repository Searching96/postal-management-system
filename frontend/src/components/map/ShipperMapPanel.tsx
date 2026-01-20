import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Order } from "../../services/orderService";
import { AlertCircle, Loader2 } from "lucide-react";

// Fix for default Leaflet markers in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom delivery location icon
const deliveryIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/535/535137.png",
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

interface GeocodedOrder extends Order {
  coordinates?: [number, number];
  geocodingError?: boolean;
  isApproximate?: boolean;
}

// Cache for geocoding results to avoid repeated API calls
const geocodeCache = new Map<string, [number, number] | null>();

async function geocodeAddress(
  address: string,
): Promise<[number, number] | null> {
  if (geocodeCache.has(address)) {
    return geocodeCache.get(address) ?? null;
  }

  try {
    // Use Vite proxy to bypass CORS
    const response = await fetch(
      `/nominatim/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=vn`,
    );

    if (!response.ok) {
      console.warn(`Geocoding failed with status: ${response.status}`);
      geocodeCache.set(address, null);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const coordinates: [number, number] = [
        parseFloat(data[0].lat),
        parseFloat(data[0].lon),
      ];
      geocodeCache.set(address, coordinates);
      return coordinates;
    }

    geocodeCache.set(address, null);
    return null;
  } catch (error) {
    // CORS or network error - silently fail and use fallback coordinates
    console.warn("Geocoding unavailable, using backend coordinates only");
    geocodeCache.set(address, null);
    return null;
  }
}

function MapBoundsFitter({ orders }: { orders: GeocodedOrder[] }) {
  const map = useMap();

  useEffect(() => {
    const coordinates = orders
      .filter((o) => o.coordinates)
      .map((o) => o.coordinates as [number, number]);

    if (coordinates.length === 0) return;

    const bounds = L.latLngBounds(coordinates);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
  }, [orders, map]);

  return null;
}

// Driver/Current Location icon
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

interface ShipperMapPanelProps {
  orders: Order[];
  mode?: "delivery" | "pickup";
  currentLocation?: { lat: number; lng: number }; // Added prop here
}

export function ShipperMapPanel({
  orders,
  mode = "delivery",
  currentLocation: propLocation,
}: ShipperMapPanelProps) {
  const [geocodedOrders, setGeocodedOrders] = useState<GeocodedOrder[]>([]);
  const [isGeocoding, setIsGeocoding] = useState(true);

  // Default MOCK GPS: Using HCM ward office coordinates (SPX TP.HCM - Thủ Đức area)
  const MOCK_WARD_OFFICE_LOCATION: [number, number] = [10.8506, 106.763];

  // Use prop location if available, otherwise default to mock/real GPS logic
  const currentLocation: [number, number] | null = propLocation
    ? [propLocation.lat, propLocation.lng]
    : MOCK_WARD_OFFICE_LOCATION;

  useEffect(() => {
    const geocodeOrders = async () => {
      setIsGeocoding(true);
      const results = await Promise.all(
        orders.map(async (order) => {
          const targetLat =
            mode === "delivery" ? order.receiverLatitude : order.senderLatitude;
          const targetLng =
            mode === "delivery"
              ? order.receiverLongitude
              : order.senderLongitude;

          const address =
            mode === "delivery"
              ? order.receiverAddressLine1
              : order.senderAddressLine1;
          const ward =
            mode === "delivery" ? order.receiverWardName : order.senderWardName;
          const province =
            mode === "delivery"
              ? order.receiverProvinceName
              : order.senderProvinceName;

          if (targetLat && targetLng) {
            return {
              ...order,
              coordinates: [targetLat, targetLng] as [number, number],
              geocodingError: false,
              isApproximate: false,
            };
          }

          if (!address) {
            return {
              ...order,
              coordinates: undefined,
              geocodingError: true,
            };
          }

          const fullAddress = `${address}, ${ward || ""}, ${province || ""}`;
          const coordinates = await geocodeAddress(fullAddress);

          return {
            ...order,
            coordinates: coordinates || undefined,
            geocodingError: !coordinates,
            isApproximate: false,
          };
        }),
      );
      setGeocodedOrders(results);
      setIsGeocoding(false);
    };

    if (orders.length > 0) {
      geocodeOrders();
    }
  }, [orders, mode]);

  const successfullyGeocoded = useMemo(
    () => geocodedOrders.filter((o) => o.coordinates),
    [geocodedOrders],
  );

  const failedGeocoding = useMemo(
    () => geocodedOrders.filter((o) => o.geocodingError),
    [geocodedOrders],
  );

  const centerPoint = useMemo(() => {
    // If propLocation is provided (Debug Mode), center map on it
    if (propLocation) {
      return [propLocation.lat, propLocation.lng] as [number, number];
    }

    if (successfullyGeocoded.length === 0) {
      return currentLocation || undefined;
    }
    if (successfullyGeocoded.length === 1) {
      return successfullyGeocoded[0].coordinates;
    }

    const lats = successfullyGeocoded.map((o) =>
      o.coordinates ? o.coordinates[0] : 0,
    );
    const lngs = successfullyGeocoded.map((o) =>
      o.coordinates ? o.coordinates[1] : 0,
    );
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    return [avgLat, avgLng] as [number, number];
  }, [successfullyGeocoded, currentLocation, propLocation]);

  if (isGeocoding) {
    return (
      <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            Đang tải vị trí {mode === "delivery" ? "giao hàng" : "lấy hàng"}...
          </p>
        </div>
      </div>
    );
  }

  if (successfullyGeocoded.length === 0 && !currentLocation) {
    return (
      <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
          <p className="text-sm">
            Không thể xác định vị trí{" "}
            {mode === "delivery" ? "giao hàng" : "lấy hàng"}
          </p>
          <p className="text-xs text-gray-400 mt-1">
            {orders.length} đơn hàng không có tọa độ
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm relative z-0">
      <div className="h-[400px] w-full relative">
        <MapContainer
          center={centerPoint || [10.8231, 106.6297]} // Default to Ho Chi Minh City if all else fails
          zoom={13}
          style={{ height: "100%", width: "100%", zIndex: 0 }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Driver Location Marker */}
          {currentLocation && (
            <Marker
              position={currentLocation}
              icon={driverIcon}
              zIndexOffset={1000}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-bold text-blue-600 text-sm">
                    Vị trí của bạn
                  </p>
                  <p className="text-xs text-gray-600 mt-1">Shipper</p>
                </div>
              </Popup>
            </Marker>
          )}

          {successfullyGeocoded.map((order) => {
            const displayName =
              mode === "delivery" ? order.receiverName : order.senderName;
            const displayAddress =
              mode === "delivery"
                ? `${order.receiverAddressLine1}, ${order.receiverWardName || ""}, ${order.receiverProvinceName || ""}`
                : `${order.senderAddressLine1}, ${order.senderWardName || ""}, ${order.senderProvinceName || ""}`;

            return order.coordinates ? (
              <Marker
                key={order.orderId}
                position={order.coordinates}
                icon={deliveryIcon}
                opacity={order.isApproximate ? 0.7 : 1.0}
              >
                <Popup className="delivery-popup">
                  <div className="max-w-xs">
                    <p className="font-bold text-gray-900 text-sm mb-1">
                      {order.trackingNumber}
                    </p>
                    <p className="font-medium text-gray-800 text-sm mb-1">
                      {displayName}
                    </p>

                    {order.isApproximate && (
                      <div className="flex items-center gap-1.5 mb-2 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded border border-amber-100">
                        <AlertCircle size={12} />
                        <span className="font-medium">Vị trí tương đối</span>
                      </div>
                    )}

                    <p className="text-xs text-gray-600 mb-2">
                      {displayAddress}
                    </p>
                    <div className="text-xs text-gray-500 pt-1 border-t border-gray-100">
                      <div className="flex justify-between mt-1">
                        <span>Loại:</span>
                        <span className="font-medium">{order.packageType}</span>
                      </div>
                      {order.codAmount > 0 && mode === "delivery" && (
                        <div className="flex justify-between mt-1 text-red-600 font-medium">
                          <span>COD:</span>
                          <span>{order.codAmount.toLocaleString()} đ</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ) : null;
          })}

          <MapBoundsFitter orders={geocodedOrders} />
        </MapContainer>
      </div>

      {/* Legend and stats */}
      <div className="bg-white px-4 py-3 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
              <span>Đã định vị: {successfullyGeocoded.length}</span>
            </div>
            {failedGeocoding.length > 0 && (
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                <span>Lỗi: {failedGeocoding.length}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2.5 h-2.5 rounded-full ${currentLocation ? "bg-blue-500" : "bg-gray-300"}`}
              ></div>
              <span>
                {currentLocation
                  ? propLocation
                    ? "Vị trí Debug"
                    : "Vị trí Bưu cục"
                  : "Đang tìm GPS..."}
              </span>
            </div>
          </div>
          <span className="text-gray-400">Nhấp vào marker để xem chi tiết</span>
        </div>
      </div>
    </div>
  );
}
