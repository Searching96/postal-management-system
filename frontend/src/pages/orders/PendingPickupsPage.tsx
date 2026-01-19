import { useState, useEffect } from "react";
import { Package, Truck } from "lucide-react";
import {
    Card,
    Button,
    PageHeader,
    Badge,
    LoadingSpinner,
    PaginationControls,
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    FormSelect,
    Input
} from "../../components/ui";
import { orderService, Order } from "../../services/orderService";
import { shipperService } from "../../services/ShipperService";
import type { EmployeeResponse } from "../../models";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils";

export function PendingPickupsPage() {
    // Orders State
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    // Assignment Dialog State
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [shippers, setShippers] = useState<EmployeeResponse[]>([]);
    const [selectedShipperId, setSelectedShipperId] = useState("");
    const [assignmentNote, setAssignmentNote] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [isLoadingShippers, setIsLoadingShippers] = useState(false);

    // Fetch Orders
    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await orderService.getPendingPickupOrders({ page, size: pageSize });
            if (res && res.content) {
                setOrders(res.content);
                setTotalPages(res.totalPages);
                setTotalElements(res.totalElements);
            }
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải danh sách đơn chờ xử lý");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    // Fetch Shippers when Dialog opens
    useEffect(() => {
        if (isDialogOpen) {
            const loadShippers = async () => {
                setIsLoadingShippers(true);
                try {
                    // Fetch all available shippers (page size 100 to cover most cases)
                    const res = await shipperService.getShippers({ page: 0, size: 100 });
                    if (res.success && res.data) {
                        setShippers(res.data.content);
                    }
                } catch (err) {
                    console.error(err);
                    toast.error("Không thể tải danh sách bưu tá");
                } finally {
                    setIsLoadingShippers(false);
                }
            };
            loadShippers();
        }
    }, [isDialogOpen]);

    // Handlers
    const openAssignDialog = (order: Order) => {
        setSelectedOrder(order);
        setSelectedShipperId("");
        setAssignmentNote("");
        setIsDialogOpen(true);
    };

    const handleAssign = async () => {
        if (!selectedOrder || !selectedShipperId) return;

        setIsAssigning(true);
        try {
            await orderService.assignShipperToPickup({
                orderId: (selectedOrder.orderId || selectedOrder.id)!,
                shipperId: selectedShipperId
            });
            toast.success("Đã phân công bưu tá thành công");
            setIsDialogOpen(false);
            fetchOrders(); // Refresh list
        } catch (err) {
            console.error(err);
            toast.error("Phân công thất bại. Vui lòng thử lại.");
        } finally {
            setIsAssigning(false);
        }
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Quản lý Yêu cầu Lấy hàng"
                description="Phân công bưu tá cho các đơn hàng chờ lấy từ khách hàng"
            />

            <Card className="p-0 overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <LoadingSpinner />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p>Hiện không có yêu cầu lấy hàng nào đang chờ xử lý</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                                <tr>
                                    <th className="px-6 py-3">Mã đơn hàng</th>
                                    <th className="px-6 py-3">Người gửi</th>
                                    <th className="px-6 py-3">Địa chỉ lấy hàng</th>
                                    <th className="px-6 py-3">Ngày tạo</th>
                                    <th className="px-6 py-3">Trạng thái</th>
                                    <th className="px-6 py-3 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map((order) => (
                                    <tr key={order.orderId || order.id} className="hover:bg-gray-50/50">
                                        <td className="px-6 py-4 font-medium">{order.trackingNumber}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{order.senderName}</span>
                                                <span className="text-gray-500 text-xs">{order.senderPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate" title={`${order.senderAddressLine1}, ${order.senderWardName}, ${order.senderProvinceName}`}>
                                            {/* Refactored: Display sender address using names for UI (codes in data for backend) */}
                                            {`${order.senderAddressLine1}, ${order.senderWardName}, ${order.senderProvinceName}`}
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant="warning">Chờ lấy hàng</Badge>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <Button
                                                size="sm"
                                                onClick={() => openAssignDialog(order)}
                                                className="bg-primary-600 hover:bg-primary-700 text-white"
                                            >
                                                <Truck className="h-4 w-4 mr-1" />
                                                Phân công
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                {!isLoading && orders.length > 0 && (
                    <div className="border-t">
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                    </div>
                )}
            </Card>

            {/* Assignment Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Phân công Bưu tá</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="bg-gray-50 p-3 rounded-lg text-sm space-y-1">
                            <p className="font-medium text-gray-700">Thông tin đơn hàng:</p>
                            <p><span className="text-gray-500">Mã vận đơn:</span> {selectedOrder?.trackingNumber}</p>
                            {/* Refactored: Display sender address using names for UI */}
                            <p><span className="text-gray-500">Địa chỉ:</span> {`${selectedOrder?.senderAddressLine1}, ${selectedOrder?.senderWardName || ''}, ${selectedOrder?.senderProvinceName || ''}`}</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Chọn Bưu tá</label>
                            {isLoadingShippers ? (
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                    <LoadingSpinner size="sm" /> Đang tải danh sách...
                                </div>
                            ) : (
                                <FormSelect
                                    label=""
                                    value={selectedShipperId}
                                    onChange={(val) => setSelectedShipperId(val as string)}
                                    options={[
                                        { value: "", label: "-- Chọn Bưu tá --" },
                                        ...shippers.map(s => ({
                                            value: s.employeeId,
                                            label: `${s.fullName} (${s.phoneNumber})`
                                        }))
                                    ]}
                                    error={!selectedShipperId && isAssigning ? "Vui lòng chọn bưu tá" : ""}
                                />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Ghi chú (tùy chọn)</label>
                            <Input
                                value={assignmentNote}
                                onChange={(e) => setAssignmentNote(e.target.value)}
                                placeholder="VD: Gọi trước khi đến..."
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isAssigning}>
                            Hủy bỏ
                        </Button>
                        <Button
                            onClick={handleAssign}
                            disabled={!selectedShipperId || isAssigning}
                        >
                            {isAssigning ? <LoadingSpinner size="sm" /> : "Xác nhận phân công"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
