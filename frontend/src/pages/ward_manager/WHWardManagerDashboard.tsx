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
    AlertCircle
} from 'lucide-react';
import { Card, PageHeader } from '../../components/ui';

export function WHWardManagerDashboard() {
    // Mock Data
    const stats = [
        {
            label: 'Tổng hàng gộp',
            value: '1,284',
            change: '+12.5%',
            trend: 'up',
            icon: Package,
            color: 'from-blue-500 to-blue-600'
        },
        {
            label: 'Kiện chờ xử lý',
            value: '42',
            change: '-5.2%',
            trend: 'down',
            icon: Clock,
            color: 'from-amber-500 to-amber-600'
        },
        {
            label: 'Bưu tá hoạt động',
            value: '18/24',
            change: '75%',
            trend: 'neutral',
            icon: Users,
            color: 'from-green-500 to-green-600'
        },
        {
            label: 'Hiệu suất trạm',
            value: '94.2%',
            change: '+2.1%',
            trend: 'up',
            icon: TrendingUp,
            color: 'from-purple-500 to-purple-600'
        },
    ];

    const recentActivity = [
        { id: 1, type: 'CONSOLIDATION', title: 'Hoàn thành gộp lô #VN88291', time: '10 phút trước', status: 'success' },
        { id: 2, type: 'SHIPPER', title: 'Bưu tá Nguyễn Văn A đã nhận hàng', time: '25 phút trước', status: 'info' },
        { id: 3, type: 'ALERT', title: 'Cảnh báo tồn kho quá 24h (3 kiện)', time: '1 giờ trước', status: 'warning' },
        { id: 4, type: 'CONSOLIDATION', title: 'Bắt đầu xếp xe container #TRK-992', time: '2 giờ trước', status: 'info' },
    ];

    return (
        <div className="space-y-6 pb-10">
            <PageHeader
                title="Bảng điều khiển - Quản lý Kho"
                description="Tổng quan hoạt động và hiệu suất xử lý tại trạm trung chuyển."
            />

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md">
                        <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${stat.color}`} />
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-2 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-6 h-6 text-gray-700" />
                                </div>
                                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-green-600' :
                                    stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                                    }`}>
                                    {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                                    {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                            <h3 className="text-2xl font-black text-gray-900 mt-1">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Chart - Weekly Throughput */}
                <Card className="lg:col-span-2 p-6 shadow-md border-gray-100">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" />
                                Sản lượng hàng tuần
                            </h3>
                            <p className="text-xs text-gray-500">Thống kê số lượng kiện hàng đã xử lý trong 7 ngày qua.</p>
                        </div>
                        <select className="text-xs border-gray-200 rounded-lg focus:ring-blue-500 outline-none p-1.5 bg-gray-50">
                            <option>7 ngày qua</option>
                            <option>30 ngày qua</option>
                        </select>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2 px-2">
                        {[
                            { day: 'T2', val: 650 },
                            { day: 'T3', val: 450 },
                            { day: 'T4', val: 750 },
                            { day: 'T5', val: 550 },
                            { day: 'T6', val: 900 },
                            { day: 'T7', val: 800 },
                            { day: 'CN', val: 700 },
                        ].map((item, i) => {
                            const height = (item.val / 1000) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center group">
                                    <div
                                        className="w-full min-w-[30px] max-w-[40px] bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg relative group-hover:from-blue-600 group-hover:to-blue-500 transition-all duration-300 shadow-sm"
                                        style={{ height: `${height}%` }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                            {item.val} Kiện
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400 mt-3 font-medium">{item.day}</span>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Distribution Chart - Mock Pie */}
                <Card className="p-6 shadow-md border-gray-100 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-purple-500" />
                        Phân bổ loại kiện
                    </h3>
                    <p className="text-xs text-gray-500 mb-6">Tỷ lệ các loại kích thước kiện hàng hiện tại.</p>

                    <div className="flex-1 flex items-center justify-center relative">
                        {/* SVG Donut Chart Mockup */}
                        <svg viewBox="0 0 100 100" className="w-40 h-40 rotate-[-90deg]">
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#E5E7EB" strokeWidth="12" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="62.8" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="188.4" />
                            <circle cx="50" cy="50" r="40" fill="transparent" stroke="#8B5CF6" strokeWidth="12" strokeDasharray="251.2" strokeDashoffset="226.1" />
                        </svg>
                        <div className="absolute flex flex-col items-center">
                            <span className="text-xl font-black text-gray-900">63</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Kiện</span>
                        </div>
                    </div>

                    <div className="mt-6 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
                                <span className="text-gray-600">Loại Nhỏ (S)</span>
                            </div>
                            <span>75%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-amber-500 rounded-sm" />
                                <span className="text-gray-600">Loại Vừa (M)</span>
                            </div>
                            <span>15%</span>
                        </div>
                        <div className="flex items-center justify-between text-xs font-semibold">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-sm" />
                                <span className="text-gray-600">Loại Lớn (L)</span>
                            </div>
                            <span>10%</span>
                        </div>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <Card className="p-6 shadow-md border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Activity className="w-5 h-5 text-green-500" />
                        Hoạt động gần đây
                    </h3>
                    <div className="space-y-4">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100">
                                <div className={`mt-1 p-1.5 rounded-full ${activity.status === 'success' ? 'bg-green-100 text-green-600' :
                                    activity.status === 'warning' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                                    }`}>
                                    {activity.status === 'warning' ? <AlertCircle className="w-3.5 h-3.5" /> : <Clock className="w-3.5 h-3.5" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{activity.title}</p>
                                    <p className="text-xs text-gray-500">{activity.time}</p>
                                </div>
                                <button className="text-xs font-bold text-blue-600 hover:text-blue-700">Chi tiết</button>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-6 py-2.5 text-sm font-bold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                        Xem tất cả hoạt động
                    </button>
                </Card>

                {/* Action Quick Links with Modern Design */}
                <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-lg shadow-blue-200 hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-3 bg-white/20 rounded-xl mb-4 group-hover:rotate-6 transition-transform">
                            <Package className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg">Gộp hàng mới</span>
                        <span className="text-[10px] opacity-80 mt-1 uppercase tracking-widest font-black">Consolidate</span>
                    </button>

                    <button className="p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl mb-4 group-hover:-rotate-6 transition-transform">
                            <Users className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Bưu tá trạm</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Manage Shippers</span>
                    </button>

                    <button className="p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <BarChart3 className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Báo cáo kho</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Inventory Report</span>
                    </button>

                    <button className="p-6 rounded-2xl bg-white border border-gray-100 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all flex flex-col items-center justify-center text-center group">
                        <div className="p-3 bg-green-50 text-green-600 rounded-xl mb-4 group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Tra cứu lô</span>
                        <span className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest font-black">Trace Batches</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
