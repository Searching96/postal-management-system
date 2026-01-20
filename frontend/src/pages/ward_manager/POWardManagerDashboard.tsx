import {
    Package,
    Users,
    TrendingUp,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    BarChart3,
    PieChart,
    Activity,
    MessageSquare,
    Truck,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { Card, PageHeader } from '../../components/ui';

export function POWardManagerDashboard() {
    // Mock Data for Post Office
    const stats = [
        {
            label: 'Đơn hàng mới',
            value: '246',
            change: '+18.2%',
            trend: 'up',
            icon: Package,
            color: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Chờ lấy hàng',
            value: '14',
            change: '-12%',
            trend: 'down',
            icon: Truck,
            color: 'from-orange-500 to-orange-600'
        },
        {
            label: 'Tỷ lệ giao hàng',
            value: '98.5%',
            change: '+0.5%',
            trend: 'up',
            icon: TrendingUp,
            color: 'from-green-500 to-green-600'
        },
        {
            label: 'Khiếu nại chưa xử lý',
            value: '3',
            change: '0',
            trend: 'neutral',
            icon: MessageSquare,
            color: 'from-red-500 to-red-600'
        },
    ];

    const recentActivity = [
        { id: 1, type: 'ORDER', title: 'Đã nhận đơn hàng #VN88291 tại bưu cục', status: 'success', time: '5 phút trước' },
        { id: 2, type: 'SHIPPER', title: 'Bưu tá Lê Văn B đã hoàn thành ca giao', status: 'info', time: '15 phút trước' },
        { id: 3, type: 'COMPLAINT', title: 'Yêu cầu hỗ trợ mới từ khách hàng #C-991', status: 'warning', time: '40 phút trước' },
        { id: 4, type: 'PICKUP', title: 'Shipper đã lấy thành công đơn #VN22310', status: 'info', time: '1 giờ trước' },
    ];

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Bảng điều khiển - Bưu cục Ward"
                description="Theo dõi hoạt động nhận hàng, giao hàng và hỗ trợ khách hàng tại địa phương."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md">
                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color}`} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform">
                                    <stat.icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' :
                                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                                    {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change !== '0' ? stat.change : ''}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Daily Orders */}
                <Card className="lg:col-span-2 p-6 shadow-md border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-orange-500" />
                                Sự tăng trưởng đơn hàng
                            </h3>
                            <p className="text-xs text-gray-500">Số lượng đơn hàng được tạo mới tại bưu cục mỗi ngày.</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold ring-1 ring-orange-100">
                                <Activity className="w-3 h-3" />
                                Tăng 15% so với tuần trước
                            </div>
                        </div>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[
                            { day: '14', val: 175 },
                            { day: '15', val: 275 },
                            { day: '16', val: 225 },
                            { day: '17', val: 400 },
                            { day: '18', val: 325 },
                            { day: '19', val: 475 },
                            { day: '20', val: 425 },
                        ].map((item, i) => {
                            const height = (item.val / 500) * 100;
                            return (
                                <div
                                    key={i}
                                    // FIXED: Added 'h-full' to give the bar a reference height
                                    // FIXED: Added 'justify-end' to align bar and text to the bottom
                                    className="flex-1 flex flex-col items-center justify-end h-full group"
                                >
                                    <div
                                        className="w-full min-w-[30px] max-w-[44px] bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-xl relative group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-300 shadow-sm"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                                            {item.val} Đơn hàng
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                                        Ngày {item.day}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Status Distribution */}
                <Card className="p-6 shadow-md border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-green-500" />
                        Tình trạng chuyển phát
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Trạng thái các đơn hàng trong khu vực phường.</p>

                    <div className="flex-1 flex items-center justify-center relative">
                        <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90">
                            {/* Background Track */}
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F3F4F6" strokeWidth="12" />

                            {/* Green: Completed (70%) */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="#10B981"
                                strokeWidth="12"
                                strokeDasharray="175.93 1000"
                                strokeDashoffset="0"
                            />

                            {/* Yellow: Shipping (20%) */}
                            {/* Offset is negative the length of the previous segment(s) */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="#F59E0B"
                                strokeWidth="12"
                                strokeDasharray="50.27 1000"
                                strokeDashoffset="-175.93"
                            />

                            {/* Red: Failed (10%) */}
                            {/* Offset is negative (Green + Yellow) */}
                            <circle
                                cx="50" cy="50" r="40"
                                fill="transparent"
                                stroke="#EF4444"
                                strokeWidth="12"
                                strokeDasharray="25.13 1000"
                                strokeDashoffset="-226.20"
                            />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-gray-900">428</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Tổng đơn</span>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3">
                        <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-sm" />
                                <span className="text-gray-600">Thành công</span>
                            </div>
                            <span className="text-green-600">70%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                                <span className="text-gray-600">Đang vận chuyển</span>
                            </div>
                            <span className="text-amber-600">20%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-bold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-sm" />
                                <span className="text-gray-600">Xử lý sự cố</span>
                            </div>
                            <span className="text-red-600">10%</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Activity List */}
                <Card className="p-6 shadow-md border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            Nhật ký bưu cục
                        </h3>
                        <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">Theo thời gian thực</button>
                    </div>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group">
                                <div className={`mt-1 p-2 rounded-xl scale-95 group-hover:scale-100 transition-transform ${activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                    activity.status === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {activity.type === 'ORDER' && <Package className="w-4 h-4" />}
                                    {activity.type === 'SHIPPER' && <Users className="w-4 h-4" />}
                                    {activity.type === 'COMPLAINT' && <MessageSquare className="w-4 h-4" />}
                                    {activity.type === 'PICKUP' && <Truck className="w-4 h-4" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 leading-snug">{activity.title}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <Clock className="w-3 h-3 text-gray-400" />
                                        <p className="text-[11px] text-gray-500 font-medium">{activity.time}</p>
                                    </div>
                                </div>
                                <button className="text-[11px] font-black uppercase text-gray-400 hover:text-blue-600 tracking-wider">Xem</button>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Action Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Button 1: Quản lý hoạt động */}
                    <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:rotate-6 transition-transform">
                            <Activity className="w-10 h-10" />
                        </div>
                        <span className="font-black text-gray-900 text-base">Quản lý hoạt động</span>
                        <span className="text-[10px] text-blue-500 mt-1 uppercase tracking-[0.2em] font-black">Operations</span>
                    </button>

                    {/* Button 2: Hỗ trợ khẩn cấp */}
                    <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <span className="font-black text-gray-900 text-base">Hỗ trợ khẩn cấp</span>
                        <span className="text-[10px] text-purple-500 mt-1 uppercase tracking-[0.2em] font-black">Emergency</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
