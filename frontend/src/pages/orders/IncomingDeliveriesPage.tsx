import { useState } from "react";
import { Package, User, Calendar, DollarSign, Phone } from "lucide-react";
import {
    Card,
    Table,
    PageHeader,
    Badge
} from "../../components/ui";
import { formatCurrency, formatDate } from "../../lib/utils";

// Mock data type
interface IncomingDelivery {
    id: string;
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    sendDate: string;
    shippingFee: number;
    shipperName: string;
    shipperPhone: string;
    status: string;
}

// Generate mock data
const MOCK_INCOMING_DELIVERIES: IncomingDelivery[] = [
    {
        id: "1",
        trackingNumber: "VN0000000001",
        senderName: "Nguyễn Văn A",
        senderPhone: "0901234567",
        sendDate: "2026-01-18T08:30:00",
        shippingFee: 35000,
        shipperName: "Shipper Đống Đa 1",
        shipperPhone: "0940100001",
        status: "OUT_FOR_DELIVERY"
    },
    {
        id: "2",
        trackingNumber: "VN0000000002",
        senderName: "Trần Thị B",
        senderPhone: "0912345678",
        sendDate: "2026-01-18T09:15:00",
        shippingFee: 42000,
        shipperName: "Shipper Đống Đa 2",
        shipperPhone: "0940100002",
        status: "OUT_FOR_DELIVERY"
    }
];

export function IncomingDeliveriesPage() {
    const [deliveries] = useState<IncomingDelivery[]>(MOCK_INCOMING_DELIVERIES);

    const getStatusBadge = (status: string) => {
        const map: Record<string, "info" | "warning"> = {
            AT_DESTINATION_OFFICE: "info",
            OUT_FOR_DELIVERY: "warning"
        };
        const labels: Record<string, string> = {
            AT_DESTINATION_OFFICE: "Tại bưu cục",
            OUT_FOR_DELIVERY: "Đang giao"
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
                            {deliveries.length === 0 ? (
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
                                    const estimatedDelivery = new Date(delivery.sendDate);
                                    if (delivery.status === "OUT_FOR_DELIVERY") {
                                        estimatedDelivery.setHours(estimatedDelivery.getHours() + 2);
                                    } else {
                                        estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
                                    }

                                    return (
                                        <tr key={delivery.id} className="border-t hover:bg-gray-50 transition-colors">
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
                                                {formatDate(delivery.sendDate)}
                                            </td>
                                            <td className="py-3 px-4">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {delivery.shipperName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center gap-1">
                                                        <Phone className="h-3 w-3" />
                                                        {delivery.shipperPhone}
                                                    </p>
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
