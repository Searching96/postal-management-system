import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { ShipperLocation } from '../../services/trackingService';

// Fix for default Leaflet markers in React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const shipperIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3063/3063823.png', // Delivery truck icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});


interface DeliveryMapProps {
    shipperLocation: ShipperLocation;
    // Destination coordinates could be added here if we had geocoding
    // For now we only show shipper location on map
}

function MapUpdater({ center }: { center: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, map.getZoom());
    }, [center, map]);
    return null;
}

export function DeliveryMap({ shipperLocation }: DeliveryMapProps) {
    const position: [number, number] = [shipperLocation.latitude, shipperLocation.longitude];

    return (
        <div className="h-[400px] w-full rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
                center={position}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={shipperIcon}>
                    <Popup>
                        <div className="text-center">
                            <p className="font-bold text-gray-900 mb-1">Bưu tá: {shipperLocation.shipperName}</p>
                            <p className="text-sm text-gray-600">Đang giao hàng</p>
                            {shipperLocation.speed !== undefined && (
                                <p className="text-xs text-gray-500 mt-1">Tốc độ: {Math.round(shipperLocation.speed)} km/h</p>
                            )}
                        </div>
                    </Popup>
                </Marker>
                <MapUpdater center={position} />
            </MapContainer>
        </div>
    );
}
