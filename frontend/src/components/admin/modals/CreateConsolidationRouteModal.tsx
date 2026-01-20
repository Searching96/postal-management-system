import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Loader2, AlertCircle } from 'lucide-react';
import {
    ConsolidationRoute,
    CreateConsolidationRouteRequest,
    RouteLevel,
    RouteStop,
} from '../../../models/consolidationRoute';
import { useAuth } from '../../../lib/AuthContext';
import type { EmployeeMeResponse } from '../../../models/user';

interface CreateConsolidationRouteModalProps {
    isOpen: boolean;
    routeLevel: RouteLevel;
    onClose: () => void;
    onSubmit: (request: CreateConsolidationRouteRequest) => Promise<void>;
    onFetchWardOffices?: (provinceCode: string) => Promise<any[]>;
    provinces?: any[];
    warehouses?: any[];
}

export function CreateConsolidationRouteModal({
    isOpen,
    routeLevel,
    onClose,
    onSubmit,
    onFetchWardOffices,
    provinces = [],
    warehouses = [],
}: CreateConsolidationRouteModalProps) {
    const { user } = useAuth();
    const [formData, setFormData] = useState<CreateConsolidationRouteRequest>({
        name: '',
        provinceCode: '',
        destinationWarehouseId: '',
        routeStops: [],
        maxWeightKg: 500,
        maxOrders: 100,
        isActive: true,
    });

    const [stops, setStops] = useState<RouteStop[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fetchingWardOffices, setFetchingWardOffices] = useState(false);
    const [availableWardOffices, setAvailableWardOffices] = useState<any[]>([]);

    const employeeUser = user as EmployeeMeResponse;
    const isProvinceAdmin = ['PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN'].includes(employeeUser?.role);
    const isSystemAdmin = employeeUser?.role === 'SYSTEM_ADMIN';
    const userProvinceCode = employeeUser?.office?.province?.code;

    // Filter provinces based on role
    const getAvailableProvinces = () => {
        if (isProvinceAdmin && !isSystemAdmin) {
            return provinces.filter(p => p.code === userProvinceCode);
        }
        return provinces;
    };

    // Get available warehouses for province admin (should be just one)
    const getAvailableWarehouses = () => {
        if (isProvinceAdmin && !isSystemAdmin && userProvinceCode) {
            // Filter to only show warehouses in the user's province
            return warehouses.filter(w =>
                w.type === 'PROVINCE_WAREHOUSE' &&
                (w.provinceCode === userProvinceCode || w.code?.includes(userProvinceCode))
            );
        }
        return warehouses;
    };

    // Auto-select user's province and warehouse if they're a PROVINCE_ADMIN
    useEffect(() => {
        if (isProvinceAdmin && !isSystemAdmin && userProvinceCode && isOpen) {
            // Auto-select province
            if (!formData.provinceCode) {
                setFormData(prev => ({ ...prev, provinceCode: userProvinceCode }));
            }

            // Auto-select warehouse (there should be only one for province admin)
            const provinceWarehouses = warehouses.filter(w =>
                w.type === 'PROVINCE_WAREHOUSE' &&
                (w.provinceCode === userProvinceCode || w.code?.includes(userProvinceCode))
            );
            if (provinceWarehouses.length === 1 && !formData.destinationWarehouseId) {
                setFormData(prev => ({ ...prev, destinationWarehouseId: provinceWarehouses[0].id }));
            }
        }
    }, [isProvinceAdmin, isSystemAdmin, userProvinceCode, warehouses, isOpen]);

    // Fetch ward offices when province changes
    useEffect(() => {
        if (formData.provinceCode && routeLevel === RouteLevel.WARD && onFetchWardOffices && isOpen) {
            const fetchWardOffices = async () => {
                setFetchingWardOffices(true);
                try {
                    const wardOfficesData = await onFetchWardOffices(formData.provinceCode);
                    setAvailableWardOffices(wardOfficesData);
                } catch (err) {
                    console.error('Error fetching ward offices:', err);
                    setAvailableWardOffices([]);
                } finally {
                    setFetchingWardOffices(false);
                }
            };
            fetchWardOffices();
        }
    }, [formData.provinceCode, routeLevel, onFetchWardOffices, isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                name: '',
                provinceCode: '',
                destinationWarehouseId: '',
                routeStops: [],
                maxWeightKg: 500,
                maxOrders: 100,
                isActive: true,
            });
            setStops([]);
            setAvailableWardOffices([]);
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleProvinceChange = (provinceCode: string) => {
        setFormData({ ...formData, provinceCode });
        // Ward offices will be fetched automatically by useEffect
    };

    const handleAddStop = () => {
        setStops([
            ...stops,
            {
                wardCode: '',
                wardOfficeName: '',
                order: stops.length + 1,
                distanceKm: undefined,
            },
        ]);
    };

    const handleRemoveStop = (index: number) => {
        setStops(stops.filter((_, i) => i !== index));
    };

    const handleStopChange = (index: number, field: keyof RouteStop, value: any) => {
        const newStops = [...stops];
        (newStops[index] as any)[field] = value;
        setStops(newStops);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (!formData.name || !formData.name.trim()) {
            setError('Tên tuyến là bắt buộc');
            return;
        }

        if (!formData.destinationWarehouseId) {
            setError('Vui lòng chọn kho đích');
            return;
        }

        if (!formData.maxWeightKg || formData.maxWeightKg <= 0) {
            setError('Dung lượng tối đa phải lớn hơn 0');
            return;
        }

        if (!formData.maxOrders || formData.maxOrders <= 0) {
            setError('Số đơn hàng tối đa phải lớn hơn 0');
            return;
        }

        // Route-level specific validation
        if (routeLevel === RouteLevel.WARD) {
            if (!formData.provinceCode || formData.provinceCode.trim() === '') {
                setError('Vui lòng chọn tỉnh');
                return;
            }

            if (!stops || stops.length === 0) {
                setError('Phải có ít nhất một điểm dừng (phường)');
                return;
            }

            const invalidStop = stops.find((s) => !s.wardCode || !s.wardCode.trim() || !s.wardOfficeName || !s.wardOfficeName.trim());
            if (invalidStop) {
                setError('Tất cả điểm dừng phải có mã phường và tên');
                return;
            }
        }

        try {
            setLoading(true);

            // Build request based on route level
            const request: CreateConsolidationRouteRequest = {
                name: formData.name,
                destinationWarehouseId: formData.destinationWarehouseId,
                maxWeightKg: formData.maxWeightKg,
                maxVolumeCm3: formData.maxVolumeCm3,
                maxOrders: formData.maxOrders,
                isActive: formData.isActive,
                // Only include these for WARD level routes
                ...(routeLevel === RouteLevel.WARD && {
                    provinceCode: formData.provinceCode,
                    routeStops: stops,
                }),
                // For non-WARD routes, don't include province or stops
                ...(routeLevel !== RouteLevel.WARD && {
                    provinceCode: '',  // Backend will determine province from destination
                    routeStops: [],
                }),
            };

            await onSubmit(request);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi tạo tuyến');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (routeLevel) {
            case RouteLevel.WARD:
                return 'Tạo Tuyến Tập Kết (Phường → Tỉnh)';
            case RouteLevel.PROVINCE:
                return 'Tạo Tuyến Trung Chuyển (Tỉnh → Hub)';
            case RouteLevel.HUB:
                return 'Tạo Tuyến Liên Kho';
            case RouteLevel.DIRECT_HUB:
                return 'Tạo Tuyến Trực Tiếp (Hub → Hub)';
            default:
                return 'Tạo Tuyến Mới';
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">{getTitle()}</h2>
                        {isProvinceAdmin && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⓘ Bạn chỉ có thể quản lý tuyến trong tỉnh: <strong>{employeeUser?.office?.province?.name}</strong>
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Tên tuyến <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="VD: Tuyến tập kết 1 - TP HCM"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    {/* Province - WARD level only - Hidden for province admins */}
                    {routeLevel === RouteLevel.WARD && !isProvinceAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Tỉnh <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.provinceCode}
                                onChange={(e) => handleProvinceChange(e.target.value)}
                                disabled={loading || fetchingWardOffices}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                            >
                                <option value="">Chọn tỉnh...</option>
                                {getAvailableProvinces().map((p) => (
                                    <option key={p.code} value={p.code}>
                                        {p.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Destination Warehouse - Hidden for province admins (auto-selected) */}
                    {!isProvinceAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Kho đích <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={formData.destinationWarehouseId}
                                onChange={(e) => setFormData({ ...formData, destinationWarehouseId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="">Chọn kho...</option>
                                {warehouses.map((w) => (
                                    <option key={w.id} value={w.id}>
                                        {w.name} ({w.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Route Stops - WARD level only */}
                    {routeLevel === RouteLevel.WARD && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-900">
                                    Điểm dừng (Phường) <span className="text-red-500">*</span>
                                </label>
                                <button
                                    type="button"
                                    onClick={handleAddStop}
                                    disabled={loading}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                                >
                                    <Plus className="w-4 h-4" />
                                    Thêm điểm
                                </button>
                            </div>

                            <div className="space-y-3 max-h-64 overflow-y-auto">
                                {!formData.provinceCode && !isProvinceAdmin ? (
                                    <p className="text-sm text-amber-600 py-4 px-3 text-center bg-amber-50 rounded border border-amber-200">
                                        ⓘ Vui lòng chọn tỉnh trước để tải danh sách bưu cục phường
                                    </p>
                                ) : fetchingWardOffices ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 text-blue-600 animate-spin mr-2" />
                                        <span className="text-sm text-gray-600">Đang tải danh sách bưu cục...</span>
                                    </div>
                                ) : availableWardOffices.length === 0 ? (
                                    <div className="text-sm text-red-600 py-4 px-3 text-center bg-red-50 rounded border border-red-200">
                                        <p className="font-medium mb-2">⚠ Không tìm thấy bưu cục phường hợp lệ</p>
                                        <p className="text-xs text-red-500">
                                            Bưu cục phường (WARD_POST) cần có mã phường (wardCode) được gán để có thể sử dụng trong tuyến tập kết.
                                            Vui lòng kiểm tra và cập nhật dữ liệu bưu cục.
                                        </p>
                                    </div>
                                ) : stops.length === 0 ? (
                                    <p className="text-sm text-gray-500 py-4 text-center">
                                        Có {availableWardOffices.length} bưu cục phường. Nhấn "Thêm điểm" để bắt đầu.
                                    </p>
                                ) : (
                                    stops.map((stop, index) => (
                                        <div key={index} className="flex gap-2 items-start p-3 border border-gray-200 rounded-lg bg-gray-50">
                                            <div className="flex-1 space-y-2">
                                                <div>
                                                    <label className="block text-xs text-gray-600 mb-1">
                                                        Bưu Cục Phường <span className="text-red-500">*</span>
                                                    </label>
                                                    <select
                                                        value={stop.wardCode || ''}
                                                        onChange={(e) => {
                                                            const selectedOffice = availableWardOffices.find(
                                                                (o) => (o.wardCode || o.id) === e.target.value
                                                            );
                                                            if (selectedOffice) {
                                                                handleStopChange(index, 'wardCode', selectedOffice.wardCode || selectedOffice.id || '');
                                                                handleStopChange(index, 'wardOfficeName', selectedOffice.name);
                                                            }
                                                        }}
                                                        disabled={availableWardOffices.length === 0 || fetchingWardOffices}
                                                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white"
                                                    >
                                                        <option value="">
                                                            {fetchingWardOffices
                                                                ? 'Đang tải bưu cục...'
                                                                : availableWardOffices.length === 0
                                                                ? 'Không có bưu cục phường'
                                                                : `Chọn bưu cục (${availableWardOffices.length} có sẵn)...`}
                                                        </option>
                                                        {availableWardOffices.map((office) => (
                                                            <option key={office.id} value={office.wardCode || office.id}>
                                                                {office.name} {office.wardCode ? `(${office.wardCode})` : ''}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    {stop.wardCode && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            Mã: {stop.wardCode}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Thứ tự</label>
                                                        <input
                                                            type="number"
                                                            value={stop.order}
                                                            onChange={(e) =>
                                                                handleStopChange(index, 'order', parseInt(e.target.value))
                                                            }
                                                            min="1"
                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs text-gray-600 mb-1">Khoảng cách (km)</label>
                                                        <input
                                                            type="number"
                                                            value={stop.distanceKm || ''}
                                                            onChange={(e) =>
                                                                handleStopChange(
                                                                    index,
                                                                    'distanceKm',
                                                                    e.target.value ? parseInt(e.target.value) : undefined
                                                                )
                                                            }
                                                            placeholder="Tùy chọn"
                                                            className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStop(index)}
                                                disabled={loading}
                                                className="mt-0 p-1.5 text-red-600 hover:bg-red-50 rounded disabled:opacity-50"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Capacity */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Dung lượng tối đa (kg) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.maxWeightKg}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxWeightKg: parseInt(e.target.value) })
                                }
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 mb-1">
                                Số đơn tối đa <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                value={formData.maxOrders}
                                onChange={(e) =>
                                    setFormData({ ...formData, maxOrders: parseInt(e.target.value) })
                                }
                                min="1"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Active */}
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isActive"
                            checked={formData.isActive ?? true}
                            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                            disabled={loading}
                            className="w-4 h-4"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                            Hoạt động ngay khi tạo
                        </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tạo Tuyến
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
