import React, { useState } from 'react';
import { X, AlertCircle, Loader2 } from 'lucide-react';
import { ConsolidationRoute, RerouteTarget, TemporaryReroute } from '../../../models/consolidationRoute';

interface RerouteModalProps {
    isOpen: boolean;
    route: ConsolidationRoute | null;
    availableTargets: RerouteTarget[];
    onClose: () => void;
    onSubmit: (reroute: TemporaryReroute) => Promise<void>;
    loading?: boolean;
}

export function RerouteModal({
    isOpen,
    route,
    availableTargets,
    onClose,
    onSubmit,
    loading = false,
}: RerouteModalProps) {
    const [selectedTargetId, setSelectedTargetId] = useState<string>('');
    const [reason, setReason] = useState('');
    const [expectedEndTime, setExpectedEndTime] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    if (!isOpen || !route) return null;

    const selectedTarget = availableTargets.find((t) => t.routeId === selectedTargetId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!selectedTargetId) {
            setError('Vui lòng chọn tuyến đích');
            return;
        }

        if (!expectedEndTime) {
            setError('Vui lòng nhập thời gian dự kiến kết thúc');
            return;
        }

        try {
            setSubmitting(true);
            const reroute: TemporaryReroute = {
                sourceRouteId: route.id,
                targetRouteId: selectedTargetId,
                targetRouteName: selectedTarget?.routeName || '',
                reason: reason || 'Dỡ bớt tuyến tạm thời',
                expectedEndTime,
                startTime: new Date().toISOString(),
            };
            await onSubmit(reroute);
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Lỗi khi cập nhật tuyến');
        } finally {
            setSubmitting(false);
        }
    };

    const now = new Date();
    const minDateTime = now.toISOString().slice(0, 16);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg max-w-xl w-full mx-4">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                        Chuyển Hướng Tạm Thời
                    </h2>
                    <button
                        onClick={onClose}
                        disabled={loading || submitting}
                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Warning */}
                    <div className="flex gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-amber-900">Tuyến sẽ bị vô hiệu hóa</p>
                            <p className="text-sm text-amber-700 mt-1">
                                Các đơn hàng trên tuyến <strong>{route.name}</strong> sẽ được chuyển hướng
                                đến tuyến khác cho đến khi tuyến hoạt động lại.
                            </p>
                        </div>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* Source Route Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">Tuyến gốc</p>
                        <p className="text-sm font-medium text-gray-900">{route.name}</p>
                    </div>

                    {/* Target Route Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-3">
                            Tuyến đích <span className="text-red-500">*</span>
                        </label>

                        {availableTargets.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-500 bg-gray-50 rounded">
                                Không có tuyến thay thế có sẵn
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {availableTargets.map((target) => (
                                    <label
                                        key={target.routeId}
                                        className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors"
                                        style={{
                                            borderColor:
                                                selectedTargetId === target.routeId ? '#2563eb' : '#e5e7eb',
                                            backgroundColor:
                                                selectedTargetId === target.routeId
                                                    ? '#eff6ff'
                                                    : 'transparent',
                                        }}
                                    >
                                        <input
                                            type="radio"
                                            name="target"
                                            value={target.routeId}
                                            checked={selectedTargetId === target.routeId}
                                            onChange={(e) => setSelectedTargetId(e.target.value)}
                                            disabled={submitting}
                                            className="w-4 h-4 mt-1"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900">
                                                {target.routeName}
                                            </p>
                                            <p className="text-xs text-gray-600 mt-0.5">
                                                Mức: {target.level === 'SAME' ? 'Cùng cấp' : 'Cấp cao hơn'}
                                            </p>
                                            {target.capacity && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Dung lượng: {target.capacity.currentOrderCount}/
                                                    {target.capacity.maxOrders} đơn
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Lý do chuyển hướng (tùy chọn)
                        </label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="VD: Sửa chữa đường, kiểm soát lưu lượng cao, v.v."
                            rows={3}
                            disabled={submitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                    </div>

                    {/* Expected End Time */}
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">
                            Thời gian dự kiến kết thúc <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="datetime-local"
                            value={expectedEndTime}
                            onChange={(e) => setExpectedEndTime(e.target.value)}
                            min={minDateTime}
                            disabled={submitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Tuyến sẽ được kích hoạt lại sau thời gian này
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading || submitting}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={loading || submitting || !selectedTargetId}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            Xác Nhận
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
