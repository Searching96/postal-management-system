import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { orderService } from "../../services/orderService";
import { Card, Button, Badge } from "../../components/ui";
import { formatCurrency, formatDateTime } from "../../lib/utils";
import { handlePrintReceipt } from "../../lib/printHelper";
import { Loader2, Printer, Receipt, Package, MapPin, Calendar, CreditCard, ArrowLeft, CheckCircle, XCircle, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../lib/AuthContext";

export function OrderDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        if (!id) return;
        loadOrder();
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            const res = await orderService.getOrderById(id!);
            setOrder(res);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptOrder = async () => {
        if (!order) return;
        try {
            setActionLoading(true);
            const res = await orderService.acceptOrder(order.orderId);
            toast.success(res.message);
            loadOrder();
        } catch (error) {
            toast.error("Không thể chấp nhận đơn hàng");
        } finally {
            setActionLoading(false);
        }
    };

    const handleReceiveOrder = async () => {
        if (!order) return;
        try {
            setActionLoading(true);
            const res = await orderService.receiveIncomingOrders({ orderIds: [order.orderId] });
            toast.success(res.message);
            loadOrder();
        } catch (error) {
            toast.error("Không thể xác nhận nhận hàng");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDelivered = async () => {
        if (!order) return;
        try {
            setActionLoading(true);
            const res = await orderService.markOrderDelivered(order.orderId);
            toast.success(res.message);
            loadOrder();
        } catch (error) {
            toast.error("Lỗi khi xác nhận giao hàng");
        } finally {
            setActionLoading(false);
        }
    };

    const handleMarkDeliveryFailed = async () => {
        if (!order) return;
        const note = window.prompt("Nhập lý do giao hàng thất bại:");
        if (note === null) return;
        if (!note.trim()) {
            toast.error("Vui lòng nhập lý do");
            return;
        }

        try {
            setActionLoading(true);
            const res = await orderService.markOrderDeliveryFailed(order.orderId, note);
            toast.success(res.message);
            loadOrder();
        } catch (error) {
            toast.error("Lỗi khi cập nhật trạng thái");
        } finally {
            setActionLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "COMPLETED":
            case "DELIVERED": return "success";
            case "CANCELLED":
            case "DELIVERY_FAILED": return "destructive";
            case "RETURNED": return "warning";
            case "DELIVERING":
            case "OUT_FOR_DELIVERY": return "primary";
            case "SHIPPING":
            case "IN_TRANSIT_TO_HUB":
            case "IN_TRANSIT_TO_OFFICE": return "info";
            case "ACCEPTED":
            case "AT_ORIGIN_OFFICE":
            case "AT_HUB":
            case "AT_DESTINATION_OFFICE": return "primary";
            default: return "default";
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            CREATED: "Mới tạo",
            ACCEPTED: "Đang xử lý",
            SHIPPING: "Đang vận chuyển",
            DELIVERING: "Đang giao",
            COMPLETED: "Hoàn thành",
            DELIVERED: "Đã giao thành công",
            CANCELLED: "Đã hủy",
            RETURNED: "Đã trả lại",
            PENDING_PICKUP: "Chờ bưu tá lấy hàng",
            PICKED_UP: "Đã lấy hàng",
            AT_ORIGIN_OFFICE: "Tại bưu cục gửi",
            IN_TRANSIT_TO_HUB: "Đang chuyển đến kho",
            AT_HUB: "Tại kho tập kết",
            IN_TRANSIT_TO_OFFICE: "Đang chuyển đến bưu cục phát",
            AT_DESTINATION_OFFICE: "Tại bưu cục phát",
            OUT_FOR_DELIVERY: "Đang giao hàng",
            DELIVERY_FAILED: "Giao hàng thất bại"
        };
        return labels[status] || status;
    };

    const renderActionButtons = () => {
        if (!order || !user) return null;

        const role = user.role;
        const buttons = [];

        // Staff Actions
        if (["PO_STAFF", "PO_WARD_MANAGER", "PO_PROVINCE_ADMIN"].includes(role)) {
            if (["CREATED", "PENDING_PICKUP", "PICKED_UP"].includes(order.status)) {
                buttons.push(
                    <Button key="accept" onClick={handleAcceptOrder} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                        <CheckCircle className="mr-2 h-4 w-4" /> Chấp nhận đơn
                    </Button>
                );
            }
            if (order.status === "IN_TRANSIT_TO_OFFICE") {
                buttons.push(
                    <Button key="receive" onClick={handleReceiveOrder} disabled={actionLoading} className="bg-blue-600 hover:bg-blue-700">
                        <Download className="mr-2 h-4 w-4" /> Xác nhận đến
                    </Button>
                );
            }
        }

        // Shipper Actions
        if (role === "SHIPPER" && order.status === "OUT_FOR_DELIVERY") {
            buttons.push(
                <Button key="deliver" onClick={handleMarkDelivered} disabled={actionLoading} className="bg-green-600 hover:bg-green-700">
                    <CheckCircle className="mr-2 h-4 w-4" /> Giao thành công
                </Button>
            );
            buttons.push(
                <Button key="fail" variant="danger" onClick={handleMarkDeliveryFailed} disabled={actionLoading}>
                    <XCircle className="mr-2 h-4 w-4" /> Báo giao lỗi
                </Button>
            );
        }

        return buttons;
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
    );

    if (!order) return (
        <div className="text-center mt-20 space-y-4">
            <h2 className="text-xl font-semibold">Không tìm thấy đơn hàng</h2>
            <Button onClick={() => navigate(-1)}>Quay lại</Button>
        </div>
    );

    const handlePrintLabel = () => {
        window.print();
    };

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-10">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4 no-print">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" className="p-2" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            {order.trackingNumber}
                            <Badge variant={getStatusColor(order.status)} className="text-sm">
                                {getStatusLabel(order.status)}
                            </Badge>
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Tạo ngày {formatDateTime(order.createdAt)}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {renderActionButtons()}
                    <Button variant="outline" onClick={() => handlePrintReceipt(order)}>
                        <Receipt className="mr-2 h-4 w-4" /> In Hóa Đơn
                    </Button>
                    <Button variant="outline" onClick={handlePrintLabel}>
                        <Printer className="mr-2 h-4 w-4" /> In Tem Dán
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Route Info */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-6 flex items-center text-lg">
                            <MapPin className="mr-2 text-primary-600" size={20} /> Lộ trình vận chuyển
                        </h3>
                        <div className="grid md:grid-cols-2 gap-8 relative">
                            {/* Decorative connector line */}
                            <div className="hidden md:block absolute left-1/2 top-10 bottom-10 w-px bg-gray-200 -ml-[0.5px]"></div>

                            <div className="relative">
                                <div className="absolute -right-4 md:-right-[22px] top-1 w-3 h-3 rounded-full bg-blue-500 border-2 border-white ring-1 ring-blue-100 z-10"></div>
                                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Người gửi</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="font-bold text-gray-900 text-lg">{order.senderName}</div>
                                    <div className="text-primary-600 font-mono mb-2">{order.senderPhone}</div>
                                    <div className="text-gray-600 text-sm leading-relaxed">{order.senderAddress}</div>
                                </div>
                            </div>

                            <div className="relative">
                                <div className="absolute -left-4 md:-left-[22px] top-1 w-3 h-3 rounded-full bg-green-500 border-2 border-white ring-1 ring-green-100 z-10"></div>
                                <h4 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">Người nhận</h4>
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <div className="font-bold text-gray-900 text-lg">{order.receiverName}</div>
                                    <div className="text-primary-600 font-mono mb-2">{order.receiverPhone}</div>
                                    <div className="text-gray-600 text-sm leading-relaxed text-right md:text-left">{order.receiverAddress}</div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Package Info */}
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center text-lg">
                            <Package className="mr-2 text-primary-600" size={20} /> Thông tin hàng hóa
                        </h3>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Loại hàng</div>
                                <div className="font-medium">{order.packageType}</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Trọng lượng</div>
                                <div className="font-medium">{order.weightKg} kg</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Kích thước</div>
                                <div className="font-medium">{order.dimensions || `${order.lengthCm}x${order.widthCm}x${order.heightCm}`} cm</div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">Dịch vụ</div>
                                <div className="font-medium">{order.serviceType}</div>
                            </div>
                        </div>
                        {order.packageDescription && (
                            <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
                                <span className="font-semibold">Mô tả:</span> {order.packageDescription}
                            </div>
                        )}
                    </Card>

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <Card className="p-6">
                            <h3 className="font-semibold mb-6 flex items-center text-lg">
                                <Calendar className="mr-2 text-primary-600" size={20} /> Lịch sử hành trình
                            </h3>
                            <div className="relative pl-4 border-l-2 border-gray-100 space-y-8">
                                {order.statusHistory.map((item: any, i: number) => (
                                    <div key={i} className="relative">
                                        <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 border-white ${i === 0 ? 'bg-primary-500 ring-2 ring-primary-100' : 'bg-gray-300'}`}></div>
                                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                            <div>
                                                <div className="font-bold text-gray-900">{getStatusLabel(item.status)}</div>
                                                <div className="text-sm text-gray-600 mt-1">{item.description}</div>
                                                {item.location && <div className="text-xs text-gray-500 mt-1 flex items-center"><MapPin className="h-3 w-3 mr-1" /> {item.location}</div>}
                                            </div>
                                            <div className="text-sm text-gray-400 font-mono whitespace-nowrap">
                                                {formatDateTime(item.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </div>

                {/* Right Column - Status & Payment */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-semibold mb-4 flex items-center text-lg">
                            <CreditCard className="mr-2 text-primary-600" size={20} /> Chi tiết thanh toán
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between py-2 border-b border-gray-50">
                                <span className="text-gray-600">Phí vận chuyển</span>
                                <span className="font-medium">{formatCurrency(order.shippingFee)}</span>
                            </div>
                            {order.currentOfficeName && (
                                <div className="flex justify-between py-2 border-b border-gray-50">
                                    <span className="text-gray-600">Tại bưu cục</span>
                                    <span className="font-medium text-right max-w-[50%]">{order.currentOfficeName}</span>
                                </div>
                            )}

                            <div className="pt-2 space-y-2 mt-2 bg-gray-50 p-3 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Thu hộ (COD)</span>
                                    <span className="font-mono font-medium">{formatCurrency(order.codAmount)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Giá trị khai giá</span>
                                    <span className="font-mono font-medium">{formatCurrency(order.declaredValue || 0)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600">Bảo hiểm</span>
                                    <span className="font-mono font-medium">{formatCurrency(order.insuranceFee)}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center pt-4 border-t mt-2">
                                <span className="font-bold text-gray-900 text-lg">Tổng cộng</span>
                                <span className="font-bold text-primary-700 text-xl">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-primary-50 border-primary-100">
                        <h3 className="font-semibold mb-2 text-primary-800">Thông tin quản lý</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-primary-600">Nhân viên tạo</span>
                                <span className="font-medium text-primary-900">{order.createdByEmployeeName || "N/A"}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-primary-600">Bưu tá (Lấy)</span>
                                <span className="font-medium text-primary-900">{order.assignedShipperName || "Chưa phân công"}</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
