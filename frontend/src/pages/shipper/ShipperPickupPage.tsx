import { useState, useEffect, useRef, useCallback } from 'react';
import { orderService, Order } from '../../services/orderService';
import {
    Package, MapPin, Navigation, Phone, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { ShipperDeliveryMapPanel } from '../../components/map/ShipperDeliveryMapPanel';


const ShipperDeliveryPage = () => {
    const [page, setPage] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [failReason, setFailReason] = useState('');
    const [showFailDialog, setShowFailDialog] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [pageSize, setPageSize] = useState(10);
    const abortControllerRef = useRef<AbortController | null>(null);
    // const listContainerRef = useRef<HTMLDivElement>(null);

    // Calculate page size based on screen height
    useEffect(() => {
        const updatePageSize = () => {
            const height = window.innerHeight;
            // Mobile: Calculate based on full viewport - header and controls
            // Each order card is approximately 160px tall on mobile, 120px on wide screens
            const itemHeight = window.innerWidth >= 1024 ? 120 : 160;
            const availableHeight = height - 400; // Subtract header, search bar, padding
            const calculatedSize = Math.max(5, Math.floor(availableHeight / itemHeight));
            setPageSize(calculatedSize);
        };

        updatePageSize();
        window.addEventListener('resize', updatePageSize);
        return () => window.removeEventListener('resize', updatePageSize);
    }, []);

    const fetchOrders = useCallback(async (searchQuery: string) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);
        try {
            const res = await orderService.getShipperDeliveryOrders({
                page,
                size: pageSize,
                search: searchQuery.trim() || undefined
            });
            if (controller.signal.aborted) return;
            setOrders(res.content);
            setTotalPages(res.totalPages);
            setTotalElements(res.totalElements);
        } catch (error) {
            if ((error as any).name === "CanceledError" || (error as any).code === "ERR_CANCELED") {
                return;
            }
            console.error(error);
            toast.error('Không thể tải đơn hàng giao hàng');
        } finally {
            if (!controller.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [page, pageSize]);

    // Pagination on page/size change
    useEffect(() => {
        fetchOrders(searchQuery);
    }, [page, pageSize]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setPage(0);
            fetchOrders(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchOrders]);

    const handleDeliverOrder = async (orderId: string) => {
        if (!window.confirm('Xác nhận giao hàng thành công?')) return;

        setProcessingId(orderId);
        try {
            const res = await orderService.markOrderDelivered(orderId);
            if (res.success) {
                toast.success('Đơn hàng đã được giao');
                fetchOrders(searchQuery);
            } else {
                toast.error(res.message || 'Không thể cập nhật đơn hàng');
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể xác nhận giao hàng');
        } finally {
            setProcessingId(null);
        }
    };

    const handleFailDelivery = async () => {
        if (!selectedOrder || !failReason.trim()) return;

        setProcessingId(selectedOrder.orderId);
        try {
            const res = await orderService.markOrderDeliveryFailed(selectedOrder.orderId, failReason);
            if (res.success) {
                toast.success('Đơn hàng giao hàng thất bại');
                setShowFailDialog(false);
                setFailReason('');
                setSelectedOrder(null);
                fetchOrders(searchQuery);
            } else {
                toast.error(res.message || 'Không thể cập nhật đơn hàng');
            }
        } catch (error) {
            console.error(error);
            toast.error('Không thể ghi lại lỗi giao hàng');
        } finally {
            setProcessingId(null);
        }
    };

    const handleNavigate = (address: string) => {
        const encodedAddress = encodeURIComponent(address);
        window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
    };

    const handleCall = (phone: string) => {
        window.open(`tel:${phone}`, '_self');
    };


    if (isLoading && orders.length === 0) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <Loader2 className="animate-spin h-10 w-10 text-primary-600" />
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
                <h1 className="text-2xl font-bold mb-2 flex items-center">
                    <Package className="mr-2 h-6 w-6 text-primary-600" />
                    Đơn hàng cần giao
                </h1>
                <p className="text-gray-600 text-sm">Danh sách đơn hàng cần giao cho khách hàng (Giai đoạn giao hàng)</p>
            </div>

            {/* Mobile layout - full width list */}
            <div className="lg:hidden p-4">
                {/* Search card for mobile */}
                <div className="mb-4 bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 whitespace-nowrap">
                        <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                            {totalElements}
                        </span>
                        <span className="text-sm font-semibold text-gray-700">đơn hàng</span>
                    </div>
                    <input
                        type="text"
                        placeholder="Tìm kiếm..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                {orders.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-4">
                        <p>Không có đơn hàng nào cần giao lúc này</p>
                        <p className="text-gray-400 text-sm mt-2">Đơn hàng mới trong giai đoạn giao hàng sẽ xuất hiện ở đây</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order.orderId} className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
                                {/* Header - Tracking & Price */}
                                <div className="bg-gray-50 p-3 border-b border-gray-100 flex justify-between items-center">
                                    <span className="font-mono font-bold text-primary-700">{order.trackingNumber}</span>
                                    {order.codAmount > 0 && (
                                        <span className="bg-red-100 text-red-800 text-xs font-semibold px-2 py-1 rounded">
                                            COD: {order.codAmount.toLocaleString()} đ
                                        </span>
                                    )}
                                </div>

                                <div className="p-4">
                                    {/* Receiver Info */}
                                    <div className="mb-4">
                                        <h3 className="font-semibold text-gray-900">{order.receiverName}</h3>
                                        <div className="flex items-start mt-1 text-gray-600 text-sm">
                                            <MapPin className="h-4 w-4 mt-0.5 mr-1 flex-shrink-0" />
                                            {/* Refactored: Display receiver address using names for UI (codes available for API) */}
                                            <p>{order.receiverAddressLine1}, {order.receiverWardName}, {order.receiverProvinceName}</p>
                                        </div>
                                        <div className="flex items-center mt-1 text-gray-600 text-sm">
                                            <Phone className="h-4 w-4 mr-1" />
                                            <p>{order.receiverPhone}</p>
                                        </div>
                                    </div>

                                    {/* Package Info */}
                                    <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                        <p>Loại: {order.packageType}</p>
                                        {order.deliveryInstructions && (
                                            <p className="mt-1 text-amber-700 font-medium">
                                                Ghi chú: {order.deliveryInstructions}
                                            </p>
                                        )}
                                    </div>

                                    {/* Actions Row */}
                                    <div className="grid grid-cols-4 gap-2 mt-2">
                                        <button
                                            onClick={() => handleNavigate(`${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}`)}
                                            className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                        >
                                            <Navigation className="h-5 w-5 mb-1" />
                                            <span className="text-xs font-medium">Bản đồ</span>
                                        </button>

                                        <button
                                            onClick={() => handleCall(order.receiverPhone)}
                                            className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                                        >
                                            <Phone className="h-5 w-5 mb-1" />
                                            <span className="text-xs font-medium">Gọi</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setSelectedOrder(order);
                                                setShowFailDialog(true);
                                            }}
                                            disabled={processingId === order.orderId}
                                            className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                                        >
                                            {processingId === order.orderId ? (
                                                <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                                            ) : (
                                                <XCircle className="h-5 w-5 mb-1" />
                                            )}
                                            <span className="text-xs font-medium">Không</span>
                                        </button>

                                        <button
                                            onClick={() => handleDeliverOrder(order.orderId)}
                                            disabled={processingId === order.orderId}
                                            className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition disabled:opacity-50"
                                        >
                                            {processingId === order.orderId ? (
                                                <Loader2 className="h-5 w-5 mb-1 animate-spin" />
                                            ) : (
                                                <CheckCircle className="h-5 w-5 mb-1" />
                                            )}
                                            <span className="text-xs font-medium">Xong</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Mobile Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-center mt-6 gap-2">
                        <button
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                            disabled={page === 0}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                        >
                            Trước
                        </button>
                        <span className="px-4 py-2 text-sm font-medium">
                            {page + 1} / {totalPages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={page === totalPages - 1}
                            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                        >
                            Sau
                        </button>
                    </div>
                )}
            </div>

            {/* Wide screen layout: Map + List side by side */}
            <div className="hidden lg:grid lg:grid-cols-2 lg:gap-4 lg:p-4 lg:h-[calc(100vh-10rem)]">
                {/* Map panel - left side */}
                <div className="overflow-y-auto">
                    {!isLoading && orders.length > 0 ? (
                        <ShipperDeliveryMapPanel orders={orders} />
                    ) : (
                        <div className="h-[400px] rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                            <div className="text-center text-gray-500">
                                <Package className="h-12 w-12 mx-auto mb-2 opacity-30" />
                                <p className="text-sm">Không có đơn hàng để hiển thị</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* List panel - right side */}
                <div className="overflow-y-auto border-l border-gray-200 pl-4">
                    <div className="sticky top-0 bg-white mb-3">
                        <div className="bg-white border border-gray-200 rounded-lg p-3 flex items-center gap-3">
                            <div className="flex items-center gap-2 whitespace-nowrap">
                                <span className="inline-block bg-primary-100 text-primary-700 text-xs font-bold px-2.5 py-1 rounded-full">
                                    {totalElements}
                                </span>
                                <span className="text-sm font-semibold text-gray-700">đơn hàng</span>
                            </div>
                            <input
                                type="text"
                                placeholder="Tìm kiếm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                    {orders.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">
                                {searchQuery ? 'Không tìm thấy kết quả' : 'Không có đơn hàng'}
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-2 mt-2">
                                {orders.map((order) => (
                                    <div key={order.orderId} className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow flex items-stretch">
                                        {/* Left Section - Tracking */}
                                        <div className="bg-gray-50 px-3 py-2 border-r border-gray-200 flex items-center min-w-fit">
                                            <div>
                                                <p className="font-mono font-bold text-primary-700 text-xs">{order.trackingNumber}</p>
                                                {order.codAmount > 0 && (
                                                    <p className="text-xs text-red-600 font-semibold mt-0.5">COD: {order.codAmount.toLocaleString()}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Middle Section - Info */}
                                        <div className="flex-1 px-3 py-2 flex flex-col justify-center min-w-0">
                                            <p className="font-semibold text-gray-900 text-xs truncate">{order.receiverName}</p>
                                            <div className="flex items-center gap-2 text-gray-600 text-xs mt-0.5">
                                                <div className="flex items-center gap-0.5 truncate">
                                                    <MapPin className="h-3 w-3 flex-shrink-0" />
                                                    {/* Refactored: Display receiver address using names for UI */}
                                                    <p className="truncate">{order.receiverAddressLine1}, {order.receiverWardName}, {order.receiverProvinceName}</p>
                                                </div>
                                                <span className="text-gray-400">•</span>
                                                <div className="flex items-center gap-0.5 flex-shrink-0">
                                                    <Phone className="h-3 w-3" />
                                                    <a href={`tel:${order.receiverPhone}`} className="hover:text-primary-600">
                                                        {order.receiverPhone}
                                                    </a>
                                                </div>
                                            </div>
                                            {order.deliveryInstructions && (
                                                <p className="text-amber-700 text-xs mt-1 truncate">📌 {order.deliveryInstructions}</p>
                                            )}
                                        </div>

                                        {/* Right Section - Actions */}
                                        <div className="flex items-center gap-1 px-2 py-2 bg-gray-50 border-l border-gray-200 flex-shrink-0">
                                            <button
                                                onClick={() => handleNavigate(`${order.receiverAddressLine1}, ${order.receiverWardName}, ${order.receiverProvinceName}`)}
                                                className="p-1.5 rounded text-blue-700 hover:bg-blue-100 transition"
                                                title="Chỉ đường"
                                            >
                                                <Navigation className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => handleCall(order.receiverPhone)}
                                                className="p-1.5 rounded text-green-700 hover:bg-green-100 transition"
                                                title="Gọi"
                                            >
                                                <Phone className="h-4 w-4" />
                                            </button>

                                            <button
                                                onClick={() => {
                                                    setSelectedOrder(order);
                                                    setShowFailDialog(true);
                                                }}
                                                disabled={processingId === order.orderId}
                                                className="p-1.5 rounded text-red-700 hover:bg-red-100 transition disabled:opacity-50"
                                                title="Giao hàng thất bại"
                                            >
                                                {processingId === order.orderId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <XCircle className="h-4 w-4" />
                                                )}
                                            </button>

                                            <button
                                                onClick={() => handleDeliverOrder(order.orderId)}
                                                disabled={processingId === order.orderId}
                                                className="p-1.5 rounded bg-primary-100 text-primary-700 hover:bg-primary-200 transition disabled:opacity-50"
                                                title="Đã giao"
                                            >
                                                {processingId === order.orderId ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <CheckCircle className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Wide-screen Pagination */}
                            {orders.length > 0 && (
                                <div className="flex justify-between items-center py-3 border-t border-gray-200 mt-3 px-2">
                                    <span className="text-xs text-gray-600">
                                        Trang {page + 1} / {totalPages} ({totalElements} kết quả)
                                    </span>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => setPage(p => Math.max(0, p - 1))}
                                            disabled={page === 0}
                                            className="px-2 py-1 text-xs bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200"
                                        >
                                            ← Trước
                                        </button>
                                        <button
                                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                                            disabled={page >= totalPages - 1}
                                            className="px-2 py-1 text-xs bg-gray-100 rounded disabled:opacity-50 hover:bg-gray-200"
                                        >
                                            Sau →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Fail Reason Dialog */}
            {showFailDialog && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Ghi lại giao hàng thất bại</h3>
                        <p className="text-sm text-gray-600 mb-2">Đơn hàng: {selectedOrder.trackingNumber}</p>
                        <textarea
                            className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            rows={3}
                            placeholder="Lý do thất bại (ví dụ: Người nhận không có ở nhà)"
                            value={failReason}
                            onChange={(e) => setFailReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => {
                                    setShowFailDialog(false);
                                    setFailReason('');
                                    setSelectedOrder(null);
                                }}
                                disabled={processingId === selectedOrder.orderId}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded text-sm"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleFailDelivery}
                                disabled={!failReason.trim() || processingId === selectedOrder.orderId}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-2"
                            >
                                {processingId === selectedOrder.orderId && <Loader2 className="w-4 h-4 animate-spin" />}
                                Xác nhận thất bại
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipperDeliveryPage;
