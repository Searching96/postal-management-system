import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, FormSelect, LoadingSpinner, FormInput } from "../ui";
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
    const [destinations, setDestinations] = useState<{
        officeId: string;
        officeName: string;
        province: string;
        unbatchedOrderCount: number;
        totalWeight: number;
        openBatchCount: number;
    }[]>([]);
    const [selectedDestination, setSelectedDestination] = useState("");
    const [maxWeight, setMaxWeight] = useState<number>(50); // Default 50kg per batch

    useEffect(() => {
        if (open) {
            fetchDestinations();
            setSelectedDestination("");
            setMaxWeight(50);
        }
    }, [open]);

    const fetchDestinations = async () => {
        setIsLoading(true);
        try {
            const res = await batchService.getDestinationsWithUnbatchedOrders();
            setDestinations(res.destinations || []);
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

        if (maxWeight <= 0) {
            toast.error("Trọng lượng tối đa phải lớn hơn 0");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await batchService.createBatch({
                destinationOfficeId: selectedDestination,
                maxWeightKg: maxWeight
            });

            toast.success(`Đã tạo kiện hàng mới: ${res.batchCode}`);
            onSuccess();
            onOpenChange(false);
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

                <div className="py-4 space-y-6">
                    {isLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : destinations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            Hiện không có đơn hàng nào cần đóng gói.
                        </div>
                    ) : (
                        <div className="space-y-6 px-1">
                            <FormSelect
                                label="Chọn điểm đến"
                                value={selectedDestination}
                                onChange={(val) => setSelectedDestination(String(val))}
                                placeholder="-- Chọn văn phòng nhận --"
                                options={destinations.map(d => ({
                                    value: d.officeId,
                                    label: `${d.officeName} (${d.province})`
                                }))}
                            />

                            <FormInput
                                label="Trọng lượng tối đa kiện hàng (kg)"
                                type="number"
                                min={1}
                                value={maxWeight}
                                onChange={(e) => setMaxWeight(Number(e.target.value))}
                                placeholder="Nhập trọng lượng tối đa (ví dụ: 50)"
                            />

                            {selectedDestInfo && (
                                <div className="bg-blue-50 px-6 py-5 rounded-xl border border-blue-100 space-y-3 text-sm text-blue-900 shadow-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700">Số lượng đơn chờ:</span>
                                        <span className="font-bold text-lg">{selectedDestInfo.unbatchedOrderCount} <span className="text-xs font-normal">đơn</span></span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-blue-700">Tổng khối lượng:</span>
                                        <span className="font-bold text-lg">{selectedDestInfo.totalWeight.toFixed(2)} <span className="text-xs font-normal">kg</span></span>
                                    </div>
                                    <div className="flex justify-between items-center border-t border-blue-200 pt-2 mt-2">
                                        <span className="text-blue-700 font-medium">Kiện đang mở:</span>
                                        <span className="font-bold">{selectedDestInfo.openBatchCount} <span className="text-xs font-normal">kiện</span></span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <DialogFooter className="bg-gray-50 -mx-6 -mb-6 p-6 rounded-b-lg border-t mt-4">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                        Huỷ
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedDestination || isSubmitting || destinations.length === 0 || maxWeight <= 0}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Đang tạo...
                            </>
                        ) : "Tạo Kiện"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
