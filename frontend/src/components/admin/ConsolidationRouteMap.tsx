import { useMemo } from 'react';
import { ConsolidationRoute, RouteLevel } from '../../models/consolidationRoute';
import { VietnamMap, MapMarker, MapPolyline } from '../common/VietnamMap';
import { MapPin } from 'lucide-react';
import L from 'leaflet';

interface ConsolidationRouteMapProps {
    routes: ConsolidationRoute[];
    selectedRoute?: ConsolidationRoute | null;
    onRouteClick?: (route: ConsolidationRoute) => void;
}

// Province code to coordinates mapping (same as RouteNetworkMap)
const PROVINCE_COORDINATES: Record<string, [number, number]> = {
    '01': [22.3380, 103.3119], // Hà Giang
    '02': [22.6853, 104.9784], // Cao Bằng
    '04': [21.8733, 106.2506], // Lạng Sơn
    '06': [21.5928, 105.9199], // Bắc Kạn
    '08': [21.7767, 105.2280], // Tuyên Quang
    '10': [21.3014, 104.9200], // Lào Cai
    '11': [21.0245, 105.3525], // Điện Biên
    '12': [21.1022, 103.9144], // Lai Châu
    '14': [21.5861, 103.9755], // Sơn La
    '15': [21.3850, 104.4760], // Yên Bái
    '17': [21.5928, 104.8861], // Hòa Bình
    '19': [21.3014, 105.3525], // Thái Nguyên
    '20': [21.5861, 106.5928], // Lạng Sơn
    '22': [21.0245, 105.8542], // Quảng Ninh
    '24': [21.0069, 105.8228], // Bắc Giang
    '25': [21.1861, 106.6113], // Phú Thọ
    '26': [21.3014, 106.0167], // Vĩnh Phúc
    '27': [21.0069, 106.3450], // Bắc Ninh
    '30': [20.9861, 106.2431], // Hải Dương
    '31': [20.8525, 106.6881], // Hải Phòng
    '33': [20.4389, 106.1553], // Hưng Yên
    '34': [20.5519, 106.4056], // Thái Bình
    '35': [20.4331, 106.5053], // Hà Nam
    '36': [20.2528, 105.9747], // Nam Định
    '37': [20.1911, 106.1906], // Ninh Bình
    '38': [19.8069, 105.7761], // Thanh Hóa
    '40': [18.6796, 105.6813], // Nghệ An
    '42': [18.3386, 105.9050], // Hà Tĩnh
    '44': [17.4739, 106.6222], // Quảng Bình
    '45': [17.4670, 107.1178], // Quảng Trị
    '46': [16.4637, 107.5909], // Thừa Thiên Huế
    '48': [15.5694, 108.0194], // Đà Nẵng
    '49': [15.5761, 108.4858], // Quảng Nam
    '51': [15.1214, 108.8044], // Quảng Ngãi
    '52': [14.3497, 109.0953], // Bình Định
    '54': [13.7756, 109.2194], // Phú Yên
    '56': [12.2451, 109.1967], // Khánh Hòa
    '58': [11.9465, 108.9975], // Ninh Thuận
    '60': [10.9465, 108.1067], // Bình Thuận
    '62': [14.1665, 108.0441], // Kon Tum
    '64': [13.3623, 108.0100], // Gia Lai
    '66': [12.6687, 108.0371], // Đắk Lắk
    '67': [12.0094, 107.6839], // Đắk Nông
    '68': [11.5753, 108.1429], // Lâm Đồng
    '70': [11.3254, 106.4106], // Bình Phước
    '72': [11.3343, 106.1110], // Tây Ninh
    '74': [11.5449, 106.4256], // Bình Dương
    '75': [10.9804, 106.6760], // Đồng Nai
    '77': [10.3496, 107.0839], // Bà Rịa - Vũng Tàu
    '79': [10.8231, 106.6297], // TP Hồ Chí Minh
    '80': [10.5417, 105.1258], // Long An
    '82': [10.2447, 106.3433], // Tiền Giang
    '83': [10.2500, 106.0833], // Bến Tre
    '84': [10.0381, 105.7850], // Trà Vinh
    '86': [10.3758, 105.4358], // Vĩnh Long
    '87': [10.0452, 105.7469], // Cần Thơ
    '89': [9.7781, 105.6189], // Hậu Giang
    '91': [9.9325, 105.1258], // Kiên Giang
    '92': [9.6019, 105.1258], // An Giang
    '93': [9.1856, 105.4419], // Đồng Tháp
    '94': [10.0333, 105.4333], // Sóc Trăng
    '95': [9.1833, 105.4333], // Bạc Liêu
    '96': [9.1770, 105.1524], // Cà Mau
    '01': [21.0285, 105.8542], // Hà Nội
};

// Create custom map icons for different office types
function createOfficeIcon(type: string, isSelected: boolean = false): L.DivIcon {
    let color: string;
    let size: number;
    let label: string;
    let iconColor: string;

    switch (type) {
        case 'SYSTEM_HUB':
            color = isSelected ? '#b91c1c' : '#dc2626'; // red-600
            size = 40;
            label = 'SH';
            iconColor = '#ffffff';
            break;
        case 'HUB':
            color = isSelected ? '#1d4ed8' : '#2563eb'; // blue-600
            size = 35;
            label = 'H';
            iconColor = '#ffffff';
            break;
        case 'PROVINCE_WAREHOUSE':
            color = isSelected ? '#c2410c' : '#ea580c'; // orange-600
            size = 30;
            label = 'PW';
            iconColor = '#ffffff';
            break;
        case 'WARD_OFFICE':
            color = isSelected ? '#15803d' : '#16a34a'; // green-600
            size = 25;
            label = 'WO';
            iconColor = '#ffffff';
            break;
        default:
            color = '#6b7280'; // gray-500
            size = 30;
            label = '?';
            iconColor = '#ffffff';
    }

    return L.divIcon({
        className: 'custom-office-marker',
        html: `
            <div style="
                width: ${size}px;
                height: ${size}px;
                background-color: ${color};
                border: 3px solid ${isSelected ? '#fbbf24' : 'white'};
                border-radius: 50% 50% 50% 0;
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
                transform: rotate(-45deg);
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
            ">
                <span style="
                    color: ${iconColor};
                    font-weight: bold;
                    font-size: ${size * 0.35}px;
                    transform: rotate(45deg);
                    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
                ">${label}</span>
            </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size]
    });
}

// Extract province code from ward code (first 2 digits)
function getProvinceCodeFromWardCode(wardCode: string | undefined): string | null {
    if (!wardCode || wardCode.length < 2) return null;
    return wardCode.substring(0, 2);
}

// Get coordinates based on province or ward code
function getCoordinatesFromCode(provinceCode?: string, wardCode?: string, index: number = 0): [number, number] {
    // Try direct province code
    if (provinceCode && PROVINCE_COORDINATES[provinceCode]) {
        return PROVINCE_COORDINATES[provinceCode];
    }

    // Try extracting from ward code
    const extractedProvinceCode = getProvinceCodeFromWardCode(wardCode);
    if (extractedProvinceCode && PROVINCE_COORDINATES[extractedProvinceCode]) {
        return PROVINCE_COORDINATES[extractedProvinceCode];
    }

    // Fallback grid
    console.warn('No matching coordinates found, using fallback:', { provinceCode, wardCode });
    const gridSize = 3;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const lat = 21.0 - (row * 2.2);
    const lng = 104.5 + (col * 1.5);
    return [lat, lng];
}

// Determine warehouse type from code
function getWarehouseType(warehouseCode: string): string {
    if (warehouseCode.includes('SYSTEM_HUB')) return 'SYSTEM_HUB';
    if (warehouseCode.includes('HUB')) return 'HUB';
    if (warehouseCode.includes('PROVINCE')) return 'PROVINCE_WAREHOUSE';
    return 'PROVINCE_WAREHOUSE'; // default
}

export function ConsolidationRouteMap({ routes, selectedRoute, onRouteClick }: ConsolidationRouteMapProps) {
    // Create markers for all unique destination warehouses and ward offices
    const markers = useMemo<MapMarker[]>(() => {
        const markerMap = new Map<string, MapMarker>();

        routes.forEach((route, routeIndex) => {
            const isRouteSelected = selectedRoute?.id === route.id;

            // Add destination warehouse marker
            const warehouseId = route.destinationWarehouse.id;
            if (!markerMap.has(warehouseId)) {
                const warehouseType = getWarehouseType(route.destinationWarehouse.code);
                const warehouseCoords = getCoordinatesFromCode(route.province.code, undefined, routeIndex);

                markerMap.set(warehouseId, {
                    id: warehouseId,
                    position: warehouseCoords,
                    icon: createOfficeIcon(warehouseType, isRouteSelected),
                    popupContent: (
                        <div className="p-1">
                            <div className="flex items-center gap-2 mb-1">
                                <MapPin className="w-4 h-4 text-primary-600" />
                                <h3 className="font-bold text-sm text-gray-900">{route.destinationWarehouse.name}</h3>
                            </div>
                            <p className="text-xs text-gray-600">{route.province.name}</p>
                            <p className="text-xs text-gray-500">
                                {warehouseType === 'SYSTEM_HUB' ? 'System Hub' :
                                 warehouseType === 'HUB' ? 'Regional Hub' :
                                 'Province Warehouse'}
                            </p>
                        </div>
                    )
                });
            }

            // Add ward office markers (route stops)
            route.routeStops.forEach((stop, stopIndex) => {
                const wardId = `${route.id}-${stop.wardCode}`;
                if (!markerMap.has(wardId)) {
                    const wardCoords = getCoordinatesFromCode(undefined, stop.wardCode, routeIndex * 10 + stopIndex);

                    // Add small offset to prevent overlapping markers in same province
                    const offset = stopIndex * 0.05;
                    wardCoords[0] += offset;
                    wardCoords[1] += offset;

                    markerMap.set(wardId, {
                        id: wardId,
                        position: wardCoords,
                        icon: createOfficeIcon('WARD_OFFICE', isRouteSelected),
                        popupContent: (
                            <div className="p-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="w-4 h-4 text-green-600" />
                                    <h3 className="font-bold text-sm text-gray-900">{stop.wardOfficeName}</h3>
                                </div>
                                <p className="text-xs text-gray-600">Ward: {stop.wardCode}</p>
                                <p className="text-xs text-gray-500">Ward Office</p>
                                {stop.distanceKm && (
                                    <p className="text-xs text-gray-400 mt-1">Distance: {stop.distanceKm} km</p>
                                )}
                            </div>
                        )
                    });
                }
            });
        });

        return Array.from(markerMap.values());
    }, [routes, selectedRoute]);

    // Create polylines for routes
    const polylines = useMemo<MapPolyline[]>(() => {
        return routes.flatMap(route => {
            const isSelected = selectedRoute?.id === route.id;
            const warehouseCoords = getCoordinatesFromCode(route.province.code, undefined, 0);

            return route.routeStops.map((stop, stopIndex) => {
                const wardCoords = getCoordinatesFromCode(undefined, stop.wardCode, stopIndex);

                // Add same offset as marker
                const offset = stopIndex * 0.05;
                wardCoords[0] += offset;
                wardCoords[1] += offset;

                return {
                    id: `${route.id}-${stop.wardCode}`,
                    positions: [wardCoords, warehouseCoords],
                    color: isSelected ? '#fbbf24' : (route.status.isActive ? '#22c55e' : '#ef4444'),
                    weight: isSelected ? 4 : (route.status.isActive ? 2 : 2),
                    opacity: isSelected ? 0.9 : (route.status.isActive ? 0.6 : 0.4),
                    dashArray: route.status.isActive ? undefined : '5, 10',
                    onClick: () => onRouteClick?.(route),
                    popupContent: (
                        <div className="p-1 min-w-[200px]">
                            <h4 className="font-bold text-gray-900 text-sm mb-1">{route.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{stop.wardOfficeName} → {route.destinationWarehouse.name}</p>
                            <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Province:</span>
                                    <span className="font-medium">{route.province.name}</span>
                                </div>
                                {stop.distanceKm && (
                                    <div className="flex justify-between">
                                        <span>Distance:</span>
                                        <span className="font-medium">{stop.distanceKm} km</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-1 border-t border-gray-100">
                                    <span>Status:</span>
                                    <span className={`font-medium ${route.status.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                        {route.status.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Orders:</span>
                                    <span className="font-medium">{route.status.totalConsolidatedOrders}</span>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="mt-2 text-center text-xs text-blue-600 italic cursor-pointer hover:underline bg-transparent border-none w-full focus:outline-none"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onRouteClick?.(route);
                                }}
                            >
                                Click to view details
                            </button>
                        </div>
                    )
                };
            });
        });
    }, [routes, selectedRoute, onRouteClick]);

    return (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Legend */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 text-sm pointer-events-none">
                <div className="mb-3 pb-3 border-b border-slate-200">
                    <div className="font-medium text-slate-900 mb-2">Consolidation Routes</div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-4 h-4 bg-orange-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[6px] font-bold shadow">PW</div>
                        <span className="text-slate-700">Province Warehouse</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[6px] font-bold shadow">WO</div>
                        <span className="text-slate-700">Ward Office</span>
                    </div>
                </div>

                <div className="mb-3 pb-3 border-b border-slate-200">
                    <div className="font-medium text-slate-900 mb-2">Route Status</div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-slate-700">Active</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="text-slate-700">Inactive</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                        <span className="text-slate-700">Selected</span>
                    </div>
                </div>
            </div>

            <VietnamMap
                markers={markers}
                polylines={polylines}
                height="650px"
            />
        </div>
    );
}
