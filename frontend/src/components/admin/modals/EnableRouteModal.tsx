import { createPortal } from 'react-dom';
import { Loader2, CheckCircle } from 'lucide-react';
import { TransferRoute } from '../../../services/routeService';

interface EnableRouteModalProps {
    route: TransferRoute;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    submitting: boolean;
}

export function EnableRouteModal({ route, isOpen, onClose, onConfirm, submitting }: EnableRouteModalProps) {
    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[2000] flex items-center justify-center">
            <div
                className="absolute inset-0 bg-black/50"
                onClick={onClose}
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
                    <span className="font-bold text-gray-900">{route.fromHubName} → {route.toHubName}</span>?
                </p>

                <div className="flex justify-end gap-3">
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
                        className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                        Kích hoạt ngay
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
