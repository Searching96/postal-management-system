import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getShipperLocationForOrder, ShipperLocation } from "../../services/trackingService";
import { DeliveryMap } from "../../components/map/DeliveryMap";
import { Card, LoadingSpinner, Alert } from "../../components/ui";
import { Phone, User, Clock, MapPin } from "lucide-react";
import { formatDate } from "../../lib/utils";

export function LiveTrackingPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const [location, setLocation] = useState<ShipperLocation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!orderId) return;

        const fetchLocation = async () => {
            try {
                const data = await getShipperLocationForOrder(orderId);
                setLocation(data);
                setError(null);
            } catch (err: unknown) {
                // If 404/400, it usually means order not OUT_FOR_DELIVERY or no active session
                setError("Hiện tại không có thông tin vị trí trực tiếp cho đơn hàng này. Bưu tá có thể chưa bắt đầu giao hàng hoặc phiên theo dõi đã kết thúc.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchLocation();

        // Poll for updates every 10 seconds
        const interval = setInterval(fetchLocation, 10000);
        return () => clearInterval(interval);
    }, [orderId]);

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <LoadingSpinner />
            </div>
        );
    }

    if (error || !location) {
        return (
            <div className="max-w-3xl mx-auto py-10 px-4">
                <Alert type="info">
                    <div className="font-bold mb-1">Thông báo</div>
                    {error || "Không tìm thấy thông tin theo dõi"}
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-6 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Theo dõi trực tuyến</h1>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="w-4 h-4" />
                    <span>Cập nhật: {formatDate(location.timestamp)}</span>
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                {/* Map Section */}
                <div className="md:col-span-2">
                    <DeliveryMap shipperLocation={location} />
                </div>

                {/* Info Section */}
                <div className="space-y-4">
                    <Card className="p-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-blue-600" />
                            Thông tin bưu tá
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <p className="text-xs text-gray-500 uppercase">Họ tên</p>
                                <p className="font-medium">{location.shipperName}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 uppercase">Số điện thoại</p>
                                <a href={`tel:${location.shipperPhone}`} className="flex items-center gap-2 font-medium text-blue-600 hover:underline">
                                    <Phone className="w-4 h-4" />
                                    {location.shipperPhone}
                                </a>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Bưu tá đang di chuyển
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-5 bg-blue-50 border-blue-100">
                        <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                            <MapPin className="w-5 h-5" />
                            Lưu ý
                        </h3>
                        <p className="text-sm text-blue-800">
                            Vị trí được cập nhật tự động mỗi 10 giây. Vui lòng giữ liên lạc qua điện thoại để nhận hàng.
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
}
