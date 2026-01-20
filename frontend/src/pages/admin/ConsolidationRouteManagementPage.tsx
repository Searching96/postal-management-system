import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, RefreshCw, Info, LayoutList, Map as MapIcon } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { EmployeeMeResponse } from '../../models/user';
import {
    ConsolidationRoute,
    ConsolidationStatusResponse,
    CreateConsolidationRouteRequest,
    RouteLevel,
    getRouteLevelLabel,
    TemporaryReroute,
} from '../../models/consolidationRoute';
import {
    getAllConsolidationRoutes,
    createConsolidationRoute,
    activateConsolidationRoute,
    deactivateConsolidationRoute,
    getConsolidationRouteStatus,
} from '../../services/consolidationRouteService';
import {
    getAllProvinces,
    getHubWarehouses,
    getProvinceWarehouses,
    getWardOfficesByProvince,
} from '../../services/officeDataService';
import { HierarchicalRouteVisualization } from '../../components/admin/HierarchicalRouteVisualization';
import { ConsolidationRouteMap } from '../../components/admin/ConsolidationRouteMap';
import { CreateConsolidationRouteModal } from '../../components/admin/modals/CreateConsolidationRouteModal';
import { RerouteModal } from '../../components/admin/modals/RerouteModal';

export function ConsolidationRouteManagementPage() {
    const { user: currentUser } = useAuth();
    const [routes, setRoutes] = useState<ConsolidationRoute[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<ConsolidationRoute | null>(null);
    const [routeStatus, setRouteStatus] = useState<ConsolidationStatusResponse | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createRouteLevel, setCreateRouteLevel] = useState<RouteLevel | null>(null);
    const [showRerouteModal, setShowRerouteModal] = useState(false);
    const [rerouteTargets, setRerouteTargets] = useState<any[]>([]);
    const [rerouteLoading, setRerouteLoading] = useState(false);

    // Data options from API
    const [provinces, setProvinces] = useState<any[]>([]);
    const [warehouses, setWarehouses] = useState<any[]>([]);

    useEffect(() => {
        loadAllData();
    }, []);

    useEffect(() => {
        if (selectedRoute) {
            loadRouteStatus(selectedRoute.id);
        }
    }, [selectedRoute]);

    async function loadAllData() {
        try {
            setLoading(true);
            setError(null);

            // Load routes
            const routesData = await getAllConsolidationRoutes();
            setRoutes(routesData);

            // Load provinces and warehouses
            const provincesData = await getAllProvinces();
            setProvinces(provincesData);

            // Load all warehouses (both hub and province)
            const [hubWarehouses, provinceWarehouses] = await Promise.all([
                getHubWarehouses(),
                getProvinceWarehouses(),
            ]);
            setWarehouses([...hubWarehouses, ...provinceWarehouses]);
        } catch (err: any) {
            console.error('Error loading data:', err);
            setError('Không thể tải dữ liệu. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }

    async function loadRoutes() {
        try {
            const data = await getAllConsolidationRoutes();
            setRoutes(data);
            setError(null);
        } catch (err: any) {
            setError('Không thể tải dữ liệu tuyến đường');
            console.error(err);
        }
    }

    async function loadRouteStatus(routeId: string) {
        try {
            const status = await getConsolidationRouteStatus(routeId);
            setRouteStatus(status);
        } catch (err) {
            console.error(err);
        }
    }

    async function handleCreateRoute(level: RouteLevel) {
        setCreateRouteLevel(level);
        setShowCreateModal(true);
    }

    async function handleFetchWardOffices(provinceCode: string) {
        try {
            console.log('Fetching ward offices for province:', provinceCode);
            const wardOffices = await getWardOfficesByProvince(provinceCode);
            console.log('Ward offices received:', wardOffices);
            console.log('Ward offices count:', wardOffices.length);
            return wardOffices;
        } catch (err) {
            console.error('Error fetching ward offices:', err);
            return [];
        }
    }

    async function handleSubmitCreate(request: CreateConsolidationRouteRequest) {
        try {
            const newRoute = await createConsolidationRoute(request);
            setRoutes([...routes, newRoute]);
            setError(null);
        } catch (err: any) {
            throw err;
        }
    }

    async function handleDeactivateRoute() {
        if (!selectedRoute) return;

        try {
            // Load available reroute targets
            setRerouteLoading(true);
            // In real app: const targets = await getRerouteTargets(selectedRoute.id);
            // For now, show available routes
            const availableTargets = routes
                .filter((r) => r.id !== selectedRoute.id && r.status.isActive)
                .map((r) => ({
                    routeId: r.id,
                    routeName: r.name,
                    level: 'SAME' as const,
                    capacity: {
                        currentOrderCount: 0,
                        maxOrders: r.capacity.maxOrders || 100,
                    },
                }));
            setRerouteTargets(availableTargets);
            setShowRerouteModal(true);
        } finally {
            setRerouteLoading(false);
        }
    }

    async function handleSubmitReroute(reroute: TemporaryReroute) {
        if (!selectedRoute) return;

        try {
            await deactivateConsolidationRoute(selectedRoute.id, reroute);
            // Update route to inactive
            setRoutes(
                routes.map((r) =>
                    r.id === selectedRoute.id
                        ? { ...r, status: { ...r.status, isActive: false } }
                        : r
                )
            );
            setSelectedRoute(null);
            setShowRerouteModal(false);
        } catch (err: any) {
            throw err;
        }
    }

    async function handleActivateRoute() {
        if (!selectedRoute) return;

        try {
            const updated = await activateConsolidationRoute(selectedRoute.id);
            setRoutes(routes.map((r) => (r.id === selectedRoute.id ? updated : r)));
            setSelectedRoute(null);
        } catch (err) {
            setError('Lỗi khi kích hoạt tuyến');
            console.error(err);
        }
    }

    if (!currentUser || !('office' in currentUser)) {
        return (
            <div className="p-6 text-center text-gray-500">
                Vui lòng đăng nhập với tài khoản nhân viên
            </div>
        );
    }

    const employeeUser = currentUser as EmployeeMeResponse;

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tuyến Đường Phân Cấp</h1>
                    <p className="text-gray-600 mt-1">
                        Tổng cộng: {routes.length} tuyến ({routes.filter((r) => r.status.isActive).length} hoạt động)
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* View Mode Toggle */}
                    <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <LayoutList className="w-4 h-4" />
                            List
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                viewMode === 'map'
                                    ? 'bg-blue-600 text-white'
                                    : 'text-gray-700 hover:bg-gray-100'
                            }`}
                        >
                            <MapIcon className="w-4 h-4" />
                            Map
                        </button>
                    </div>

                    <button
                        onClick={loadRoutes}
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Làm mới
                    </button>
                </div>
            </div>

            {/* Error message */}
            {error && (
                <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            )}

            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Route Visualization (List or Map) */}
                    <div className="lg:col-span-2">
                        {viewMode === 'list' ? (
                            <HierarchicalRouteVisualization
                                routes={routes}
                                currentUser={employeeUser}
                                selectedRoute={selectedRoute}
                                onSelectRoute={setSelectedRoute}
                                onCreateRoute={handleCreateRoute}
                            />
                        ) : (
                            <ConsolidationRouteMap
                                routes={routes}
                                selectedRoute={selectedRoute}
                                onRouteClick={setSelectedRoute}
                            />
                        )}
                    </div>

                    {/* Right: Route Details */}
                    <div>
                        {selectedRoute ? (
                            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                <div className="bg-gray-50 p-4 border-b border-gray-200">
                                    <h3 className="font-semibold text-gray-900">{selectedRoute.name}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {getRouteLevelLabel(
                                            selectedRoute.routeStops.length > 0
                                                ? RouteLevel.WARD
                                                : RouteLevel.PROVINCE
                                        )}
                                    </p>
                                </div>

                                <div className="p-4 space-y-4">
                                    {/* Status */}
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 mb-1">Trạng thái</p>
                                        <div
                                            className={`inline-flex items-center gap-2 px-3 py-1 rounded text-sm font-medium ${
                                                selectedRoute.status.isActive
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-600'
                                            }`}
                                        >
                                            <div
                                                className={`w-2 h-2 rounded-full ${
                                                    selectedRoute.status.isActive
                                                        ? 'bg-green-600'
                                                        : 'bg-gray-400'
                                                }`}
                                            />
                                            {selectedRoute.status.isActive ? 'Hoạt động' : 'Không hoạt động'}
                                        </div>
                                    </div>

                                    {/* Consolidation Status */}
                                    {routeStatus && (
                                        <>
                                            <div>
                                                <p className="text-xs uppercase text-gray-500 mb-2">Trạng thái tập kết</p>
                                                <div className="space-y-2">
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Đơn đang chờ:</span>
                                                        <span className="font-medium">{routeStatus.pendingOrderCount}</span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-sm text-gray-600">Trọng lượng:</span>
                                                        <span className="font-medium">
                                                            {routeStatus.pendingWeightKg.toFixed(2)} kg
                                                        </span>
                                                    </div>
                                                    <div
                                                        className={`p-2 rounded text-sm ${
                                                            routeStatus.canConsolidate
                                                                ? 'bg-green-50 text-green-700'
                                                                : 'bg-amber-50 text-amber-700'
                                                        }`}
                                                    >
                                                        {routeStatus.canConsolidate ? (
                                                            <>
                                                                <p className="font-medium">Sẵn sàng tập kết</p>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <p className="font-medium">Chưa sẵn sàng</p>
                                                                {routeStatus.consolidationBlockReason && (
                                                                    <p className="text-xs mt-1">
                                                                        {routeStatus.consolidationBlockReason}
                                                                    </p>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    {/* Destination */}
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 mb-1">Kho đích</p>
                                        <p className="text-sm text-gray-900 font-medium">
                                            {selectedRoute.destinationWarehouse.name}
                                        </p>
                                        <p className="text-xs text-gray-600">{selectedRoute.destinationWarehouse.code}</p>
                                    </div>

                                    {/* Capacity */}
                                    <div>
                                        <p className="text-xs uppercase text-gray-500 mb-2">Dung lượng</p>
                                        <div className="space-y-1 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Trọng lượng tối đa:</span>
                                                <span className="font-medium">
                                                    {selectedRoute.capacity.maxWeightKg} kg
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Đơn tối đa:</span>
                                                <span className="font-medium">
                                                    {selectedRoute.capacity.maxOrders} đơn
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-4 border-t border-gray-200 space-y-2">
                                        {selectedRoute.status.isActive ? (
                                            <button
                                                onClick={handleDeactivateRoute}
                                                disabled={rerouteLoading}
                                                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium"
                                            >
                                                {rerouteLoading ? (
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        Đang tải...
                                                    </div>
                                                ) : (
                                                    'Vô hiệu hóa'
                                                )}
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleActivateRoute}
                                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                                            >
                                                Kích hoạt
                                            </button>
                                        )}
                                    </div>

                                    {/* Last Update */}
                                    {selectedRoute.status.lastConsolidationAt && (
                                        <div className="p-2 bg-blue-50 rounded text-xs text-blue-700">
                                            <p>Tập kết lần cuối: {new Date(selectedRoute.status.lastConsolidationAt).toLocaleString('vi-VN')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center text-gray-500">
                                <Info className="w-8 h-8 mx-auto mb-2 opacity-30" />
                                <p>Chọn một tuyến để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Modals */}
            <CreateConsolidationRouteModal
                isOpen={showCreateModal}
                routeLevel={createRouteLevel || RouteLevel.WARD}
                onClose={() => {
                    setShowCreateModal(false);
                    setCreateRouteLevel(null);
                }}
                onSubmit={handleSubmitCreate}
                onFetchWardOffices={handleFetchWardOffices}
                provinces={provinces}
                warehouses={warehouses}
            />

            <RerouteModal
                isOpen={showRerouteModal}
                route={selectedRoute}
                availableTargets={rerouteTargets}
                onClose={() => setShowRerouteModal(false)}
                onSubmit={handleSubmitReroute}
                loading={rerouteLoading}
            />
        </div>
    );
}
