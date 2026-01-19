import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { createRoute, type RouteType, type CreateTransferRouteRequest } from '../../../services/routeService';
import { useAuth } from '../../../lib/AuthContext';
import type { EmployeeMeResponse } from '../../../models/user';

interface Location {
    id: string;
    name: string;
    type: 'PROVINCE_WAREHOUSE' | 'HUB' | 'SYSTEM_HUB';
    parentOfficeId?: string;
}

interface CreateTransferRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    filterRouteType?: RouteType;
    availableLocations: Location[];
}

export function CreateTransferRouteModal({
    isOpen,
    onClose,
    onSuccess,
    filterRouteType = 'HUB_TO_HUB',
    availableLocations,
}: CreateTransferRouteModalProps) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [fromLocationId, setFromLocationId] = useState('');
    const [toLocationId, setToLocationId] = useState('');
    const [distanceKm, setDistanceKm] = useState('');
    const [transitHours, setTransitHours] = useState('');
    const [priority, setPriority] = useState('1');
    const [isActive, setIsActive] = useState(true);

    const employeeUser = user as EmployeeMeResponse;
    const isHubAdmin = employeeUser?.role === 'HUB_ADMIN';
    const isSystemAdmin = employeeUser?.role === 'SYSTEM_ADMIN';
    // const isNationalManager = employeeUser?.role === 'NATIONAL_MANAGER';
    const userHubId = employeeUser?.office?.id;

    // Get filtered locations based on route type and user role
    const getFromLocations = (): Location[] => {
        let locations: Location[] = [];

        if (filterRouteType === 'PROVINCE_TO_HUB') {
            locations = availableLocations.filter(loc => loc.type === 'PROVINCE_WAREHOUSE');

            // For PROVINCE_TO_HUB, HUB_ADMIN collects from provinces
            // Restrict to provinces that report to this HUB (parentOfficeId check)
            if (isHubAdmin && !isSystemAdmin) {
                // Ensure we compare strings properly. userHubId should be defined if isHubAdmin is true
                if (userHubId) {
                    locations = locations.filter(loc => loc.parentOfficeId === userHubId);
                }
            }
        } else {
            // HUB_TO_HUB
            locations = availableLocations.filter(loc => loc.type === 'HUB' || loc.type === 'SYSTEM_HUB');

            // For HUB_TO_HUB, HUB_ADMIN can only create routes starting active FROM their hub
            if (isHubAdmin && !isSystemAdmin) {
                locations = locations.filter(loc => loc.id === userHubId);
            }
        }

        return locations;
    };

    const getToLocations = (): Location[] => {
        let locations: Location[] = [];

        if (filterRouteType === 'PROVINCE_TO_HUB') {
            locations = availableLocations.filter(loc => loc.type === 'HUB' || loc.type === 'SYSTEM_HUB');

            // For PROVINCE_TO_HUB, the destination meant to be the admin's hub
            if (isHubAdmin && !isSystemAdmin) {
                locations = locations.filter(loc => loc.id === userHubId);
            }
        } else {
            // HUB_TO_HUB
            locations = availableLocations.filter(loc => loc.type === 'HUB' || loc.type === 'SYSTEM_HUB');
            // No specific restriction on TO for HUB_TO_HUB (can send to anywhere)
        }
        return locations;
    };

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFromLocationId('');
            setToLocationId('');
            setDistanceKm('');
            setTransitHours('');
            setPriority('1');
            setIsActive(true);
            setError(null);
        }
    }, [isOpen]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError(null);

        if (!fromLocationId || !toLocationId) {
            setError('Vui lòng chọn điểm xuất phát và điểm đích');
            return;
        }

        if (fromLocationId === toLocationId) {
            setError('Điểm xuất phát và điểm đích phải khác nhau');
            return;
        }

        setLoading(true);
        try {
            const request: CreateTransferRouteRequest = {
                routeType: filterRouteType,
                fromHubId: fromLocationId,
                toHubId: toLocationId,
                distanceKm: distanceKm ? parseInt(distanceKm) : undefined,
                transitHours: transitHours ? parseInt(transitHours) : undefined,
                priority: parseInt(priority),
                isActive,
            };

            await createRoute(request);
            onSuccess();
            onClose();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : 'Không thể tạo tuyến đường'
            );
        } finally {
            setLoading(false);
        }
    }

    if (!isOpen) return null;

    const fromLocations = getFromLocations();
    const toLocations = getToLocations();

    const getFromLabel = (): string => {
        if (filterRouteType === 'PROVINCE_TO_HUB') {
            return 'Kho Tỉnh';
        }
        return 'Hub Nguồn';
    };

    const getToLabel = (): string => {
        if (filterRouteType === 'PROVINCE_TO_HUB') {
            return 'Hub Đích';
        }
        return 'Hub Đích';
    };

    const getRouteTypeLabel = (): string => {
        if (filterRouteType === 'PROVINCE_TO_HUB') {
            return 'Tuyến Trung Chuyển (Tỉnh ↔ Hub)';
        }
        return 'Tuyến Liên Kho (Hub ↔ Hub)';
    };

    const showAuthWarning = isHubAdmin && getFromLocations().length === 0;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Tạo Tuyến Đường Mới</h2>
                        <p className="text-sm text-gray-500 mt-1">{getRouteTypeLabel()}</p>
                        <p className="text-xs text-blue-600 mt-1">✓ Tạo cả tuyến đi và về</p>
                        {isHubAdmin && (
                            <p className="text-xs text-amber-600 mt-1">
                                ⓘ HUB_ADMIN chỉ có thể tạo tuyến từ HUB của mình
                            </p>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {showAuthWarning && (
                    <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div className="text-amber-700 text-sm">
                            <p className="font-medium">Không có quyền</p>
                            <p>Bạn chỉ có thể quản lý tuyến từ HUB của mình: <strong>{employeeUser?.office?.name}</strong></p>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* From Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {getFromLabel()} *
                        </label>
                        <select
                            value={fromLocationId}
                            onChange={(e) => setFromLocationId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">-- Chọn {getFromLabel().toLowerCase()} --</option>
                            {fromLocations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* To Location */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {getToLabel()} *
                        </label>
                        <select
                            value={toLocationId}
                            onChange={(e) => setToLocationId(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        >
                            <option value="">-- Chọn {getToLabel().toLowerCase()} --</option>
                            {toLocations.map((loc) => (
                                <option key={loc.id} value={loc.id}>
                                    {loc.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Distance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Khoảng Cách (km)
                        </label>
                        <input
                            type="number"
                            value={distanceKm}
                            onChange={(e) => setDistanceKm(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    {/* Transit Hours */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Thời Gian Vận Chuyển (giờ)
                        </label>
                        <input
                            type="number"
                            value={transitHours}
                            onChange={(e) => setTransitHours(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            placeholder="0"
                            min="0"
                        />
                    </div>

                    {/* Priority */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mức Ưu Tiên (thấp hơn = ưu tiên hơn)
                        </label>
                        <input
                            type="number"
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            min="1"
                        />
                    </div>

                    {/* Active Status */}
                    <div>
                        <label className="flex items-center">
                            <input
                                type="checkbox"
                                checked={isActive}
                                onChange={(e) => setIsActive(e.target.checked)}
                                className="rounded border-gray-300"
                            />
                            <span className="ml-2 text-sm font-medium text-gray-700">
                                Kích Hoạt Ngay
                            </span>
                        </label>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 text-white bg-primary-600 hover:bg-primary-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tạo Tuyến Đường
                        </button>
                    </div>
                </form>
            </div>
        </div>,
        document.body
    );
}
