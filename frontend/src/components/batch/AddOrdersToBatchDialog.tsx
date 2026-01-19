import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button, LoadingSpinner, Checkbox } from "../ui";
import { batchService } from "../../services/batchService";
import { toast } from "sonner";
import { Package, Search, Filter } from "lucide-react";

interface AddOrdersToBatchDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
    batchId: string;
    destinationOfficeId: string;
}

export function AddOrdersToBatchDialog({
    open,
    onOpenChange,
    onSuccess,
    batchId,
    destinationOfficeId
}: AddOrdersToBatchDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orders, setOrders] = useState<any[]>([]);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        if (open) {
            fetchUnbatchedOrders();
            setSelectedOrderIds([]);
            setSearchTerm("");
        }
    }, [open, destinationOfficeId]);

    const fetchUnbatchedOrders = async () => {
        setIsLoading(true);
        try {
            const res = await batchService.getUnbatchedOrders(destinationOfficeId);
            setOrders(res || []);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === filteredOrders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(filteredOrders.map(o => o.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedOrderIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một đơn hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            await batchService.addOrdersToBatch({
                batchId,
                orderIds: selectedOrderIds
            });

            toast.success(`Đã thêm ${selectedOrderIds.length} đơn hàng vào kiện`);
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Thêm đơn hàng thất bại");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.receiverName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5 text-primary-600" />
                        Thêm Đơn Hàng vào Kiện
                    </DialogTitle>
                </DialogHeader>

                <div className="px-6 py-2 border-b flex gap-4 items-center">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã vận đơn hoặc tên người nhận..."
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px] px-6 py-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <LoadingSpinner size="lg" />
                            <p className="text-gray-500 animate-pulse">Đang tìm đơn hàng khả dụng...</p>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 gap-2">
                            <Filter className="h-10 w-10 text-gray-200" />
                            <p>{orders.length === 0 ? "Không có đơn hàng nào chờ đóng gói cho điểm đến này." : "Không tìm thấy đơn hàng phù hợp."}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">
                                <div className="flex items-center gap-3">
                                    <Checkbox
                                        checked={selectedOrderIds.length === filteredOrders.length && filteredOrders.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                    <span>Chọn tất cả ({filteredOrders.length})</span>
                                </div>
                                <span>Trọng lượng</span>
                            </div>

                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedOrderIds.includes(order.id)
                                            ? "border-primary-500 bg-primary-50 shadow-sm"
                                            : "border-gray-100 hover:border-gray-200"
                                        }`}
                                    onClick={() => toggleOrderSelection(order.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={selectedOrderIds.includes(order.id)}
                                            onCheckedChange={() => toggleOrderSelection(order.id)}
                                        />
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{order.trackingNumber}</p>
                                            <p className="text-xs text-gray-500">{order.receiverName} • {order.receiverAddressLine1}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm">{order.weightKg} kg</p>
                                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Cân nặng</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <DialogFooter className="p-6 bg-gray-50 border-t flex items-center justify-between sm:justify-between">
                    <div className="text-sm text-gray-600">
                        Đã chọn <span className="font-bold text-primary-600">{selectedOrderIds.length}</span> đơn hàng
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Huỷ
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            disabled={selectedOrderIds.length === 0 || isSubmitting}
                            className="min-w-[140px]"
                        >
                            {isSubmitting ? (
                                <>
                                    <LoadingSpinner size="sm" className="mr-2" />
                                    Đang thêm...
                                </>
                            ) : "Thêm vào kiện"}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
