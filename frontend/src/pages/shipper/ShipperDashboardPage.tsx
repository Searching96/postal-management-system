import { useState, useEffect } from "react";
import { Package, MapPin, Phone, User, CheckCircle, Clock, Navigation, XCircle, Play, Map } from "lucide-react";
import {
    Card, Button, PageHeader, Badge, LoadingSpinner, Alert, PaginationControls,
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Input
} from "../../components/ui";
import { orderService, Order } from "../../services/orderService";
import { startDelivery, openGoogleMapsDirections } from "../../services/trackingService";
import { useLocationTracking } from "../../hooks/useLocationTracking";
import { toast } from "sonner";
import { formatDate } from "../../lib/utils";

export function ShipperDashboardPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;

    const [processingOrderId, setProcessingOrderId] = useState<string | null>(null);

    const fetchAssignedOrders = async () => {
        setIsLoading(true);
        setError("");
        try {
            const res = await orderService.getShipperAssignedOrders({ page, size: pageSize });
            if (res && res.content) {
                setOrders(res.content);
                setTotalPages(res.totalPages);
                setTotalElements(res.totalElements);
            }
        } catch (err: unknown) {
            setError("Không thể tải danh sách đơn hàng được giao");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignedOrders();
    }, [page]);

    const [failReason, setFailReason] = useState("");
    const [selectedOrderForFail, setSelectedOrderForFail] = useState<Order | null>(null);

    // Location tracking hook
    const { location, startTracking } = useLocationTracking();

    // Start delivery - update status and begin GPS tracking
    const handleStartDelivery = async (orderId: string) => {
        setProcessingOrderId(orderId);
        try {
            await startDelivery(orderId);
            startTracking(); // Start GPS broadcasting
            toast.success("Đã bắt đầu giao hàng! Đang chia sẻ vị trí...");
            fetchAssignedOrders();
        } catch (err: unknown) {
            toast.error("Không thể bắt đầu giao hàng");
        } finally {
            setProcessingOrderId(null);
        }
    };

    // Open Google Maps for navigation
    const handleNavigate = (order: Order) => {
        openGoogleMapsDirections(
            order.receiverAddress,
            location?.latitude,
            location?.longitude
        );
    };

    const handleMarkPickedUp = async (orderId: string) => {
        setProcessingOrderId(orderId);
        try {
            await orderService.markOrderPickedUp(orderId);
            toast.success("Đã xác nhận lấy hàng thành công!");
            fetchAssignedOrders();
        } catch (err: unknown) {
            toast.error("Không thể xác nhận lấy hàng. Vui lòng thử lại.");
        } finally {
            setProcessingOrderId(null);
        }
    };

    const handleDeliverSuccess = async (orderId: string) => {
        if (!confirm("Xác nhận đã giao hàng thành công?")) return;
        setProcessingOrderId(orderId);
        try {
            await orderService.markOrderDelivered(orderId);
            toast.success("Đã giao hàng thành công!");
            fetchAssignedOrders();
        } catch (err: unknown) {
            toast.error("Thao tác thất bại. Vui lòng thử lại.");
        } finally {
            setProcessingOrderId(null);
        }
    };

    const openFailDialog = (order: Order) => {
        setSelectedOrderForFail(order);
        setFailReason("");
    };

    const handleDeliverFail = async () => {
        if (!selectedOrderForFail) return;
        setProcessingOrderId(selectedOrderForFail.orderId || selectedOrderForFail.id!);
        try {
            await orderService.markOrderDeliveryFailed(selectedOrderForFail.orderId || selectedOrderForFail.id!, failReason);
            toast.warning("Đã ghi nhận giao hàng thất bại");
            setSelectedOrderForFail(null);
            fetchAssignedOrders();
        } catch (err: unknown) {
            toast.error("Thao tác thất bại.");
        } finally {
            setProcessingOrderId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, "success" | "warning" | "info" | "secondary"> = {
            PENDING_PICKUP: "warning",
            PICKED_UP: "success",
            OUT_FOR_DELIVERY: "info",
        };
        const labels: Record<string, string> = {
            PENDING_PICKUP: "Chờ lấy hàng",
            PICKED_UP: "Đã lấy hàng",
            OUT_FOR_DELIVERY: "Đang giao",
        };
        return <Badge variant={map[status] || "secondary"}>{labels[status] || status}</Badge>;
    };

    const canPickUp = (status: string) => status === "PENDING_PICKUP";
    const canStartDelivery = (status: string) => status === "PICKED_UP";
    const canDeliver = (status: string) => status === "OUT_FOR_DELIVERY";

    return (
        <div className="space-y-6">
            <PageHeader
                title="Đơn hàng được giao"
                description="Danh sách đơn hàng bạn được phân công lấy và giao"
            />

            {error && (
                <Alert type="error">{error}</Alert>
            )}

            {isLoading ? (
                <div className="flex justify-center py-12">
                    <LoadingSpinner />
                </div>
            ) : orders.length === 0 ? (
                <Card className="p-12 text-center">
                    <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Bạn chưa được giao đơn hàng nào</p>
                    <p className="text-gray-400 text-sm mt-2">Các đơn hàng mới sẽ xuất hiện ở đây khi được phân công</p>
                </Card>
            ) : (
                <>
                    {/* Stats Summary */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 rounded-lg">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Chờ lấy</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {orders.filter(o => o.status === "PENDING_PICKUP").length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Navigation className="h-5 w-5 text-blue-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Đang giao</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {orders.filter(o => o.status === "OUT_FOR_DELIVERY").length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Đã lấy</p>
                                    <p className="text-xl font-bold text-gray-900">
                                        {orders.filter(o => o.status === "PICKED_UP").length}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Order Cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {orders.map((order) => (
                            <Card key={order.orderId} className="p-5 hover:shadow-md transition-shadow">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Mã vận đơn</p>
                                        <p className="font-bold text-gray-900">{order.trackingNumber}</p>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>

                                {/* Sender Info */}
                                <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Người gửi</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="font-medium">{order.senderName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                        <a href={`tel:${order.senderPhone}`} className="hover:text-primary-600">
                                            {order.senderPhone}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{order.senderAddress}</span>
                                    </div>
                                </div>

                                {/* Receiver Info */}
                                <div className="bg-primary-50 rounded-lg p-4 mb-4 space-y-2">
                                    <p className="text-xs font-medium text-primary-600 uppercase tracking-wide">Người nhận</p>
                                    <div className="flex items-center gap-2 text-gray-700">
                                        <User className="h-4 w-4 text-primary-400" />
                                        <span className="font-medium">{order.receiverName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Phone className="h-4 w-4 text-primary-400" />
                                        <a href={`tel:${order.receiverPhone}`} className="hover:text-primary-600">
                                            {order.receiverPhone}
                                        </a>
                                    </div>
                                    <div className="flex items-start gap-2 text-gray-600">
                                        <MapPin className="h-4 w-4 text-primary-400 mt-0.5 flex-shrink-0" />
                                        <span className="text-sm">{order.receiverAddress}</span>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                    <span className="text-xs text-gray-400">
                                        {formatDate(order.createdAt)}
                                    </span>
                                    {canPickUp(order.status) && (
                                        <Button
                                            onClick={() => handleMarkPickedUp(order.orderId || order.id!)}
                                            disabled={!!processingOrderId}
                                            size="sm"
                                        >
                                            {processingOrderId === (order.orderId || order.id!) ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <>
                                                    <CheckCircle className="h-4 w-4 mr-1" />
                                                    Lấy hàng
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {canStartDelivery(order.status) && (
                                        <Button
                                            onClick={() => handleStartDelivery(order.orderId || order.id!)}
                                            disabled={!!processingOrderId}
                                            size="sm"
                                            className="bg-blue-600 hover:bg-blue-700"
                                        >
                                            {processingOrderId === (order.orderId || order.id!) ? (
                                                <LoadingSpinner size="sm" />
                                            ) : (
                                                <>
                                                    <Play className="h-4 w-4 mr-1" />
                                                    Bắt đầu giao
                                                </>
                                            )}
                                        </Button>
                                    )}
                                    {canDeliver(order.status) && (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => handleNavigate(order)}
                                                size="sm"
                                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                            >
                                                <Map className="h-4 w-4 mr-1" />
                                                Chỉ đường
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => openFailDialog(order)}
                                                disabled={!!processingOrderId}
                                                size="sm"
                                                className="text-red-600 border-red-200 hover:bg-red-50"
                                            >
                                                <XCircle className="h-4 w-4 mr-1" />
                                                Thất bại
                                            </Button>
                                            <Button
                                                onClick={() => handleDeliverSuccess(order.orderId || order.id!)}
                                                disabled={!!processingOrderId}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white"
                                            >
                                                {processingOrderId === (order.orderId || order.id!) ? (
                                                    <LoadingSpinner size="sm" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        Đã giao
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationControls
                            page={page}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                            onPageChange={setPage}
                        />
                    )}
                </>
            )}
            {/* Fail Dialog */}
            <Dialog open={!!selectedOrderForFail} onOpenChange={(open) => !open && setSelectedOrderForFail(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Báo cáo giao hàng thất bại</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Input
                            placeholder="Lý do thất bại (Vd: Khách không nghe máy, Sai địa chỉ...)"
                            value={failReason}
                            onChange={(e) => setFailReason(e.target.value)}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSelectedOrderForFail(null)}>Hủy</Button>
                        <Button variant="danger" onClick={handleDeliverFail} disabled={!failReason}>Xác nhận thất bại</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
