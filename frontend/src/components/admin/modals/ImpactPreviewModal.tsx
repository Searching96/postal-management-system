import { createPortal } from 'react-dom';
import { Loader2, CheckCircle, AlertTriangle, Package } from 'lucide-react';
import { TransferRoute, ReroutingImpact } from '../../../services/routeService';

interface ImpactPreviewModalProps {
    route: TransferRoute;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    impact: ReroutingImpact | null;
    loading: boolean;
}

export function ImpactPreviewModal({ route, isOpen, onClose, onConfirm, impact, loading }: ImpactPreviewModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 p-6 overflow-y-auto max-h-[90vh]">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                    Tác động khi vô hiệu hóa tuyến
                </h3>
                <p className="text-gray-600 mb-4">
                    {route.fromHubName} → {route.toHubName}
                </p>

                {loading ? (
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
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={() => {
                            onClose();
                            onConfirm();
                        }}
                        className="px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-lg font-medium transition-colors"
                    >
                        Tiếp tục vô hiệu hóa
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
