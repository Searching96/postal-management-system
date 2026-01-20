import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useRef, useEffect } from 'react';
// Ensure the plugin is imported so L.Polyline has the .arrowheads method
import 'leaflet-arrowheads';

// Fix Leaflet generic marker icon missing issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapMarker {
    id: string;
    position: LatLngExpression;
    popupContent: React.ReactNode;
    icon?: L.Icon | L.DivIcon;
}

export interface MapPolyline {
    id: string;
    positions: LatLngExpression[];
    color: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
    popupContent?: React.ReactNode;
    onClick?: () => void;
    // NEW: Add arrowheads property to the interface
    arrowheads?: any;
}

interface VietnamMapProps {
    markers?: MapMarker[];
    polylines?: MapPolyline[];
    height?: string;
}

const VIETNAM_CENTER: LatLngExpression = [16.0376, 107.0];
const DEFAULT_ZOOM = 5;

function ClickablePolyline({ line }: { line: MapPolyline }) {
    // Ref for the invisible click area
    const clickPolylineRef = useRef<L.Polyline>(null);
    // Ref for the actual visible line (where we want arrows)
    const visiblePolylineRef = useRef<L.Polyline>(null);

    // 1. Handle Click Events (on the invisible thick line)
    useEffect(() => {
        if (clickPolylineRef.current && line.onClick) {
            const polyline = clickPolylineRef.current;
            polyline.on('click', line.onClick);

            return () => {
                polyline.off('click', line.onClick);
            };
        }
    }, [line.onClick]);

    // 2. Handle Arrowheads (on the visible line)
    useEffect(() => {
        const polyline = visiblePolylineRef.current;

        // Check if ref exists, arrowheads config exists, and plugin is loaded
        if (polyline && line.arrowheads && (polyline as any).arrowheads) {

            // Initialize arrowheads
            (polyline as any).arrowheads(line.arrowheads);

            // Force redraw to ensure they appear
            // (polyline as any).redraw(); 

            // Cleanup function to remove arrows when component unmounts or data changes
            return () => {
                if ((polyline as any).deleteArrowheads) {
                    (polyline as any).deleteArrowheads();
                }
            };
        }
    }, [line.arrowheads, line.positions]);

    return (
        <>
            {/* Invisible thicker line for easier clicking */}
            <Polyline
                ref={clickPolylineRef}
                positions={line.positions}
                color={line.color}
                weight={(line.weight ?? 3) + 15}
                opacity={0}
            />

            {/* Visible line - We attach the visiblePolylineRef here */}
            <Polyline
                ref={visiblePolylineRef}
                positions={line.positions}
                color={line.color}
                weight={line.weight ?? 3}
                opacity={line.opacity ?? 1}
                dashArray={line.dashArray}
            >
                {line.popupContent && <Popup>{line.popupContent}</Popup>}
            </Polyline>
        </>
    );
}

// Internal component to handle auto-zooming
function MapBoundsFitter({ markers }: { markers: MapMarker[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            try {
                // Leaflet expects [lat, lng] tuples, ensure positions are correct
                const bounds = L.latLngBounds(markers.map(m => m.position as L.LatLngTuple));
                if (bounds.isValid()) {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
                }
            } catch (e) {
                console.warn("Failed to fit bounds:", e);
            }
        }
    }, [markers, map]);

    return null;
}

export function VietnamMap({
    markers = [],
    polylines = [],
    height = '600px'
}: VietnamMapProps) {
    return (
        <MapContainer
            center={VIETNAM_CENTER}
            zoom={DEFAULT_ZOOM}
            style={{ height, width: '100%' }}
        >
            <MapBoundsFitter markers={markers} />

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {markers.map(marker => (
                <Marker
                    key={marker.id}
                    position={marker.position}
                    icon={marker.icon || DefaultIcon}
                >
                    <Popup>{marker.popupContent}</Popup>
                </Marker>
            ))}

            {polylines.map(line => (
                <ClickablePolyline key={line.id} line={line} />
            ))}
        </MapContainer>
    );
}