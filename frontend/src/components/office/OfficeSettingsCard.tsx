import { useState, useEffect } from "react";
import { Card, Button, Input, Badge, LoadingSpinner } from "../../components/ui";
import { officeService, Office } from "../../services/officeService";
import { useAuth } from "../../lib/AuthContext";
import { Clock } from "lucide-react";
import { toast } from "sonner";

interface OfficeSettingsCardProps {
    officeId?: string;
    onClose?: () => void;
}

export function OfficeSettingsCard({ officeId: propOfficeId, onClose }: OfficeSettingsCardProps) {
    const { user } = useAuth();
    const [office, setOffice] = useState<Office | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [workingHours, setWorkingHours] = useState("");
    const [isAccepting, setIsAccepting] = useState(true);

    useEffect(() => {
        const targetId = propOfficeId || (user && 'officeId' in user ? (user as any).officeId : null);
        if (targetId) {
            fetchOffice(targetId);
        }
    }, [propOfficeId, user]);

    const fetchOffice = async (id: string) => {
        setIsLoading(true);
        try {
            const data = await officeService.getOfficeDetails(id);
            setOffice(data);
            setWorkingHours(data.workingHours || "07:00-17:00");
            setIsAccepting(data.isAcceptingOrders);
        } catch (error) {
            console.error("Failed to fetch office", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!office) return;
        setIsSaving(true);
        try {
            const updated = await officeService.updateStatus(office.officeId, {
                workingHours,
                isAcceptingOrders: isAccepting
            });
            setOffice(updated);
            toast.success("Cập nhật trạng thái bưu cục thành công");
            if (onClose) onClose();
        } catch (error) {
            toast.error("Không thể cập nhật trạng thái");
        } finally {
            setIsSaving(false);
        }
    };

    if (!user || !('officeId' in user)) return null;
    if (isLoading) return <LoadingSpinner />;
    if (!office) return null;

    return (
        <Card title="Cài đặt Hoạt động Bưu cục" className="h-full">
            <div className="space-y-6">
                <div>
                    <h3 className="font-semibold text-gray-900 mb-2">{office.officeName}</h3>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-sm text-gray-500">Trạng thái hiện tại:</span>
                        {office.isOpen ?
                            <Badge variant="success">Đang mở cửa</Badge> :
                            <Badge variant="secondary">Đã đóng cửa</Badge>
                        }
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="space-y-1">
                            <span className="font-medium text-gray-900 block">Tiếp nhận đơn hàng</span>
                            <span className="text-xs text-gray-500 block">Tắt/Bật khả năng tiếp nhận đơn thủ công</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isAccepting}
                                    onChange={(e) => setIsAccepting(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">
                            Giờ làm việc (HH:mm-HH:mm)
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                value={workingHours}
                                onChange={(e) => setWorkingHours(e.target.value)}
                                className="pl-9"
                                placeholder="07:00-17:00"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Định dạng 24h, ví dụ: 07:30-17:30</p>
                    </div>

                    <div className="pt-2">
                        <Button
                            onClick={handleSave}
                            isLoading={isSaving}
                            className="w-full"
                        >
                            Lưu thay đổi
                        </Button>
                    </div>
                </div>
            </div>
        </Card>
    );
}
