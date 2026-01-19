import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import L from 'leaflet';
import { useRef, useEffect } from 'react';

// Fix Leaflet generic marker icon missing issue in React
// This is a known issue with Leaflet + Webpack/Vite
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
}

interface VietnamMapProps {
    markers?: MapMarker[];
    polylines?: MapPolyline[];
    height?: string;
}

// Center of Vietnam approx
const VIETNAM_CENTER: LatLngExpression = [16.0376, 107.0];
const DEFAULT_ZOOM = 5;

// Clickable polyline with grace zone
function ClickablePolyline({ line }: { line: MapPolyline }) {
    const polylineRef = useRef<L.Polyline>(null);

    useEffect(() => {
        if (polylineRef.current && line.onClick) {
            const polyline = polylineRef.current;
            polyline.on('click', line.onClick);

            return () => {
                polyline.off('click', line.onClick);
            };
        }
    }, [line.onClick]);

    return (
        <>
            {/* Invisible thicker line for easier clicking */}
            <Polyline
                ref={polylineRef}
                positions={line.positions}
                color={line.color}
                weight={(line.weight ?? 3) + 15} // Much thicker for clicking
                opacity={0} // Invisible
            />

            {/* Visible line */}
            <Polyline
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
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />

            {markers.map(marker => (
                <Marker key={marker.id} position={marker.position}>
                    <Popup>{marker.popupContent}</Popup>
                </Marker>
            ))}

            {polylines.map(line => (
                <ClickablePolyline key={line.id} line={line} />
            ))}
        </MapContainer>
    );
}