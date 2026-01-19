import { useState } from "react";
import { Search, Package, MapPin, Calendar, CheckCircle, Clock, Truck, AlertCircle } from "lucide-react";
import { Card, Button, Input, Badge, LoadingSpinner, Alert } from "../../components/ui";
import { orderService, Order } from "../../services/orderService";
import { formatDate } from "../../lib/utils";

// Status step configuration
const STATUS_STEPS = [
    { key: "CREATED", label: "Đơn hàng đã tạo", icon: Package },
    { key: "PENDING_PICKUP", label: "Chờ lấy hàng", icon: Clock },
    { key: "PICKED_UP", label: "Đã lấy hàng", icon: CheckCircle },
    { key: "IN_TRANSIT_TO_HUB", label: "Đang vận chuyển đến Hub", icon: Truck },
    { key: "AT_HUB", label: "Tại kho Hub", icon: Package },
    { key: "IN_TRANSIT_FROM_HUB", label: "Đang vận chuyển từ Hub", icon: Truck },
    { key: "OUT_FOR_DELIVERY", label: "Đang giao hàng", icon: Truck },
    { key: "DELIVERED", label: "Đã giao hàng", icon: CheckCircle },
];

const CANCELLED_STATUSES = ["CANCELLED", "RETURNED"];

export function TrackOrderPage() {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [hasSearched, setHasSearched] = useState(false);

    const handleTrack = async () => {
        if (!trackingNumber.trim()) {
            setError("Vui lòng nhập mã vận đơn");
            return;
        }

        setIsLoading(true);
        setError("");
        setOrder(null);
        setHasSearched(true);

        try {
            const result = await orderService.trackOrder(trackingNumber.trim());
            if (result) {
                setOrder(result);
            }
        } catch (err: unknown) {
            const status = (err as { response?: { status?: number } }).response?.status;
            if (status === 404) {
                setError("Đơn hàng không tìm thấy với mã vận đơn này");
            } else {
                setError("Đã xảy ra lỗi khi tra cứu. Vui lòng thử lại.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleTrack();
        }
    };

    const getCurrentStepIndex = () => {
        if (!order) return -1;
        if (CANCELLED_STATUSES.includes(order.status)) return -1;
        return STATUS_STEPS.findIndex(step => step.key === order.status);
    };

    const getStatusBadge = (status: string) => {
        const map: Record<string, "success" | "warning" | "danger" | "info" | "secondary"> = {
            CREATED: "info",
            PENDING_PICKUP: "warning",
            PICKED_UP: "info",
            IN_TRANSIT_TO_HUB: "info",
            AT_HUB: "info",
            IN_TRANSIT_FROM_HUB: "info",
            OUT_FOR_DELIVERY: "warning",
            DELIVERED: "success",
            CANCELLED: "danger",
            RETURNED: "danger",
        };
        const labels: Record<string, string> = {
            CREATED: "Mới tạo",
            ACCEPTED: "Đang xử lý",
            PENDING_PICKUP: "Chờ lấy hàng",
            PICKED_UP: "Đã lấy hàng",
            IN_TRANSIT_TO_HUB: "Đang vận chuyển",
            AT_HUB: "Tại kho",
            IN_TRANSIT_FROM_HUB: "Đang vận chuyển",
            OUT_FOR_DELIVERY: "Đang giao",
            DELIVERED: "Đã giao",
            CANCELLED: "Đã hủy",
            RETURNED: "Đã trả lại",
        };
        return <Badge variant={map[status] || "secondary"}>{labels[status] || status}</Badge>;
    };

    const currentStepIndex = getCurrentStepIndex();

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50">
            <div className="max-w-4xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                        <Package className="h-8 w-8 text-primary-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Tra cứu đơn hàng</h1>
                    <p className="text-gray-600">Nhập mã vận đơn để theo dõi trạng thái đơn hàng của bạn</p>
                </div>

                {/* Search Box */}
                <Card className="p-6 mb-8 shadow-lg">
                    <div className="flex gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                                placeholder="Nhập mã vận đơn (VD: VN123456789)"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                onKeyPress={handleKeyPress}
                                className="pl-12 h-12 text-lg"
                            />
                        </div>
                        <Button
                            onClick={handleTrack}
                            disabled={isLoading}
                            className="h-12 px-8 text-base"
                        >
                            {isLoading ? <LoadingSpinner size="sm" /> : "Tra cứu"}
                        </Button>
                    </div>
                </Card>

                {/* Error */}
                {error && (
                    <Alert type="error" className="mb-6">
                        <AlertCircle className="h-5 w-5 mr-2 inline" />
                        {error}
                    </Alert>
                )}

                {/* Result */}
                {order && (
                    <Card className="p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-300">
                        {/* Order Summary Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-sm text-gray-500 mb-1">Mã vận đơn</p>
                                <p className="text-xl font-bold text-gray-900">{order.trackingNumber}</p>
                            </div>
                            <div className="text-right">
                                {getStatusBadge(order.status)}
                            </div>
                        </div>

                        {/* Status Timeline */}
                        {!CANCELLED_STATUSES.includes(order.status) && (
                            <div className="py-8">
                                <div className="relative">
                                    {/* Progress Line */}
                                    <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 rounded-full">
                                        <div
                                            className="h-full bg-primary-500 rounded-full transition-all duration-500"
                                            style={{
                                                width: `${Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100)}%`
                                            }}
                                        />
                                    </div>

                                    {/* Steps */}
                                    <div className="relative flex justify-between">
                                        {STATUS_STEPS.map((step, index) => {
                                            const Icon = step.icon;
                                            const isCompleted = index <= currentStepIndex;
                                            const isCurrent = index === currentStepIndex;

                                            return (
                                                <div
                                                    key={step.key}
                                                    className="flex flex-col items-center"
                                                    style={{ width: `${100 / STATUS_STEPS.length}%` }}
                                                >
                                                    <div
                                                        className={`
                                                            w-10 h-10 rounded-full flex items-center justify-center
                                                            transition-all duration-300 z-10
                                                            ${isCompleted
                                                                ? "bg-primary-500 text-white shadow-lg shadow-primary-200"
                                                                : "bg-gray-200 text-gray-400"
                                                            }
                                                            ${isCurrent ? "ring-4 ring-primary-200 scale-110" : ""}
                                                        `}
                                                    >
                                                        <Icon className="h-5 w-5" />
                                                    </div>
                                                    <p className={`
                                                        mt-3 text-xs text-center max-w-[80px] leading-tight
                                                        ${isCompleted ? "text-primary-700 font-medium" : "text-gray-400"}
                                                    `}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Cancelled/Returned Status */}
                        {CANCELLED_STATUSES.includes(order.status) && (
                            <div className="py-8 text-center">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                                    <AlertCircle className="h-8 w-8 text-red-500" />
                                </div>
                                <p className="text-lg font-medium text-red-600">
                                    {order.status === "CANCELLED" ? "Đơn hàng đã bị hủy" : "Đơn hàng đã được trả lại"}
                                </p>
                            </div>
                        )}

                        {/* Order Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100">
                            {/* Sender */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                    <MapPin className="h-4 w-4" />
                                    Người gửi
                                </div>
                                <p className="font-medium text-gray-900">{order.senderName}</p>
                                <p className="text-sm text-gray-600">{order.senderPhone}</p>
                                {/* Refactored: Display sender address using names */}
                                <p className="text-sm text-gray-600">{`${order.senderAddressLine1}, ${order.senderWardName || ''}, ${order.senderProvinceName || ''}`}</p>
                            </div>

                            {/* Receiver */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
                                    <MapPin className="h-4 w-4" />
                                    Người nhận
                                </div>
                                <p className="font-medium text-gray-900">{order.receiverName}</p>
                                <p className="text-sm text-gray-600">{order.receiverPhone}</p>
                                {/* Refactored: Display receiver address using names */}
                                <p className="text-sm text-gray-600">{`${order.receiverAddressLine1}, ${order.receiverWardName || ''}, ${order.receiverProvinceName || ''}`}</p>
                            </div>
                        </div>

                        {/* Live Tracking Button */}
                        {order.status === "OUT_FOR_DELIVERY" && (
                            <div className="pt-6 mt-6 border-t border-gray-100 flex justify-center">
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700 w-full md:w-auto animate-pulse"
                                    onClick={() => window.open(`/tracking/${order.orderId || order.id!}/live`, '_blank')}
                                >
                                    <MapPin className="h-4 w-4 mr-2" />
                                    Xem vị trí bưu tá
                                </Button>
                            </div>
                        )}

                        {/* Timestamps */}
                        <div className="flex items-center gap-4 pt-6 mt-6 border-t border-gray-100 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                <span>Ngày tạo: {formatDate(order.createdAt)}</span>
                            </div>
                        </div>
                    </Card>
                )}

                {/* No Result */}
                {hasSearched && !isLoading && !order && !error && (
                    <Card className="p-12 text-center">
                        <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">Không tìm thấy đơn hàng</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
