import { useState, useEffect } from "react";
import { Search, Package, User, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import {
    Card,
    Button,
    Input,
    Table,
    Badge,
    PageHeader,
    PaginationControls
} from "../../components/ui";
import { FormSelect } from "../../components/ui/FormSelect";
import { orderService, Order } from "../../services/orderService";
import { shipperService } from "../../services/ShipperService";
import { EmployeeResponse } from "../../models/employee";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../lib/utils";

export function AssignDeliveryPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [shippers, setShippers] = useState<EmployeeResponse[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
    const [selectedShipperId, setSelectedShipperId] = useState<string>("");

    const [orderSearch, setOrderSearch] = useState("");
    const [orderPage, setOrderPage] = useState(0);
    const [orderTotalPages, setOrderTotalPages] = useState(0);
    const [orderTotalElements, setOrderTotalElements] = useState(0);
    const orderPageSize = 10;

    const fetchOrders = async () => {
        setIsLoadingOrders(true);
        try {
            const params = {
                page: orderPage,
                size: orderPageSize,
                status: "AT_DESTINATION_OFFICE",
                search: orderSearch
            };
            const res = await orderService.getOrders(params);
            if (res && res.content) {
                setOrders(res.content);
                setOrderTotalPages(res.totalPages);
                setOrderTotalElements(res.totalElements);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách đơn hàng đến");
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const fetchShippers = async () => {
        try {
            const res = await shipperService.getShippers({ size: 100 });
            if (res.success && res.data) {
                setShippers(res.data.content);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách bưu tá");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [orderPage, orderSearch]);

    useEffect(() => {
        fetchShippers();
    }, []);

    const toggleOrderSelection = (orderId: string) => {
        setSelectedOrderIds(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrderIds.length === orders.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(orders.map(o => o.orderId));
        }
    };

    const handleAssign = async () => {
        if (!selectedShipperId) {
            toast.error("Vui lòng chọn bưu tá để giao hàng");
            return;
        }
        if (selectedOrderIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một đơn hàng");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await orderService.assignOrdersToShipper({
                shipperId: selectedShipperId,
                orderIds: selectedOrderIds
            });

            toast.success(res.message);
            setSelectedOrderIds([]);
            fetchOrders();
        } catch (error) {
            console.error(error);
            toast.error("Lỗi khi gán đơn hàng cho bưu tá");
        } finally {
            setIsSubmitting(false);
        }
    };

    const shipperOptions = shippers.map(s => ({
        value: s.employeeId,
        label: `${s.fullName} (${s.phoneNumber})`
    }));

    return (
        <div className="space-y-6">
            <PageHeader
                title="Giao Bưu tá (Last Mile)"
                description="Phân bổ đơn hàng đã đến bưu cục cho nhân viên giao hàng cuối"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Assignment Controls */}
                <Card className="lg:col-span-1 h-fit sticky top-6">
                    <div className="p-4 space-y-4">
                        <h3 className="font-bold text-gray-900 border-b pb-2">Xử lý phân công</h3>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Đã chọn: <span className="text-primary-600 font-bold">{selectedOrderIds.length}</span> đơn hàng</label>
                        </div>

                        <div className="space-y-2">
                            <FormSelect
                                label="Chọn bưu tá"
                                placeholder="Chọn nhân viên giao hàng"
                                options={shipperOptions}
                                value={selectedShipperId}
                                onChange={(val) => setSelectedShipperId(val as string)}
                                icon={User}
                            />
                        </div>

                        <Button
                            className="w-full mt-4"
                            size="lg"
                            disabled={selectedOrderIds.length === 0 || !selectedShipperId || isSubmitting}
                            onClick={handleAssign}
                        >
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <CheckCircle className="mr-2 h-4 w-4" />
                            )}
                            Xác nhận giao hàng
                        </Button>

                        {selectedOrderIds.length > 0 && !selectedShipperId && (
                            <div className="flex items-center gap-2 text-xs text-orange-600 bg-orange-50 p-2 rounded border border-orange-100 italic">
                                <AlertCircle className="h-3 w-3" />
                                <span>Hãy chọn bưu tá trước khi xác nhận</span>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Orders List */}
                <div className="lg:col-span-3 space-y-4">
                    <Card>
                        <div className="p-4 border-b flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <h3 className="font-bold text-gray-900">Đơn hàng hiện có</h3>
                                <Badge variant="secondary">{orderTotalElements} đơn hàng chờ giao</Badge>
                            </div>
                            <div className="relative w-full md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Tìm mã vận đơn..."
                                    className="pl-9"
                                    value={orderSearch}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOrderSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <thead>
                                    <tr>
                                        <th className="py-3 px-4 w-10">
                                            <input
                                                type="checkbox"
                                                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                                                onChange={toggleSelectAll}
                                            />
                                        </th>
                                        <th className="py-3 px-4 text-left">Đơn hàng</th>
                                        <th className="py-3 px-4 text-left">Người nhận</th>
                                        <th className="py-3 px-4 text-left">Địa chỉ giao</th>
                                        <th className="py-3 px-4 text-right">Khối lượng</th>
                                        <th className="py-3 px-4 text-right">COD</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoadingOrders ? (
                                        <tr><td colSpan={6} className="text-center py-10"><Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-300" /></td></tr>
                                    ) : orders.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-12 text-gray-500">
                                                <Package className="h-12 w-12 text-gray-200 mx-auto mb-2" />
                                                <p>Không có đơn hàng nào chờ giao tại bưu cục này</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr
                                                key={order.orderId}
                                                className={`border-t hover:bg-gray-50 transition-colors cursor-pointer ${selectedOrderIds.includes(order.orderId) ? 'bg-primary-50/30' : ''}`}
                                                onClick={() => toggleOrderSelection(order.orderId)}
                                            >
                                                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                                        checked={selectedOrderIds.includes(order.orderId)}
                                                        onChange={() => toggleOrderSelection(order.orderId)}
                                                    />
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="font-bold text-gray-900">{order.trackingNumber}</p>
                                                    <p className="text-[10px] text-gray-500">{formatDate(order.createdAt)}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-sm font-medium">{order.receiverName}</p>
                                                    <p className="text-xs text-gray-500">{order.receiverPhone}</p>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <p className="text-[11px] text-gray-600 line-clamp-2 max-w-[200px]">{order.receiverAddress}</p>
                                                </td>
                                                <td className="py-3 px-4 text-right text-sm">
                                                    {order.weightKg} kg
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-primary-700">
                                                    {formatCurrency(order.codAmount)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>

                    {orderTotalPages > 1 && (
                        <PaginationControls
                            page={orderPage}
                            totalPages={orderTotalPages}
                            totalElements={orderTotalElements}
                            pageSize={orderPageSize}
                            onPageChange={setOrderPage}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}
