import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Circle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { ConsolidationRoute, RouteLevel, getRouteLevelLabel } from '../../models/consolidationRoute';
import { EmployeeMeResponse } from '../../models/user';
import { getAccessibleRouteLevels, getCreatableRouteLevel } from '../../models/consolidationRoute';

interface HierarchicalRouteVisualizationProps {
    routes: ConsolidationRoute[];
    currentUser: EmployeeMeResponse;
    selectedRoute?: ConsolidationRoute | null;
    onSelectRoute?: (route: ConsolidationRoute) => void;
    onCreateRoute?: (level: RouteLevel) => void;
}

interface ExpandedState {
    [key: string]: boolean;
}

export function HierarchicalRouteVisualization({
    routes,
    currentUser,
    selectedRoute,
    onSelectRoute,
    onCreateRoute,
}: HierarchicalRouteVisualizationProps) {
    const [expanded, setExpanded] = useState<ExpandedState>({});

    const userOfficeType = currentUser.office?.type as any;
    const accessibleLevels = useMemo(
        () => getAccessibleRouteLevels(userOfficeType),
        [userOfficeType]
    );
    const creatableLevel = useMemo(
        () => getCreatableRouteLevel(userOfficeType),
        [userOfficeType]
    );

    // Filter routes by accessible levels
    const groupedRoutes = useMemo(() => {
        const grouped: Record<string, ConsolidationRoute[]> = {
            [RouteLevel.WARD]: [],
            [RouteLevel.PROVINCE]: [],
            [RouteLevel.HUB]: [],
            [RouteLevel.DIRECT_HUB]: [],
        };

        routes.forEach((route) => {
            // Determine route level based on warehouse type
            const level = determineRouteLevel(route);

            // Only show if user has access to this level
            if (accessibleLevels.includes(level)) {
                grouped[level].push(route);
            }
        });

        return grouped;
    }, [routes, accessibleLevels]);

    const toggleExpanded = (key: string) => {
        setExpanded((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    return (
        <div className="space-y-6">
            {/* Title and user level info */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Quản lý Tuyến Đường Phân Cấp</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Cơ sở: {currentUser.office?.name} ({userOfficeType})
                </p>
                {creatableLevel && (
                    <p className="text-sm text-blue-600 mt-2">
                        Bạn có thể tạo: <span className="font-medium">{getRouteLevelLabel(creatableLevel)}</span>
                    </p>
                )}
            </div>

            {/* Route hierarchy sections */}
            <div className="space-y-3">
                {Object.entries(groupedRoutes).map(([levelKey, levelRoutes]) => {
                    const level = levelKey as RouteLevel;
                    const hasRoutes = levelRoutes.length > 0;
                    const canCreate = creatableLevel === level;
                    const isExpanded = expanded[level] ?? true;

                    if (!accessibleLevels.includes(level) && !canCreate) {
                        return null;
                    }

                    return (
                        <div key={level} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                            {/* Header */}
                            <button
                                onClick={() => toggleExpanded(level)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-center gap-3 flex-1">
                                    {hasRoutes && (
                                        isExpanded ? (
                                            <ChevronDown className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-gray-400" />
                                        )
                                    )}
                                    {!hasRoutes && <div className="w-5" />}
                                    <div className="text-left">
                                        <p className="font-semibold text-gray-900">
                                            {getRouteLevelLabel(level)}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {hasRoutes ? `${levelRoutes.length} tuyến` : 'Không có tuyến'}
                                        </p>
                                    </div>
                                </div>

                                {canCreate && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateRoute?.(level);
                                        }}
                                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    >
                                        + Tạo
                                    </button>
                                )}
                            </button>

                            {/* Route list */}
                            {isExpanded && hasRoutes && (
                                <div className="border-t border-gray-200 divide-y divide-gray-100">
                                    {levelRoutes.map((route) => (
                                        <RouteItem
                                            key={route.id}
                                            route={route}
                                            isSelected={selectedRoute?.id === route.id}
                                            onSelect={onSelectRoute}
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Empty state */}
                            {isExpanded && !hasRoutes && (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    Chưa có tuyến nào ở cấp độ này
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

interface RouteItemProps {
    route: ConsolidationRoute;
    isSelected: boolean;
    onSelect?: (route: ConsolidationRoute) => void;
}

function RouteItem({ route, isSelected, onSelect }: RouteItemProps) {
    const level = determineRouteLevel(route);

    return (
        <button
            onClick={() => onSelect?.(route)}
            className={`w-full text-left p-4 hover:bg-gray-50 transition-colors border-l-4 ${
                isSelected ? 'border-l-blue-600 bg-blue-50' : 'border-l-transparent'
            }`}
        >
            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 truncate">{route.name}</p>
                        <RouteStatusBadge isActive={route.status.isActive} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        {level === RouteLevel.WARD ? (
                            <>
                                Tỉnh: {route.province.name} • Kho đích: {route.destinationWarehouse.name}
                            </>
                        ) : (
                            <>
                                Kho: {route.destinationWarehouse.name}
                            </>
                        )}
                    </p>
                    {level === RouteLevel.WARD && route.routeStops.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">
                            Điểm dừng: {route.routeStops.map((s) => s.wardOfficeName).join(' → ')}
                        </p>
                    )}
                </div>

                <div className="ml-4 flex flex-col items-end gap-1 text-right">
                    <div className="flex items-center gap-2">
                        <div className="text-right">
                            <p className="text-sm font-medium text-gray-900">
                                {route.status.totalConsolidatedOrders}
                            </p>
                            <p className="text-xs text-gray-500">đơn tập kết</p>
                        </div>
                    </div>
                </div>
            </div>
        </button>
    );
}

function RouteStatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <div
            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
                isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-600'
            }`}
        >
            {isActive ? (
                <>
                    <Circle className="w-2 h-2 fill-current" />
                    Hoạt động
                </>
            ) : (
                <>
                    <Circle className="w-2 h-2 fill-current opacity-50" />
                    Không hoạt động
                </>
            )}
        </div>
    );
}

// Helper: Determine route level based on destination warehouse type
function determineRouteLevel(route: ConsolidationRoute): RouteLevel {
    const warehouseType = route.destinationWarehouse.code?.includes('HUB') ? 'HUB' : 'PROVINCE';

    // If it has ward stops, it's a consolidation route (WARD level)
    if (route.routeStops && route.routeStops.length > 0) {
        return RouteLevel.WARD;
    }

    // Otherwise it's a transfer/inter-hub route
    if (warehouseType === 'HUB') {
        return RouteLevel.HUB;
    }

    return RouteLevel.PROVINCE;
}
