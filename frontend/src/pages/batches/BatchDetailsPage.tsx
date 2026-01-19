import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft,
    Package,
    Truck,
    CheckCircle2,
    XCircle,
    MapPin,
    Calendar,
    Weight,
    Layers
} from "lucide-react";
import {
    Card,
    Button,
    Table,
    Badge,
    LoadingSpinner
} from "../../components/ui";
import { batchService, BatchPackageResponse } from "../../services/batchService";
import { BatchStatusBadge } from "../../components/batch/BatchStatusBadge";
import { toast } from "sonner";

export function BatchDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [batch, setBatch] = useState<BatchPackageResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchBatchDetails = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const res = await batchService.getBatchById(id, true);
            setBatch(res);
        } catch (error) {
            console.error(error);
            toast.error("Không thể tải thông tin kiện hàng");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBatchDetails();
    }, [id]);

    const handleAction = async (action: () => Promise<any>, successMsg: string) => {
        setIsActionLoading(true);
        try {
            await action();
            toast.success(successMsg);
            fetchBatchDetails();
        } catch (error) {
            console.error(error);
            toast.error("Thao tác thất bại");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-20"><LoadingSpinner size="lg" /></div>;
    if (!batch) return <div className="text-center p-20">Kiện hàng không tồn tại</div>;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => navigate("/batches")}>
                    <ChevronLeft className="h-4 w-4 mr-1" /> Quay lại
                </Button>
            </div>

            <div className="flex justify-between items-start">
                <div className="space-y-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold uppercase tracking-wider">{batch.batchCode}</h1>
                        <BatchStatusBadge status={batch.status} />
                    </div>
                    <p className="text-gray-500">Người tạo: Hệ thống • {new Date(batch.createdAt).toLocaleString()}</p>
                </div>

                <div className="flex gap-2">
                    {batch.status === "OPEN" && (
                        <>
                            <Button
                                variant="outline"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                disabled={isActionLoading}
                                onClick={() => handleAction(() => batchService.cancelBatch(batch!.id), "Đã hủy kiện hàng")}
                            >
                                <XCircle className="w-4 h-4 mr-2" /> Hủy kiện
                            </Button>
                            <Button
                                disabled={isActionLoading}
                                onClick={() => handleAction(() => batchService.sealBatch(batch!.id), "Đã niêm phong kiện hàng")}
                            >
                                <Layers className="w-4 h-4 mr-2" /> Niêm phong
                            </Button>
                        </>
                    )}
                    {batch.status === "SEALED" && (
                        <Button
                            disabled={isActionLoading}
                            onClick={() => handleAction(() => batchService.dispatchBatch(batch!.id), "Đã bắt đầu vận chuyển")}
                        >
                            <Truck className="w-4 h-4 mr-2" /> Vận chuyển
                        </Button>
                    )}
                    {batch.status === "IN_TRANSIT" && (
                        <Button
                            disabled={isActionLoading}
                            onClick={() => handleAction(() => batchService.markBatchArrived(batch!.id), "Đã xác nhận đến")}
                        >
                            <MapPin className="w-4 h-4 mr-2" /> Xác nhận đến
                        </Button>
                    )}
                    {batch.status === "ARRIVED" && (
                        <Button
                            disabled={isActionLoading}
                            onClick={() => handleAction(() => batchService.distributeBatch(batch!.id), "Đã hoàn tất dỡ hàng")}
                        >
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Dỡ hàng & Phân phối
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Hành trình</h3>
                    <div className="space-y-4">
                        <div className="flex gap-3">
                            <div className="mt-1"><MapPin className="h-4 w-4 text-primary-500" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Điểm đi</p>
                                <p className="font-medium">{batch.originOfficeName}</p>
                            </div>
                        </div>
                        <div className="ml-2 w-0.5 h-6 bg-gray-200"></div>
                        <div className="flex gap-3">
                            <div className="mt-1"><MapPin className="h-4 w-4 text-orange-500" /></div>
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">Điểm đến</p>
                                <p className="font-medium">{batch.destinationOfficeName}</p>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Thông số kiện</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1 uppercase font-bold">
                                <Package className="h-3 w-3" /> Tổng số đơn
                            </p>
                            <p className="text-xl font-bold">{batch.orderCount}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs text-gray-500 flex items-center gap-1 uppercase font-bold">
                                <Weight className="h-3 w-3" /> Tổng trọng lượng
                            </p>
                            <p className="text-xl font-bold">{batch.totalWeight} kg</p>
                        </div>
                        <div className="space-y-1 col-span-2">
                            <p className="text-xs text-gray-500 flex items-center gap-1 uppercase font-bold">
                                <Calendar className="h-3 w-3" /> Cập nhật lần cuối
                            </p>
                            <p className="font-medium">{new Date(batch.updatedAt).toLocaleString()}</p>
                        </div>
                    </div>
                </Card>

                <Card className="p-5 space-y-4">
                    <h3 className="font-semibold text-gray-900 border-b pb-2">Lưu ý</h3>
                    <div className="p-3 bg-blue-50 text-blue-800 text-sm rounded-md border border-blue-100">
                        {batch.status === "OPEN" && "Kiện hàng đang mở, bạn có thể thêm hoặc bớt đơn hàng trước khi niêm phong."}
                        {batch.status === "SEALED" && "Kiện hàng đã được niêm phong và sẵn sàng để vận chuyển."}
                        {batch.status === "IN_TRANSIT" && "Kiện hàng đang trên đường vận chuyển tới điểm đến."}
                        {batch.status === "ARRIVED" && "Kiện hàng đã tới bưu cục đích. Vui lòng xác nhận dỡ hàng."}
                        {batch.status === "DISTRIBUTED" && "Kiện hàng đã được dỡ và các đơn hàng đã được phân phối thành công."}
                    </div>
                </Card>
            </div>

            <Card className="overflow-hidden">
                <div className="bg-gray-50 px-6 py-3 border-b flex justify-between items-center">
                    <h3 className="font-semibold">Danh sách đơn hàng trong kiện</h3>
                    <Badge variant="secondary">{batch.orderCount} Đơn hàng</Badge>
                </div>
                <Table>
                    <thead>
                        <tr>
                            <th className="text-left py-3 px-6">Mã vận đơn</th>
                            <th className="text-left py-3 px-4">Người nhận</th>
                            <th className="text-left py-3 px-4">Địa chỉ</th>
                            <th className="text-center py-3 px-4">Trọng lượng</th>
                            <th className="text-right py-3 px-6">Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batch.orders && batch.orders.length > 0 ? (
                            batch.orders.map((order: any) => (
                                <tr key={order.id} className="border-t">
                                    <td className="py-3 px-6 font-medium text-primary-600">{order.trackingNumber}</td>
                                    <td className="py-3 px-4">{order.receiverName}</td>
                                    <td className="py-3 px-4 max-w-xs truncate">{`${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}`}</td>
                                    <td className="py-3 px-4 text-center">{order.weightKg} kg</td>
                                    <td className="py-3 px-6 text-right">
                                        <Button variant="ghost" size="sm" onClick={() => navigate(`/orders/${order.id}`)}>
                                            Xem
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center py-10 text-gray-400">Không có đơn hàng nào trong kiện này</td>
                            </tr>
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
}
