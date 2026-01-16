import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Package, Eye } from "lucide-react";
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
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../lib/utils";

import { useAuth } from "../../lib/AuthContext";

export function OrderListPage() {
    const { user } = useAuth();
    const isCustomer = user?.role === "CUSTOMER";
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params: any = { page, size: 10 };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;

            let res;
            if (isCustomer && user && "id" in user) {
                res = await orderService.getOrdersByCustomerId(user.id, params);
            } else {
                res = await orderService.getOrders(params);
            }

            if (res && res.content) {
                setOrders(res.content);
                setTotalPages(res.totalPages);
                setTotalElements(res.totalElements);
            }
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải danh sách đơn hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page, searchTerm, statusFilter]);

    // Status mapping
    const getStatusBadge = (status: string) => {
        const map: Record<string, string> = {
            CREATED: "info",         // Mới tạo
            PENDING: "secondary",    // Chờ xử lý
            ACCEPTED: "info",      // Đã tiếp nhận
            SHIPPING: "warning",     // Đang vận chuyển
            DELIVERING: "primary",   // Đang giao
            COMPLETED: "success",    // Hoàn thành
            CANCELLED: "destructive", // Đã hủy
            RETURNED: "destructive"   // Đã trả lại
        };
        const labels: Record<string, string> = {
            CREATED: "Mới tạo",
            PENDING: "Chờ xử lý",
            ACCEPTED: "Đã tiếp nhận",
            SHIPPING: "Đang vận chuyển",
            DELIVERING: "Đang giao",
            COMPLETED: "Hoàn thành",
            CANCELLED: "Đã hủy",
            RETURNED: "Đã trả lại"
        };

        return (
            <Badge variant={map[status] || "default" as any}>
                {labels[status] || status}
            </Badge>
        );
    };

    const statusOptions = [
        { value: "ALL", label: "Tất cả trạng thái" },
        { value: "CREATED", label: "Mới tạo" },
        { value: "DELIVERED", label: "Hoàn thành" },
        { value: "CANCELLED", label: "Đã hủy" },
        { value: "RETURNED", label: "Đã trả lại" }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <PageHeader title="Quản lý Đơn hàng" description="Theo dõi và xử lý vận đơn toàn hệ thống" />
                <Link to="/orders/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Tạo đơn hàng
                    </Button>
                </Link>
            </div>

            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-end">
                <div className="relative flex-1 w-full max-w-sm">
                    <label className="block text-sm font-bold text-gray-700 mb-1 ml-1">Tìm kiếm</label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Mã vận đơn, SĐT, Tên..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="w-full sm:w-[250px]">
                    <FormSelect
                        label="Lọc theo trạng thái"
                        value={statusFilter}
                        onChange={(val: string | number) => setStatusFilter(val as string)}
                        options={statusOptions}
                        placeholder="Chọn trạng thái"
                    />
                </div>
            </div>

            {/* Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Mã vận đơn</th>
                                <th className="py-3 px-4 text-left">Người gửi</th>
                                <th className="py-3 px-4 text-left">Người nhận</th>
                                <th className="py-3 px-4 text-center">Trạng thái</th>
                                <th className="py-3 px-4 text-right">Cước phí</th>
                                <th className="py-3 px-4 text-right">Ngày tạo</th>
                                <th className="py-3 px-4 text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-8">Đang tải...</td></tr>
                            ) : orders.length === 0 ? (
                                <tr><td colSpan={7} className="text-center py-8 text-gray-500">
                                    <div className="flex flex-col items-center justify-center p-4">
                                        <Package className="h-12 w-12 text-gray-300 mb-2" />
                                        <p>Không tìm thấy đơn hàng nào</p>
                                    </div>
                                </td></tr>
                            ) : (
                                orders.map((order) => (
                                    <tr key={order.orderId} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-primary-600">
                                            <Link to={`/orders/${order.orderId}`} className="hover:underline">
                                                {order.trackingNumber}
                                            </Link>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium">{order.senderName}</p>
                                            <p className="text-xs text-gray-500">{order.senderPhone}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="text-sm font-medium">{order.receiverName}</p>
                                            <p className="text-xs text-gray-500">{order.receiverPhone}</p>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="py-3 px-4 text-right font-medium">
                                            {formatCurrency(order.totalAmount)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/orders/${order.orderId}`}>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 p-0 text-gray-500 hover:text-primary-600 hover:bg-primary-50"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </Button>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>

            {totalPages > 1 && (
                <PaginationControls
                    page={page}
                    totalPages={totalPages}
                    totalElements={totalElements}
                    pageSize={pageSize}
                    onPageChange={setPage}
                />
            )}
        </div>
    );
}
