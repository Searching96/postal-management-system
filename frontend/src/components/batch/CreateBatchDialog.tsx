import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, FormSelect, LoadingSpinner } from "../ui";
import { batchService } from "../../services/batchService";
import { toast } from "sonner";
import { Box } from "lucide-react";

interface CreateBatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function CreateBatchDialog({ open, onOpenChange, onSuccess }: CreateBatchDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [destinations, setDestinations] = useState<{ officeId: string; officeName: string; orderCount: number; totalWeight: number }[]>([]);
    const [selectedDestination, setSelectedDestination] = useState("");

    useEffect(() => {
        if (open) {
            fetchDestinations();
            setSelectedDestination("");
        }
    }, [open]);

    const fetchDestinations = async () => {
        setIsLoading(true);
        try {
            const res = await batchService.getDestinationsWithUnbatchedOrders();
            if (res.success && res.data) {
                setDestinations(res.data.destinations || []);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách điểm đến");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!selectedDestination) {
            toast.error("Vui lòng chọn điểm đến");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await batchService.createBatch({
                destinationOfficeId: selectedDestination
            });

            if (res.success) {
                toast.success(`Đã tạo kiện hàng mới: ${res.data.batchCode}`);
                onSuccess();
                onOpenChange(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Tạo kiện hàng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedDestInfo = destinations.find(d => d.officeId === selectedDestination);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Box className="h-5 w-5 text-primary-600" />
                        Tạo Kiện Hàng Mới
                    </DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : destinations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Hiện không có đơn hàng nào cần đóng gói.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <FormSelect
                                label="Chọn điểm đến"
                                value={selectedDestination}
                                onChange={(val) => setSelectedDestination(String(val))}
                                placeholder="-- Chọn văn phòng nhận --"
                                options={destinations.map(d => ({
                                    value: d.officeId,
                                    label: d.officeName
                                }))}
                            />

                            {selectedDestInfo && (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-2 text-sm text-blue-900">
                                    <div className="flex justify-between">
                                        <span>Số lượng đơn chờ:</span>
                                        <span className="font-bold">{selectedDestInfo.orderCount} đơn</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Tổng khối lượng:</span>
                                        <span className="font-bold">{selectedDestInfo.totalWeight} kg</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedDestination || isSubmitting || destinations.length === 0}
                    >
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : null}
                        Tạo Kiện
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
