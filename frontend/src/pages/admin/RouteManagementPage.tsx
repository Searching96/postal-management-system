import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    Route,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Power,
    PowerOff,
    Loader2,
    LayoutList,
    Map as MapIcon,
    Package
} from 'lucide-react';
import {
    getAllRoutes,
    previewDisableImpact,
    disableRoute,
    enableRoute,
    getActiveDisruptions,
    getDisruptionTypeLabel,
    type TransferRoute,
    type ReroutingImpact,
    type DisruptionType,
    type DisruptionResponse,
    type RouteType
} from '../../services/routeService';
import { RouteNetworkMap } from '../../components/admin/RouteNetworkMap';
import { CreateTransferRouteModal } from '../../components/admin/modals/CreateTransferRouteModal';
import { officeDataService } from '../../services/officeDataService';

interface Location {
    id: string;
    name: string;
    type: 'PROVINCE_WAREHOUSE' | 'HUB' | 'SYSTEM_HUB';
}

interface RouteManagementPageProps {
    filterRouteType?: RouteType;
}

export function RouteManagementPage({ filterRouteType }: RouteManagementPageProps) {
    const [routes, setRoutes] = useState<TransferRoute[]>([]);
    const [activeDisruptions, setActiveDisruptions] = useState<DisruptionResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');
    const [availableLocations, setAvailableLocations] = useState<Location[]>([]);

    // Modal state
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [showEnableModal, setShowEnableModal] = useState(false);
    const [showImpactModal, setShowImpactModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedRoute, setSelectedRoute] = useState<TransferRoute | null>(null);
    const [impact, setImpact] = useState<ReroutingImpact | null>(null);
    const [impactLoading, setImpactLoading] = useState(false);

    // Form state - MUST be declared before functions that use it
    const [disruptionType, setDisruptionType] = useState<DisruptionType>('ROAD_BLOCKED');
    const [reason, setReason] = useState('');
    const [expectedEndTime, setExpectedEndTime] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            setLoading(true);
            const [routesData, disruptionsData, hubsData, provinceWhData] = await Promise.all([
                getAllRoutes(),
                getActiveDisruptions(),
                officeDataService.getHubWarehouses(),
                officeDataService.getProvinceWarehouses()
            ]);
            setRoutes(routesData);
            setActiveDisruptions(disruptionsData);

            // Combine hubs and province warehouses with type information
            const locations: Location[] = [
                ...hubsData.map((h: any) => ({ id: h.id, name: h.name, type: h.type === 'SYSTEM_HUB' ? 'SYSTEM_HUB' as const : 'HUB' as const })),
                ...provinceWhData.map((w: any) => ({ id: w.id, name: w.name, type: 'PROVINCE_WAREHOUSE' as const }))
            ];
            setAvailableLocations(locations);
            setError(null);
        } catch (err) {
            setError('Không thể tải dữ liệu tuyến đường');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const getRouteTypeLabel = (): string => {
        if (filterRouteType === 'PROVINCE_TO_HUB') {
            return 'Tuyến Trung Chuyển (Tỉnh → Hub)';
        }
        return 'Tuyến Liên Kho (Hub → Hub)';
    };

    async function handlePreviewImpact(route: TransferRoute) {
        console.log('Opening impact modal for route:', route.id);
        setSelectedRoute(route);
        setShowImpactModal(true);
        setImpactLoading(true);
        try {
            const impactData = await previewDisableImpact(route.id);
            setImpact(impactData);
        } catch (err) {
            console.error(err);
            setImpact(null);
        } finally {
            setImpactLoading(false);
        }
    }

    function handleOpenEnableModal(route: TransferRoute) {
        setSelectedRoute(route);
        setShowEnableModal(true);
    }

    async function handleConfirmEnable() {
        if (!selectedRoute) return;

        setSubmitting(true);
        try {
            await enableRoute(selectedRoute.id);
            setShowEnableModal(false);
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Không thể kích hoạt tuyến đường');
        } finally {
            setSubmitting(false);
        }
    }

    function handleEdgeClick(route: TransferRoute) {
        console.log('handleEdgeClick triggered for:', route.id);
        if (route.isActive) {
            handlePreviewImpact(route);
        } else {
            handleOpenEnableModal(route);
        }
    }

    function handleOpenDisableModal(route: TransferRoute) {
        setSelectedRoute(route);
        setShowDisableModal(true);
        setDisruptionType('ROAD_BLOCKED');
        setReason('');
        setExpectedEndTime('');
    }

    async function handleDisableRoute() {
        if (!selectedRoute) return;

        setSubmitting(true);
        try {
            await disableRoute(selectedRoute.id, {
                disruptionType,
                reason: reason || undefined,
                expectedEndTime: expectedEndTime || undefined
            });
            setShowDisableModal(false);
            await loadData();
        } catch (err) {
            console.error(err);
            alert('Không thể vô hiệu hóa tuyến đường');
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
                <AlertTriangle className="w-6 h-6 inline mr-2" />
                {error}
            </div>
        );
    }

    // Filter routes by type if filterRouteType is provided
    const filteredRoutes = filterRouteType
        ? routes.filter(r => r.routeType === filterRouteType)
        : routes;

    const activeRoutes = filteredRoutes.filter(r => r.isActive);
    const disabledRoutes = filteredRoutes.filter(r => !r.isActive);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Tuyến đường</h1>
                    <p className="text-gray-500 mt-1">
                        {getRouteTypeLabel()}
                    </p>
                </div>
                <div className="flex gap-4 items-center">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="px-4 py-2 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
                    >
                        + Tạo Tuyến Đường
                    </button>
                    <div className="flex gap-2">
                        <div className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-medium text-sm flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {activeRoutes.length} Active
                        </div>
                        <div className="px-4 py-2 bg-red-100 text-red-800 rounded-lg font-medium text-sm flex items-center">
                            <XCircle className="w-4 h-4 mr-1" />
                            {disabledRoutes.length} Inactive
                        </div>
                    </div>
                    <div className="h-8 w-px bg-gray-300 mx-2"></div>
                    <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Danh sách"
                        >
                            <LayoutList className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('graph')}
                            className={`p-2 rounded-md transition-all ${viewMode === 'graph' ? 'bg-white shadow text-primary-600' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Bản đồ"
                        >
                            <MapIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Active Disruptions Alert */}
            {activeDisruptions.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-amber-800">
                                {activeDisruptions.length} gián đoạn đang hoạt động
                            </h3>
                            <ul className="mt-2 space-y-1">
                                {activeDisruptions.slice(0, 3).map(d => (
                                    <li key={d.id} className="text-sm text-amber-700">
                                        • {d.routeDescription}: {getDisruptionTypeLabel(d.disruptionType)}
                                        {d.reason && ` - ${d.reason}`}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {viewMode === 'graph' ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                    <RouteNetworkMap
                        routes={filteredRoutes}
                        onEdgeClick={handleEdgeClick}
                    />
                </div>
            ) : (
                /* Routes Table */
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Tuyến đường
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Loại
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Khoảng cách
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thời gian
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredRoutes.map(route => (
                                    <tr key={route.id} className={!route.isActive ? 'bg-red-50' : 'hover:bg-gray-50'}>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Route className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="font-medium text-gray-900 whitespace-nowrap">
                                                        {route.fromHubName} → {route.toHubName}
                                                    </p>
                                                    <p className="text-sm text-gray-500 truncate">
                                                        {route.fromRegionName} → {route.toRegionName}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">
                                            {route.routeType === 'PROVINCE_TO_HUB' ? (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                                                    Trung Chuyển
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Liên Kho
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            {route.distanceKm ? `${route.distanceKm} km` : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-gray-600 whitespace-nowrap">
                                            <Clock className="w-4 h-4 inline mr-1" />
                                            {route.transitHours ? `${route.transitHours} giờ` : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            {route.isActive ? (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                                    <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                                    Hoạt động
                                                </span>
                                            ) : (
                                                <div>
                                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 whitespace-nowrap">
                                                        <XCircle className="w-3 h-3 mr-1 flex-shrink-0" />
                                                        Tạm ngưng
                                                    </span>
                                                    {route.activeDisruption && (
                                                        <p className="text-xs text-red-600 mt-1">
                                                            {getDisruptionTypeLabel(route.activeDisruption.type)}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex justify-center">
                                                {route.isActive ? (
                                                    <button
                                                        onClick={() => handlePreviewImpact(route)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors whitespace-nowrap"
                                                        title="Vô hiệu hóa tuyến"
                                                    >
                                                        <PowerOff className="w-4 h-4" />
                                                        Vô hiệu hóa
                                                    </button>
                                                ) : (
                                                    <button
                                                        onClick={() => handleOpenEnableModal(route)}
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-green-600 bg-green-50 hover:bg-green-100 rounded-lg font-medium transition-colors whitespace-nowrap"
                                                        title="Kích hoạt lại tuyến"
                                                    >
                                                        <Power className="w-4 h-4" />
                                                        Kích hoạt
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Impact Preview Modal */}
            {showImpactModal && selectedRoute && createPortal(
                <div className="fixed inset-0 z-[2000] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowImpactModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 overflow-y-auto max-h-[90vh]">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Tác động khi vô hiệu hóa tuyến
                        </h3>
                        <p className="text-gray-600 mb-4">
                            {selectedRoute.fromHubName} → {selectedRoute.toHubName}
                        </p>

                        {impactLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
                            </div>
                        ) : impact ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500">Kiện hàng bị ảnh hưởng</p>
                                        <p className="text-2xl font-bold text-gray-900">{impact.affectedBatchCount}</p>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <p className="text-sm text-gray-500">Đơn hàng bị ảnh hưởng</p>
                                        <p className="text-2xl font-bold text-gray-900">{impact.affectedOrderCount}</p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-lg ${impact.hasAlternativeRoute ? 'bg-green-50' : 'bg-red-50'}`}>
                                    {impact.hasAlternativeRoute ? (
                                        <div className="flex items-start gap-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-green-800">Có tuyến thay thế</p>
                                                <p className="text-sm text-green-700">
                                                    {impact.alternativeRouteDescription}
                                                    {impact.additionalHours && ` (+${impact.additionalHours} giờ)`}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2">
                                            <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                                            <div>
                                                <p className="font-medium text-red-800">Không có tuyến thay thế</p>
                                                <p className="text-sm text-red-700">
                                                    Các kiện hàng sẽ bị đánh dấu là không thể định tuyến lại
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {impact.affectedBatches.length > 0 && (
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">Kiện hàng chi tiết:</p>
                                        <div className="max-h-40 overflow-y-auto space-y-2">
                                            {impact.affectedBatches.map(batch => (
                                                <div key={batch.batchId} className="flex items-center justify-between text-sm bg-gray-50 p-2 rounded">
                                                    <span className="font-mono">{batch.batchCode}</span>
                                                    <span className="flex items-center gap-1">
                                                        <Package className="w-3 h-3" />
                                                        {batch.orderCount} đơn
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-500">Không thể tải thông tin tác động</p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowImpactModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                            >
                                Đóng
                            </button>
                            <button
                                onClick={() => {
                                    setShowImpactModal(false);
                                    handleOpenDisableModal(selectedRoute);
                                }}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                            >
                                Tiếp tục vô hiệu hóa
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Disable Route Modal */}
            {showDisableModal && selectedRoute && createPortal(
                <div className="fixed inset-0 z-[2000] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowDisableModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">
                            Vô hiệu hóa tuyến đường
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {selectedRoute.fromHubName} → {selectedRoute.toHubName}
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Loại gián đoạn *
                                </label>
                                <select
                                    value={disruptionType}
                                    onChange={(e) => setDisruptionType(e.target.value as DisruptionType)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="ROAD_BLOCKED">Đường bị chặn</option>
                                    <option value="POLICY_CHANGE">Thay đổi chính sách</option>
                                    <option value="EMERGENCY">Khẩn cấp</option>
                                    <option value="MAINTENANCE">Bảo trì</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Lý do
                                </label>
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    placeholder="Mô tả lý do gián đoạn..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Dự kiến kết thúc
                                </label>
                                <input
                                    type="datetime-local"
                                    value={expectedEndTime}
                                    onChange={(e) => setExpectedEndTime(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                onClick={() => setShowDisableModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDisableRoute}
                                disabled={submitting}
                                className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Vô hiệu hóa
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Enable Route Modal */}
            {showEnableModal && selectedRoute && createPortal(
                <div className="fixed inset-0 z-[2000] flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowEnableModal(false)}
                    />
                    <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">
                                Kích hoạt lại tuyến đường
                            </h3>
                        </div>

                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn kích hoạt lại tuyến đường <br />
                            <span className="font-bold text-gray-900">{selectedRoute.fromHubName} → {selectedRoute.toHubName}</span>?
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowEnableModal(false)}
                                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                                disabled={submitting}
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmEnable}
                                disabled={submitting}
                                className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                Kích hoạt ngay
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* Create Transfer Route Modal */}
            <CreateTransferRouteModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => loadData()}
                filterRouteType={filterRouteType}
                availableLocations={availableLocations}
            />
        </div>
    );
}

export default RouteManagementPage;