import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, FormSelect, LoadingSpinner, FormInput } from "../ui";
import { batchService } from "../../services/batchService";
import { toast } from "sonner";
import { Wand2 } from "lucide-react";

interface AutoBatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    destinations?: { value: string; label: string }[];
}

export function AutoBatchDialog({ open, onOpenChange, onSuccess, destinations = [] }: AutoBatchDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Default config
    const [maxWeight, setMaxWeight] = useState<number>(20); // Default 20kg per batch
    const [selectedDestination, setSelectedDestination] = useState<string>("");

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const res = await batchService.autoBatchOrders({
                maxWeightPerBatch: maxWeight,
                destinationOfficeId: selectedDestination || undefined
            });

            const { batchesCreated, ordersProcessed } = res;
            if (batchesCreated > 0) {
                toast.success(`Đã tự động tạo ${batchesCreated} kiện hàng với ${ordersProcessed} đơn hàng!`);
                onSuccess();
                onOpenChange(false);
            } else {
                toast.info("Không có đủ đơn hàng để tạo kiện mới theo tiêu chí này.");
            }
        } catch (error) {
            console.error(error);
            toast.error("Tự động gom kiện thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Wand2 className="h-5 w-5 text-indigo-600" />
                        Tự Động Gom Kiện
                    </DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4 px-4">
                    <p className="text-sm text-gray-500">
                        Hệ thống sẽ tự động gom các đơn chờ thành các kiện hàng tối ưu dựa trên trọng lượng và điểm đến.
                    </p>

                    <FormInput
                        label="Trọng lượng tối đa mỗi kiện (kg)"
                        type="number"
                        min={1}
                        value={maxWeight}
                        onChange={(e) => setMaxWeight(Number(e.target.value))}
                    />

                    <FormSelect
                        label="Lọc theo điểm đến (Tuỳ chọn)"
                        value={selectedDestination}
                        onChange={(val) => setSelectedDestination(String(val))}
                        placeholder="-- Tất cả điểm đến --"
                        options={destinations}
                    />
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Huỷ</Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isSubmitting || maxWeight <= 0}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                        {isSubmitting ? <LoadingSpinner size="sm" className="mr-2" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Bắt đầu Gom Kiện
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
