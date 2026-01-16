import { Modal } from "./Modal";
import { Button } from "./Button";
import { AlertTriangle, Info } from "lucide-react";

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "info";
    isLoading?: boolean;
}

export function ConfirmationModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = "Xác nhận",
    cancelText = "Hủy bỏ",
    variant = "info",
    isLoading = false,
}: ConfirmationModalProps) {
    const Icon = variant === "danger" ? AlertTriangle : Info;
    const iconColor = variant === "danger" ? "text-red-500" : "text-primary-500";
    const bgColor = variant === "danger" ? "bg-red-50" : "bg-primary-50";
    const confirmVariant = variant === "danger" ? "danger" : "primary";

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-6">
                <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${bgColor} shrink-0`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                    <div className="space-y-1">
                        <p className="text-gray-600 leading-relaxed">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button variant="ghost" onClick={onClose} disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        variant={confirmVariant as any}
                        onClick={onConfirm}
                        isLoading={isLoading}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
