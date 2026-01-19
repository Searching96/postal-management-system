import { useMemo } from 'react';
import { TransferRoute, getDisruptionTypeLabel } from '../../services/routeService';
import { VietnamMap, MapMarker, MapPolyline } from '../common/VietnamMap';
import { AlertTriangle, MapPin, Lock } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import type { EmployeeMeResponse } from '../../models/user';

interface RouteNetworkMapProps {
    routes: TransferRoute[];
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

// Fallback logic for unknown regions based on keywords
function getCoordinates(regionName: string, index: number): [number, number] {
    if (REGION_COORDINATES[regionName]) return REGION_COORDINATES[regionName];

    const name = regionName.toLowerCase();
    if (name.includes('núi phía bắc') || name.includes('tây bắc') || name.includes('đông bắc')) return [22.0, 104.0];
    if (name.includes('sông hồng') || name.includes('hà nội')) return [21.0, 106.0];
    if (name.includes('bắc trung bộ')) return [19.0, 105.5];
    if (name.includes('nam trung bộ') || name.includes('tây nguyên')) return [13.0, 108.0];
    if (name.includes('đông nam bộ') || name.includes('hồ chí minh')) return [11.0, 107.0];
    if (name.includes('sông cửu long')) return [9.5, 105.5];

    // Default fallback (ocean)
    return [16.0 + (index * 0.1), 110.0];
}

export function RouteNetworkMap({ routes, onEdgeClick }: RouteNetworkMapProps) {
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

    // Extract unique nodes (Hubs)
    const markers = useMemo<MapMarker[]>(() => {
        const uniqueHubs = new Map<string, { id: string, name: string, region: string }>();

        routes.forEach(route => {
            if (!uniqueHubs.has(route.fromHubId)) {
                uniqueHubs.set(route.fromHubId, {
                    id: route.fromHubId,
                    name: route.fromHubName,
                    region: route.fromRegionName || ''
                });
            }
            if (!uniqueHubs.has(route.toHubId)) {
                uniqueHubs.set(route.toHubId, {
                    id: route.toHubId,
                    name: route.toHubName,
                    region: route.toRegionName || ''
                });
            }
        });

        const nodeList = Array.from(uniqueHubs.values());

        return nodeList.map((node, index) => ({
            id: node.id,
            position: getCoordinates(node.region, index),
            popupContent: (
                <div className="p-1">
                    <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-primary-600" />
                        <h3 className="font-bold text-sm text-gray-900">{node.name}</h3>
                    </div>
                    <p className="text-xs text-gray-600">{node.region}</p>
                </div>
            )
        }));
    }, [routes]);

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
                    <div className="font-medium text-slate-900 mb-2">Tuyến Đường</div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-slate-700">Hoạt động</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="w-3 h-3 rounded-full bg-red-400"></span>
                        <span className="text-slate-700">Gián đoạn</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-blue-500" />
                        <span className="text-slate-700">Regional HUB</span>
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