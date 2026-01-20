import { useState, useEffect } from "react";
import { Package, User, Calendar, Phone } from "lucide-react";
import {
    Card,
    Table,
    PageHeader,
    Badge
} from "../../components/ui";
import { formatDate } from "../../lib/utils";
import { orderService, Order } from "../../services/orderService";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthContext";

export function IncomingDeliveriesPage() {
    const { user } = useAuth();
    const [deliveries, setDeliveries] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchDeliveries = async () => {
        if (!user || !("id" in user)) {
            toast.error("Không tìm thấy thông tin người dùng");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            // Fetch incoming deliveries using the new endpoint
            const response = await orderService.getIncomingDeliveriesByCustomerId(user.id, {
                page: 0,
                size: 100
            });

            if (response && response.content) {
                setDeliveries(response.content);
            }
        } catch (error) {
            console.error("Error fetching incoming deliveries:", error);
            toast.error("Không thể tải danh sách đơn hàng đang đến");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchDeliveries();
        }
    }, [user]);

    const getStatusBadge = (status: string) => {
        const map: Record<string, "info" | "warning" | "secondary"> = {
            IN_TRANSIT_TO_DESTINATION: "secondary",
            AT_DESTINATION_HUB: "secondary",
            IN_TRANSIT_TO_OFFICE: "secondary",
            AT_DESTINATION_OFFICE: "info",
            OUT_FOR_DELIVERY: "warning"
        };
        const labels: Record<string, string> = {
            IN_TRANSIT_TO_DESTINATION: "Đang vận chuyển",
            AT_DESTINATION_HUB: "Tại Hub đích",
            IN_TRANSIT_TO_OFFICE: "Đang về bưu cục",
            AT_DESTINATION_OFFICE: "Tại bưu cục",
            OUT_FOR_DELIVERY: "Đang giao hàng"
        };

        return (
            <Badge variant={map[status] || "info"}>
                {labels[status] || status}
            </Badge>
        );
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Đơn hàng đang đến"
                description="Các đơn hàng đang được giao đến cho bạn"
            />

            {/* Deliveries Table */}
            <Card>
                <div className="overflow-x-auto">
                    <Table>
                        <thead>
                            <tr>
                                <th className="py-3 px-4 text-left">Mã vận đơn</th>
                                <th className="py-3 px-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4 text-gray-400" />
                                        Người gửi
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-gray-400" />
                                        Ngày gửi
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-center">Trạng thái</th>
                                <th className="py-3 px-4 text-left">
                                    <div className="flex items-center gap-2">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        Bưu tá
                                    </div>
                                </th>
                                <th className="py-3 px-4 text-center">Dự kiến giao</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8">
                                        Đang tải...
                                    </td>
                                </tr>
                            ) : deliveries.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-500">
                                        <div className="flex flex-col items-center justify-center p-4">
                                            <Package className="h-12 w-12 text-gray-300 mb-2" />
                                            <p>Bạn không có đơn hàng đang đến</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                deliveries.map((delivery) => {
                                    const estimatedDelivery = new Date(delivery.createdAt);
                                    if (delivery.status === "OUT_FOR_DELIVERY") {
                                        estimatedDelivery.setHours(estimatedDelivery.getHours() + 2);
                                    } else {
                                        estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
                                    }

                                    return (
                                        <tr key={delivery.orderId} className="border-t hover:bg-gray-50 transition-colors">
                                            <td className="py-3 px-4 font-medium text-primary-600">
                                                {delivery.trackingNumber}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {delivery.senderName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {delivery.senderPhone}
                                                    </p>
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-sm text-gray-600">
                                                {formatDate(delivery.createdAt)}
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                {getStatusBadge(delivery.status)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {delivery.assignedShipperName || "Chưa phân công"}
                                                    </p>
                                                    {delivery.currentOfficeName && (
                                                        <p className="text-xs text-gray-500">
                                                            {delivery.currentOfficeName}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4 text-center text-sm text-gray-600">
                                                {delivery.status === "OUT_FOR_DELIVERY"
                                                    ? "Hôm nay"
                                                    : formatDate(estimatedDelivery.toISOString())}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </Table>
                </div>

                {/* Table Footer Summary */}
                <div className="border-t bg-gray-50 px-6 py-4">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-600">
                            <span className="flex items-center gap-1">
                                <Package className="h-4 w-4" />
                                Tổng: <strong className="text-gray-900">{deliveries.length}</strong> đơn hàng
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
