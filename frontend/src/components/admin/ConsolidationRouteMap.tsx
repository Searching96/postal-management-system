import React, { useMemo } from 'react';
import { ConsolidationRoute } from '../../models/consolidationRoute';
import { VietnamMap, MapMarker, MapPolyline } from '../common/VietnamMap';
import { MapPin, Warehouse } from 'lucide-react';
import L from 'leaflet';
import 'leaflet-arrowheads';
import { getWardCoordinates } from '../../constants/wardCoordinates';

const PROVINCE_COORDINATES: Record<string, [number, number]> = {
    '01': [21.0285, 105.8542], // Hà Nội Center (Warehouse)
};

function createOfficeIcon(type: string, isSelected: boolean = false, isSelectionMode: boolean = false): L.DivIcon {
    const isWarehouse = type === 'PROVINCE_WAREHOUSE';
    const color = isWarehouse ? '#ea580c' : '#16a34a';
    const size = isWarehouse ? 32 : 24;
    const label = isWarehouse ? 'PW' : 'WO';
    const zIndex = isWarehouse ? 400 : 300;

    // Visual cues
    const borderColor = isSelected ? '#fbbf24' : (isSelectionMode ? '#3b82f6' : 'white');
    const borderWidth = isSelected ? '3px' : (isSelectionMode ? '2px' : '2px');
    const scale = isSelectionMode ? 'scale(1.1)' : 'scale(1)';

    return L.divIcon({
        className: 'custom-office-marker',
        html: `
      <div style="
        width: ${size}px; height: ${size}px; background-color: ${color};
        border: ${borderWidth} solid ${borderColor};
        border-radius: 50% 50% 50% 0;
        box-shadow: 0 3px 5px rgba(0,0,0,0.3);
        transform: rotate(-45deg) ${scale};
        transition: all 0.2s ease;
        display: flex; align-items: center; justify-content: center;
        z-index: ${zIndex};
        cursor: pointer;
      ">
        <span style="color: white; font-weight: bold; font-size: ${size * 0.4}px; transform: rotate(45deg);">
          ${label}
        </span>
      </div>
    `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
    });
}

interface ConsolidationRouteMapProps {
    routes: ConsolidationRoute[];
    selectedRoute?: ConsolidationRoute | null;
    selectedOfficeCode?: string | null;
    isSelectionMode?: boolean;
    onRouteClick?: (route: ConsolidationRoute) => void;
    onOfficeClick?: (officeCode: string, route: ConsolidationRoute) => void;
}

export function ConsolidationRouteMap({
    routes,
    selectedRoute,
    selectedOfficeCode,
    isSelectionMode = false,
    onRouteClick,
    onOfficeClick,
}: ConsolidationRouteMapProps) {
    const warehousePos = PROVINCE_COORDINATES['01'];

    const getPos = (id: string) => {
        if (id === 'warehouse-01') return warehousePos;
        return getWardCoordinates(id);
    };

    // 1. RENDERING NODES (MARKERS) - Strictly responsible for placing dots
    const markers = useMemo<MapMarker[]>(() => {
        const list: MapMarker[] = [];
        const processedNodes = new Set<string>(); // Prevent duplicate markers if nodes appear in multiple logic paths

        routes.forEach(route => {
            if (!route.status.isActive) return;

            route.routeStops.forEach(stop => {
                const uniqueKey = `${stop.officeCode}-${route.id}`;

                // Determine coordinates
                const isWarehouse = stop.officeCode === 'warehouse-01';
                const position = isWarehouse ? warehousePos : getWardCoordinates(stop.officeCode);

                if (position && !processedNodes.has(uniqueKey)) {
                    processedNodes.add(uniqueKey);

                    const isSelected = selectedOfficeCode === stop.officeCode;
                    const type = isWarehouse ? 'PROVINCE_WAREHOUSE' : 'WARD_OFFICE';
                    // Use the name from the route stop object
                    const name = stop.officeName || (isWarehouse ? 'Hanoi Central (PW)' : stop.officeCode);

                    list.push({
                        id: uniqueKey,
                        position,
                        icon: createOfficeIcon(type, isSelected, isSelectionMode),
                        popupContent: (
                            <div
                                className="cursor-pointer"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onOfficeClick?.(stop.officeCode, route);
                                }}
                            >
                                <div className="flex items-center gap-1.5">
                                    {isWarehouse ? <Warehouse className="w-4 h-4 text-orange-600" /> : <MapPin className="w-4 h-4 text-green-600" />}
                                    <h3 className="font-bold text-sm text-gray-900">Kho {name}</h3>
                                </div>
                                <p className="text-xs text-blue-600 font-bold animate-pulse">Click to set Destination</p>
                            </div>
                        ),
                    });
                }
            });
        });
        return list;
    }, [routes, selectedOfficeCode, isSelectionMode, onOfficeClick, warehousePos]);

    // 2. RENDERING LINKS (POLYLINES) - Strictly responsible for connecting dots
    const polylines = useMemo<MapPolyline[]>(() => {
        const edges: MapPolyline[] = [];

        routes.forEach(route => {
            if (!route.status.isActive) return;
            const routeColor = (route as any).color || '#3b82f6';
            const isRouteSelected = selectedRoute?.id === route.id;

            route.routeStops.forEach((stop) => {
                // LOGIC: Only draw a line IF a destination exists
                // This allows standalone nodes to exist without crashing or drawing phantom lines
                if ((stop as any).nextDestinationId) {
                    const startPos = stop.officeCode === 'warehouse-01' ? warehousePos : getWardCoordinates(stop.officeCode);
                    const endPos = getPos((stop as any).nextDestinationId);

                    if (startPos && endPos) {
                        const isNodeSelected = selectedOfficeCode === stop.officeCode;

                        let color = routeColor;
                        let opacity = 0.6;
                        let weight = 2;

                        if (isSelectionMode) {
                            color = '#9ca3af';
                            opacity = 0.2;
                        } else if (isNodeSelected) {
                            color = '#f59e0b';
                            weight = 5;
                            opacity = 1;
                        } else if (isRouteSelected) {
                            weight = 3;
                            opacity = 0.8;
                        }

                        edges.push({
                            id: `${route.id}-${stop.officeCode}-${(stop as any).nextDestinationId}`,
                            positions: [startPos, endPos],
                            color,
                            weight,
                            opacity,
                            arrowheads: {
                                size: isNodeSelected ? '20px' : '16px',
                                frequency: '100px', // Arrow every 100 pixels along the line
                                fill: true,
                                color: color,
                                yawn: 40, // Width of the arrowhead (degrees)
                            },
                            onClick: () => !isSelectionMode && onRouteClick?.(route),
                        });
                    }
                }
            });
        });
        return edges;
    }, [routes, selectedRoute, selectedOfficeCode, isSelectionMode, warehousePos]);

    return (
        <div className={`relative border border-gray-200 rounded-xl overflow-hidden shadow-sm h-[650px] bg-slate-50 z-0 transition-all ${isSelectionMode ? 'ring-4 ring-blue-100' : ''}`}>
            {isSelectionMode && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-blue-600 text-white px-6 py-2 rounded-full shadow-lg font-bold flex items-center gap-2 animate-bounce-slight pointer-events-none">
                    <MapPin className="w-5 h-5" />
                    Select a destination node on the map
                </div>
            )}
            <VietnamMap markers={markers} polylines={polylines} height="100%" />
        </div>
    );
}