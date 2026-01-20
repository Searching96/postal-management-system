import { useMemo } from 'react';
import { TransferRoute, getDisruptionTypeLabel } from '../../services/routeService';
import { VietnamMap, MapMarker, MapPolyline } from '../common/VietnamMap';
import { AlertTriangle, MapPin, Lock } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import type { EmployeeMeResponse } from '../../models/user';
import L from 'leaflet';

interface Location {
    id: string;
    name: string;
    type: string;
    regionName?: string;
    wardCode?: string;
    provinceCode?: string;
}

interface RouteNetworkMapProps {
    routes: TransferRoute[];
    availableLocations: Location[];
    onEdgeClick?: (route: TransferRoute) => void;
}

// Hardcoded coordinates for regional hubs
// [Lat, Lng]
const REGION_COORDINATES: Record<string, [number, number]> = {
    'Vùng trung du và miền núi phía Bắc': [21.5, 105.0], // Approx Son La/Yen Bai area
    'Vùng đồng bằng sông Hồng': [21.0285, 105.8542],     // Hanoi
    'Vùng Bắc Trung Bộ': [18.6796, 105.6813],            // Vinh
    'Vùng duyên hải Nam Trung Bộ và Tây Nguyên': [14.0, 108.5], // Central Highlands/Coast mix (Kon Tum/Quang Ngai approx)
    'Vùng Đông Nam Bộ': [10.8231, 106.6297],             // Ho Chi Minh City
    'Vùng đồng bằng sông Cửu Long': [10.0452, 105.7469]  // Can Tho
};

// Province code to coordinates mapping
// Vietnam province codes (first 2 digits of ward code) to approximate center coordinates
// [Lat, Lng]
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
    '89': [9.7781, 105.6189],  // Hậu Giang
    '91': [9.9325, 105.1258],  // Kiên Giang
    '92': [9.6019, 105.1258],  // An Giang
    '93': [9.1856, 105.4419],  // Đồng Tháp
    '94': [10.0333, 105.4333], // Sóc Trăng
    '95': [9.1833, 105.4333],  // Bạc Liêu
    '96': [9.1770, 105.1524],  // Cà Mau
    '01': [21.0285, 105.8542], // Hà Nội
};

// Create custom map icons for different office types
function createOfficeIcon(type: string): L.DivIcon {
    let color: string;
    let size: number;
    let label: string;
    let iconColor: string;

    switch (type) {
        case 'SYSTEM_HUB':
            color = '#dc2626'; // red-600
            size = 40;
            label = 'SH';
            iconColor = '#ffffff';
            break;
        case 'HUB':
            color = '#2563eb'; // blue-600
            size = 35;
            label = 'H';
            iconColor = '#ffffff';
            break;
        case 'PROVINCE_WAREHOUSE':
            color = '#ea580c'; // orange-600
            size = 30;
            label = 'PW';
            iconColor = '#ffffff';
            break;
        case 'WARD_OFFICE':
            color = '#16a34a'; // green-600
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
                border: 3px solid white;
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

// Get coordinates based on available location data (priority: provinceCode > wardCode > regionName)
function getCoordinates(
    location: { regionName?: string; wardCode?: string; provinceCode?: string },
    index: number
): [number, number] {
    console.log('getCoordinates called with:', location);

    // Priority 1: Try using provinceCode directly
    if (location.provinceCode && PROVINCE_COORDINATES[location.provinceCode]) {
        console.log('Using province code coordinates:', location.provinceCode);
        return PROVINCE_COORDINATES[location.provinceCode];
    }

    // Priority 2: Extract province code from wardCode
    const provinceCode = getProvinceCodeFromWardCode(location.wardCode);
    if (provinceCode && PROVINCE_COORDINATES[provinceCode]) {
        console.log('Using province code from ward code:', provinceCode);
        return PROVINCE_COORDINATES[provinceCode];
    }

    // Priority 3: Try using regionName
    if (location.regionName && REGION_COORDINATES[location.regionName]) {
        console.log('Using region coordinates:', location.regionName);
        return REGION_COORDINATES[location.regionName];
    }

    // Priority 4: Keyword matching on regionName
    if (location.regionName) {
        const name = location.regionName.toLowerCase();
        if (name.includes('núi phía bắc') || name.includes('tây bắc') || name.includes('đông bắc')) return [22.0, 104.0];
        if (name.includes('sông hồng') || name.includes('hà nội')) return [21.0, 106.0];
        if (name.includes('bắc trung bộ')) return [19.0, 105.5];
        if (name.includes('nam trung bộ') || name.includes('tây nguyên')) return [13.0, 108.0];
        if (name.includes('đông nam bộ') || name.includes('hồ chí minh')) return [11.0, 107.0];
        if (name.includes('sông cửu long')) return [9.5, 105.5];
    }

    // Default fallback - spread across Vietnam in a grid pattern instead of straight line
    console.warn('No matching coordinates found, using fallback grid:', location);
    const gridSize = 3;
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    // Spread from north (21°) to south (10°) and west (104°) to east (108°)
    const lat = 21.0 - (row * 2.2);
    const lng = 104.5 + (col * 1.5);
    return [lat, lng];
}

export function RouteNetworkMap({ routes, availableLocations, onEdgeClick }: RouteNetworkMapProps) {
    const { user } = useAuth();
    const employeeUser = user as EmployeeMeResponse;
    const isHubAdmin = employeeUser?.role === 'HUB_ADMIN';
    const userHubId = employeeUser?.office?.id;

    // Check if user can manage a route
    const canManageRoute = (route: TransferRoute) => {
        if (!isHubAdmin) return true; // SYSTEM_ADMIN, NATIONAL_MANAGER can manage all
        // HUB_ADMIN can only manage routes involving their HUB
        return route.fromHubId === userHubId || route.toHubId === userHubId;
    };

    // Create markers from available locations (offices that user can manage)
    const markers = useMemo<MapMarker[]>(() => {
        console.log('Creating markers from availableLocations:', availableLocations);
        return availableLocations.map((location, index) => ({
            id: location.id,
            position: getCoordinates({
                regionName: location.regionName,
                wardCode: location.wardCode,
                provinceCode: location.provinceCode
            }, index),
            icon: createOfficeIcon(location.type),
            popupContent: (
                <div className="p-1">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <h3 className="font-bold text-sm text-gray-900">{location.name}</h3>
                    </div>
                    <p className="text-xs text-gray-600">{location.regionName || 'Unknown Region'}</p>
                    <p className="text-xs text-gray-500">
                        {location.type === 'SYSTEM_HUB' ? 'System Hub' :
                         location.type === 'HUB' ? 'Regional Hub' :
                         location.type === 'WARD_OFFICE' ? 'Ward Office' :
                         'Province Warehouse'}
                    </p>
                    {location.provinceCode && (
                        <p className="text-xs text-gray-400 mt-1">Province: {location.provinceCode}</p>
                    )}
                </div>
            )
        }));
    }, [availableLocations]);

    // Create polyline edges
    const polylines = useMemo<MapPolyline[]>(() => {
        return routes.map(route => {
            const startNode = markers.find(m => m.id === route.fromHubId);
            const endNode = markers.find(m => m.id === route.toHubId);

            if (!startNode || !endNode) return null;

            return {
                id: route.id,
                positions: [startNode.position, endNode.position],
                color: route.isActive ? '#22c55e' : '#ef4444',
                weight: route.isActive ? 3 : 2,
                opacity: route.isActive ? 0.6 : 0.8,
                dashArray: route.isActive ? undefined : '5, 10',
                onClick: () => onEdgeClick?.(route),
                popupContent: (
                    <div className="p-1 min-w-[240px]">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-sm mb-1">{route.fromHubName} → {route.toHubName}</h4>
                                <div className="text-xs font-medium text-primary-600 mb-2">
                                    {route.routeType === 'PROVINCE_TO_HUB' ? 'Tuyến Trung Chuyển (Tỉnh → Hub)' : 'Tuyến Liên Kho (Hub → Hub)'}
                                </div>
                            </div>
                            {!canManageRoute(route) && (
                                <Lock size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                            )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                            <div className="flex justify-between">
                                <span>Khoảng cách:</span>
                                <span className="font-medium">{route.distanceKm} km</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Thời gian:</span>
                                <span className="font-medium">{route.transitHours} giờ</span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-gray-100">
                                <span>Trạng thái:</span>
                                <span className={`font-medium ${route.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                    {route.isActive ? 'Hoạt động' : 'Tạm ngưng'}
                                </span>
                            </div>
                            {route.activeDisruption && (
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-red-700 font-medium flex items-center gap-1">
                                        <AlertTriangle size={12} />
                                        {getDisruptionTypeLabel(route.activeDisruption.type)}
                                    </p>
                                </div>
                            )}
                            {!canManageRoute(route) && (
                                <div className="pt-2 border-t border-gray-100 mt-2">
                                    <p className="text-gray-500 text-xs flex items-center gap-1">
                                        <Lock size={12} />
                                        Bạn không có quyền quản lý tuyến này
                                    </p>
                                </div>
                            )}
                        </div>
                        {canManageRoute(route) && (
                            <button
                                type="button"
                                className="mt-2 text-center text-xs text-blue-600 italic cursor-pointer hover:underline bg-transparent border-none w-full focus:outline-none"
                                onClick={(e) => {
                                    console.log('Popup text clicked for route:', route.id);
                                    e.preventDefault();
                                    onEdgeClick?.(route);
                                }}
                            >
                                Click để {route.isActive ? 'xem tác động' : 'kích hoạt lại'}
                            </button>
                        )}
                    </div>
                )
            };
        }).filter(Boolean) as MapPolyline[];
    }, [routes, markers, onEdgeClick]);

    return (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            {/* Legend - moved outside map container and increased z-index */}
            <div className="absolute top-4 right-4 z-[1000] bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg border border-slate-200 text-sm pointer-events-none">
                <div className="mb-3 pb-3 border-b border-slate-200">
                    <div className="font-medium text-slate-900 mb-2">Văn Phòng</div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-bold shadow">SH</div>
                        <span className="text-slate-700">System Hub</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center text-white text-[7px] font-bold shadow">H</div>
                        <span className="text-slate-700">Regional Hub</span>
                    </div>
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
                    <div className="font-medium text-slate-900 mb-2">Tuyến Đường</div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-slate-700">Hoạt động</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="text-slate-700">Gián đoạn</span>
                    </div>
                </div>

                {isHubAdmin && (
                    <div className="text-xs text-amber-700 bg-amber-50 p-2 rounded">
                        <div className="flex items-center gap-1 mb-1">
                            <Lock size={12} />
                            <span className="font-medium">Quyền Truy Cập</span>
                        </div>
                        <p>Bạn chỉ có thể quản lý tuyến liên quan đến HUB của mình</p>
                    </div>
                )}
            </div>

            <VietnamMap
                markers={markers}
                polylines={polylines}
                height="650px"
            />
        </div>
    );
}