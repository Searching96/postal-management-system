import { useState, useEffect } from 'react';
import { orderService } from '../../services/orderService';
import {
    Package, TrendingUp, CheckCircle, Clock,
    Truck, MapPin, ChevronRight, BarChart3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface DashboardStats {
    pendingPickups: number;
    pendingDeliveries: number;
    completedPickups: number;
    completedDeliveries: number;
}

const ShipperDashboardPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<DashboardStats>({
        pendingPickups: 0,
        pendingDeliveries: 0,
        completedPickups: 0,
        completedDeliveries: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            setIsLoading(true);
            try {
                // Parallel requests to get counts
                const [
                    pendingPickupsRes,
                    pendingDeliveriesRes,
                    completedPickupsRes,
                    completedDeliveriesRes
                ] = await Promise.all([
                    orderService.getShipperAssignedOrders({ status: 'ACCEPTED,PENDING_PICKUP', size: 1 }),
                    orderService.getShipperDeliveryOrders({ status: 'OUT_FOR_DELIVERY', size: 1 }),
                    orderService.getShipperAssignedOrders({ status: 'PICKED_UP', size: 1 }),
                    orderService.getShipperDeliveryOrders({ status: 'DELIVERED', size: 1 })
                ]);

                setStats({
                    pendingPickups: pendingPickupsRes.totalElements,
                    pendingDeliveries: pendingDeliveriesRes.totalElements,
                    completedPickups: completedPickupsRes.totalElements,
                    completedDeliveries: completedDeliveriesRes.totalElements
                });
            } catch (error) {
                console.error("Error fetching dashboard stats:", error);
                toast.error("Không thể tải thông tin thống kê");
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const completionRate = () => {
        const totalTasks = stats.pendingPickups + stats.pendingDeliveries + stats.completedPickups + stats.completedDeliveries;
        if (totalTasks === 0) return 0;
        const completed = stats.completedPickups + stats.completedDeliveries;
        return Math.round((completed / totalTasks) * 100);
    };


    const containerVariants = "p-4 space-y-6 max-w-5xl mx-auto pb-24";

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-4rem)]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
        );
    }
    return (
        <div className={containerVariants}>
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
                    <p className="text-gray-500 text-sm mt-1">Xin chào, chúc bạn một ngày làm việc hiệu quả!</p>
                </div>
                <div className="h-10 w-10 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                    <BarChart3 size={20} />
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div
                    onClick={() => navigate('/shipper/pickups')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                            <Package size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Cần lấy</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-gray-900">{stats.pendingPickups}</span>
                        <ChevronRight size={16} className="text-gray-400 mb-1" />
                    </div>
                </div>

                <div
                    onClick={() => navigate('/shipper/deliveries')}
                    className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer active:scale-95 transition-transform"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
                            <Truck size={20} />
                        </div>
                        <span className="text-sm font-medium text-gray-600">Cần giao</span>
                    </div>
                    <div className="flex items-end justify-between">
                        <span className="text-2xl font-bold text-gray-900">{stats.pendingDeliveries}</span>
                        <ChevronRight size={16} className="text-gray-400 mb-1" />
                    </div>
                </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4 opacity-90">
                        <TrendingUp size={18} />
                        <span className="font-medium text-sm">Hiệu suất hôm nay</span>
                    </div>

                    <div className="flex items-center justify-between mb-2">
                        <span className="text-4xl font-bold">{completionRate()}%</span>
                        <div className="text-right">
                            <p className="text-sm opacity-80">Đã hoàn thành</p>
                            <p className="text-lg font-semibold">{stats.completedPickups + stats.completedDeliveries} đơn</p>
                        </div>
                    </div>

                    <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                        <div
                            className="bg-white h-full rounded-full transition-all duration-1000"
                            style={{ width: `${completionRate()}%` }}
                        ></div>
                    </div>
                </div>

                {/* Decorative background circles */}
                <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
            </div>

            {/* Detailed Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-50 text-green-600 rounded-full">
                            <CheckCircle size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Đã lấy thành công</p>
                            <p className="text-xs text-gray-500">Tổng số đơn đã lấy từ khách</p>
                        </div>
                    </div>
                    <span className="font-bold text-gray-900">{stats.completedPickups}</span>
                </div>

                <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-900">Đã giao thành công</p>
                            <p className="text-xs text-gray-500">Tổng số đơn đã giao cho khách</p>
                        </div>
                    </div>
                    <span className="font-bold text-gray-900">{stats.completedDeliveries}</span>
                </div>
            </div>

            {/* Actions Menu */}
            <h3 className="font-bold text-gray-900 mt-2">Thao tác nhanh</h3>
            <div className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate('/shipper/pickups')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition active:scale-95"
                >
                    <Clock className="text-blue-600 mb-2" size={24} />
                    <span className="text-sm font-medium text-gray-700">Lịch sử lấy</span>
                </button>
                <button
                    onClick={() => navigate('/shipper/deliveries')}
                    className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-xl border border-gray-200 hover:bg-gray-100 transition active:scale-95"
                >
                    <CheckCircle className="text-green-600 mb-2" size={24} />
                    <span className="text-sm font-medium text-gray-700">Lịch sử giao</span>
                </button>
            </div>
        </div>
    );
};

export default ShipperDashboardPage;
