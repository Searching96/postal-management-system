import { useState, useEffect } from 'react';
import { orderService, Order } from '../../services/orderService';
import {
    Package, MapPin, Navigation, Phone, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { toast } from 'sonner';


const ShipperDeliveryPage = () => {
    const [page, setPage] = useState(0);
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [failReason, setFailReason] = useState('');
    const [showFailDialog, setShowFailDialog] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const res = await orderService.getShipperDeliveryOrders({ page, size: 10 });
            setOrders(res.content);
            setTotalPages(res.totalPages);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load delivery orders');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [page]);

    const handleDeliverOrder = async (orderId: string) => {
        if (!window.confirm('Confirm delivery success?')) return;

        setProcessingId(orderId);
        try {
            const res = await orderService.markOrderDelivered(orderId);
            if (res.success) {
                toast.success('Order marked as delivered');
                fetchOrders();
            } else {
                toast.error(res.message || 'Failed to update order');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to mark order as delivered');
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
                toast.success('Order marked as delivery failed');
                setShowFailDialog(false);
                setFailReason('');
                setSelectedOrder(null);
                fetchOrders();
            } else {
                toast.error(res.message || 'Failed to update order');
            }
        } catch (error) {
            console.error(error);
            toast.error('Failed to record delivery failure');
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
        <div className="p-4 max-w-lg mx-auto pb-20">
            <h1 className="text-2xl font-bold mb-4 flex items-center">
                <Package className="mr-2 h-6 w-6 text-primary-600" />
                My Deliveries
            </h1>

            {orders.length === 0 ? (
                <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow p-6">
                    <p>No deliveries assigned currently.</p>
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
                                        <p>{order.receiverAddress}</p>
                                    </div>
                                    <div className="flex items-center mt-1 text-gray-600 text-sm">
                                        <Phone className="h-4 w-4 mr-1" />
                                        <p>{order.receiverPhone}</p>
                                    </div>
                                </div>

                                {/* Package Info */}
                                <div className="text-sm text-gray-500 mb-4 bg-gray-50 p-2 rounded">
                                    <p>Type: {order.packageType}</p>
                                    {order.deliveryInstructions && (
                                        <p className="mt-1 text-amber-700 font-medium">
                                            Note: {order.deliveryInstructions}
                                        </p>
                                    )}
                                </div>

                                {/* Actions Row */}
                                <div className="grid grid-cols-4 gap-2 mt-2">
                                    <button
                                        onClick={() => handleNavigate(order.receiverAddress)}
                                        className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition"
                                    >
                                        <Navigation className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium">Map</span>
                                    </button>

                                    <button
                                        onClick={() => handleCall(order.receiverPhone)}
                                        className="col-span-1 flex flex-col items-center justify-center p-2 rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition"
                                    >
                                        <Phone className="h-5 w-5 mb-1" />
                                        <span className="text-xs font-medium">Call</span>
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
                                        <span className="text-xs font-medium">Fail</span>
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
                                        <span className="text-xs font-medium">Done</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-2">
                    <button
                        onClick={() => setPage(p => Math.max(0, p - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                    >
                        Prev
                    </button>
                    <span className="px-4 py-2 text-sm font-medium">
                        {page + 1} / {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        disabled={page === totalPages - 1}
                        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 text-sm"
                    >
                        Next
                    </button>
                </div>
            )}

            {/* Fail Reason Dialog */}
            {showFailDialog && selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-6 w-full max-w-sm">
                        <h3 className="text-lg font-bold mb-4">Record Failed Delivery</h3>
                        <p className="text-sm text-gray-600 mb-2">Order: {selectedOrder.trackingNumber}</p>
                        <textarea
                            className="w-full border rounded p-2 mb-4 focus:ring-2 focus:ring-red-500 outline-none"
                            rows={3}
                            placeholder="Reason for failure (e.g. Recipient not home)"
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
                                Cancel
                            </button>
                            <button
                                onClick={handleFailDelivery}
                                disabled={!failReason.trim() || processingId === selectedOrder.orderId}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm flex items-center gap-2"
                            >
                                {processingId === selectedOrder.orderId && <Loader2 className="w-4 h-4 animate-spin" />}
                                Confirm Failure
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShipperDeliveryPage;
