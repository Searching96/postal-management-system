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
} from "../../components/ui";
import { orderService, Order } from "../../services/orderService";
import { toast } from "sonner";
import { formatCurrency, formatDate } from "../../lib/utils";

export function OrderListPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const params: any = { page, size: 10 };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter !== "ALL") params.status = statusFilter;

            const res = await orderService.getOrders(params);
            if (res.success) {
                setOrders(res.data.content);
                setTotalPages(res.data.totalPages);
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
            PENDING: "secondary",    // Chờ xử lý
            ACCEPTED: "info",      // Đã chấp nhận
            SHIPPING: "warning",     // Đang vận chuyển
            DELIVERING: "primary",   // Đang giao hàng
            COMPLETED: "success",    // Thành công
            CANCELLED: "destructive", // Đã hủy
            RETURNED: "destructive"   // Trả hàng
        };
        const labels: Record<string, string> = {
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
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative flex-1 w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm theo mã vận đơn..."
                        className="pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2 w-full sm:w-auto overflow-x-auto p-1">
                    {["ALL", "PENDING", "SHIPPING", "COMPLETED", "CANCELLED"].map((status) => (
                        <Button
                            key={status}
                            variant={statusFilter === status ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setStatusFilter(status)}
                            className="whitespace-nowrap"
                        >
                            {status === "ALL" ? "Tất cả" : status}
                        </Button>
                    ))}
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
                                    <tr key={order.id} className="border-t hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4 font-medium text-primary-600">
                                            <Link to={`/orders/${order.id}`} className="hover:underline">
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
                                            {formatCurrency(order.totalFee)}
                                        </td>
                                        <td className="py-3 px-4 text-right text-sm text-gray-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <Link to={`/orders/${order.id}`}>
                                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                                    <Eye className="h-4 w-4 text-gray-500" />
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </div>
            </Card>
            {/* TODO: Add Pagination Controls */}
        </div>
    );
}
