import { createPortal } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { TransferRoute, DisruptionType } from '../../../services/routeService';

interface DisableRouteModalProps {
    route: TransferRoute;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    submitting: boolean;
    disruptionType: DisruptionType;
    setDisruptionType: (type: DisruptionType) => void;
    reason: string;
    setReason: (reason: string) => void;
    expectedEndTime: string;
    setExpectedEndTime: (time: string) => void;
}

export function DisableRouteModal({
    route,
    isOpen,
    onClose,
    onConfirm,
    submitting,
    disruptionType,
    setDisruptionType,
    reason,
    setReason,
    expectedEndTime,
    setExpectedEndTime
}: DisableRouteModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Vô hiệu hóa tuyến đường
                </h3>
                <p className="text-gray-600 mb-6">
                    {route.fromHubName} → {route.toHubName}
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
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                        disabled={submitting}
                    >
                        Hủy
                    </button>
                    <button
                        onClick={onConfirm}
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
    );
}
