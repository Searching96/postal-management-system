import React, { useMemo } from 'react';
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
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from "lucide-react";
import { Card, PageHeader } from "../../components/ui";

// --- 1. Types & Interfaces (For Reliability) ---
interface DailyOrder {
  day: string;
  value: number;
}

interface ActivityLog {
  id: number;
  type: "ORDER" | "SHIPPER" | "COMPLAINT" | "PICKUP";
  title: string;
  status: "success" | "info" | "warning";
  time: string;
}

interface DashboardData {
  stats: {
    newOrders: {
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
    };
    pendingPickup: {
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
    };
    deliveryRate: {
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
    };
    complaints: {
      value: number;
      change: number;
      trend: "up" | "down" | "neutral";
    };
  };
  dailyOrders: DailyOrder[];
  deliveryStatus: {
    success: number;
    shipping: number;
    failed: number;
  };
  recentActivity: ActivityLog[];
}

// --- 2. Mock Data (Single Source of Truth) ---
// In a real app, this comes from your API/Hook
// Data reflects a small ward post office handling 20-50 orders per day
const MOCK_DATA: DashboardData = {
  stats: {
    newOrders: { value: 38, change: 11.8, trend: "up" }, // Orders created today
    pendingPickup: { value: 4, change: -20.0, trend: "down" }, // Awaiting shipper pickup
    deliveryRate: { value: 96.4, change: -1.2, trend: "down" }, // Success rate (last 7 days)
    complaints: { value: 2, change: 100.0, trend: "up" }, // Active complaint tickets
  },
  dailyOrders: [
    // Last 14 days - shows realistic weekly patterns (lower on weekends)
    { day: "T2 8/1", value: 42 }, // Monday spike
    { day: "T3 9/1", value: 38 },
    { day: "T4 10/1", value: 35 },
    { day: "T5 11/1", value: 41 },
    { day: "T6 12/1", value: 47 }, // Friday peak
    { day: "T7 13/1", value: 28 }, // Weekend drop
    { day: "CN 14/1", value: 21 },
    { day: "T2 15/1", value: 44 },
    { day: "T3 16/1", value: 39 },
    { day: "T4 17/1", value: 36 },
    { day: "T5 18/1", value: 43 },
    { day: "T6 19/1", value: 48 },
    { day: "T7 20/1", value: 31 },
    { day: "CN 21/1", value: 23 }, // Today (partial day)
  ],
  // Last 7 days total: ~280 deliveries
  // Success: 270 (96.4%), Shipping: 7 (in transit), Failed: 10 (3.6%)
  deliveryStatus: {
    success: 270,
    shipping: 7,
    failed: 10,
  },
  recentActivity: [
    {
      id: 1,
      type: "ORDER",
      title: "Đã nhận đơn hàng #VN94521 tại bưu cục",
      status: "success",
      time: "3 phút trước",
    },
    {
      id: 2,
      type: "PICKUP",
      title: "Bưu tá Nguyễn Văn A đã lấy 6 đơn hàng",
      status: "info",
      time: "12 phút trước",
    },
    {
      id: 3,
      type: "ORDER",
      title: "Đơn hàng #VN94518 đã được quét nhận tại kho",
      status: "success",
      time: "25 phút trước",
    },
    {
      id: 4,
      type: "COMPLAINT",
      title: "Khiếu nại giao hàng trễ - Đơn #VN94402",
      status: "warning",
      time: "41 phút trước",
    },
    {
      id: 5,
      type: "SHIPPER",
      title: "Trần Thị B đã bắt đầu ca giao hàng",
      status: "info",
      time: "1 giờ trước",
    },
    {
      id: 6,
      type: "ORDER",
      title: "Nhận 8 đơn hàng mới từ trung tâm phân loại",
      status: "success",
      time: "1 giờ trước",
    },
    {
      id: 7,
      type: "SHIPPER",
      title: "Lê Văn C đã hoàn thành ca giao - 14/15 đơn",
      status: "info",
      time: "2 giờ trước",
    },
    {
      id: 8,
      type: "PICKUP",
      title: "Lấy hàng thất bại - Khách không có mặt #VN94389",
      status: "warning",
      time: "2 giờ trước",
    },
    {
      id: 9,
      type: "ORDER",
      title: "Cập nhật trạng thái: 5 đơn đã giao thành công",
      status: "success",
      time: "3 giờ trước",
    },
    {
      id: 10,
      type: "PICKUP",
      title: "Phạm Thị D đã lấy 7 đơn hàng cho ca chiều",
      status: "info",
      time: "4 giờ trước",
    },
  ],
};

export function POWardManagerDashboard() {
  const data = MOCK_DATA;

  // --- 3. Derived Logic (Calculations) ---

  // Calculate Bar Chart Scaling
  const maxOrderValue = Math.max(...data.dailyOrders.map((d) => d.value));

  // Calculate Pie Chart Segments (SVG Math)
  const pieChartData = useMemo(() => {
    const { success, shipping, failed } = data.deliveryStatus;
    const total = success + shipping + failed;
    const radius = 40;
    const circumference = 2 * Math.PI * radius;

    // Helper to calculate stroke dash array and offset
    let currentOffset = 0;
    const segments = [
      {
        label: "Thành công",
        value: success,
        color: "#10B981",
        icon: CheckCircle2,
        tailwindText: "text-green-600",
        tailwindBg: "bg-green-500",
      },
      {
        label: "Đang vận chuyển",
        value: shipping,
        color: "#F59E0B",
        icon: Truck,
        tailwindText: "text-amber-600",
        tailwindBg: "bg-amber-500",
      },
      {
        label: "Xử lý sự cố",
        value: failed,
        color: "#EF4444",
        icon: AlertTriangle,
        tailwindText: "text-red-600",
        tailwindBg: "bg-red-500",
      },
    ].map((item) => {
      const percentage = (item.value / total) * 100;
      const strokeLength = (item.value / total) * circumference;
      const segmentData = {
        ...item,
        percentage: percentage.toFixed(1),
        strokeDasharray: `${strokeLength} ${circumference}`,
        strokeDashoffset: -currentOffset,
      };
      currentOffset += strokeLength;
      return segmentData;
    });

    return { total, segments, circumference, radius };
  }, [data.deliveryStatus]);

  // Configuration for Top Stats Cards
  const statConfig = [
    {
      key: "newOrders",
      label: "Đơn hàng mới",
      icon: Package,
      color: "from-blue-500 to-blue-600",
      formatter: (v: number) => v.toString(),
    },
    {
      key: "pendingPickup",
      label: "Chờ lấy hàng",
      icon: Truck,
      color: "from-orange-500 to-orange-600",
      formatter: (v: number) => v.toString(),
    },
    {
      key: "deliveryRate",
      label: "Tỷ lệ giao hàng",
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      formatter: (v: number) => `${v}%`,
    },
    {
      key: "complaints",
      label: "Khiếu nại",
      icon: MessageSquare,
      color: "from-red-500 to-red-600",
      formatter: (v: number) => v.toString(),
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title="Bảng điều khiển - Bưu cục Phường Đống Đa"
        description="Theo dõi hoạt động nhận hàng, giao hàng của 24h qua."
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((config, idx) => {
          // @ts-ignore - Accessing stats by key dynamically
          const statData = data.stats[config.key];
          return (
            <Card
              key={idx}
              className="relative overflow-hidden group hover:shadow-xl transition-all duration-300 border-none shadow-md"
            >
              <div
                className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${config.color}`}
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 rounded-lg bg-gray-50 group-hover:scale-110 transition-transform">
                    <config.icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-xs font-bold ${statData.trend === "up"
                      ? "text-green-600"
                      : statData.trend === "down"
                        ? "text-red-600"
                        : "text-gray-500"
                      }`}
                  >
                    {statData.trend === "up" && (
                      <ArrowUpRight className="w-3 h-3" />
                    )}
                    {statData.trend === "down" && (
                      <ArrowDownRight className="w-3 h-3" />
                    )}
                    {statData.change !== 0
                      ? `${statData.change > 0 ? "+" : ""}${statData.change}%`
                      : ""}
                  </div>
                </div>
                <p className="text-sm font-medium text-gray-500">
                  {config.label}
                </p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {config.formatter(statData.value)}
                </h3>
              </div>
            </Card>
          );
        })}
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
              <p className="text-xs text-gray-500">
                Số lượng đơn hàng được tạo mới tại bưu cục mỗi ngày.
              </p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs font-bold ring-1 ring-orange-100">
                <Activity className="w-3 h-3" />
                Tăng trưởng ổn định
              </div>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2 px-2">
            {data.dailyOrders.map((item, i) => {
              // Dynamic height calculation relative to the max value
              const heightPercentage = (item.value / maxOrderValue) * 100;
              return (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end h-full group"
                >
                  <div
                    className="w-full min-w-[30px] max-w-[44px] bg-gradient-to-t from-orange-500 to-orange-400 rounded-t-xl relative group-hover:from-orange-600 group-hover:to-orange-500 transition-all duration-300 shadow-sm"
                    style={{ height: `${heightPercentage}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] py-1.5 px-2.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
                      {item.value} Đơn hàng
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 mt-3 font-bold uppercase tracking-tighter">
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Status Distribution - Dynamically Calculated */}
        <Card className="p-6 shadow-md border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-green-500" />
            Tình trạng chuyển phát tuần qua
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Trạng thái các đơn hàng trong khu vực phường.
          </p>

          <div className="flex-1 flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-44 h-44 -rotate-90">
              {/* Background Track */}
              <circle
                cx="50"
                cy="50"
                r={pieChartData.radius}
                fill="transparent"
                stroke="#F3F4F6"
                strokeWidth="12"
              />

              {/* Dynamic Segments */}
              {pieChartData.segments.map((segment, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={pieChartData.radius}
                  fill="transparent"
                  stroke={segment.color}
                  strokeWidth="12"
                  strokeDasharray={segment.strokeDasharray}
                  strokeDashoffset={segment.strokeDashoffset}
                  className="transition-all duration-1000 ease-out"
                />
              ))}
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-black text-gray-900">
                {pieChartData.total}
              </span>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                Tổng đơn
              </span>
            </div>
          </div>

          <div className="mt-8 space-y-3">
            {pieChartData.segments.map((segment, i) => (
              <div
                key={i}
                className="flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-sm ${segment.tailwindBg}`} />
                  <span className="text-gray-600">{segment.label}</span>
                </div>
                <span className={segment.tailwindText}>
                  {segment.percentage}%
                </span>
              </div>
            ))}
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
            <button className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1 rounded-full transition-colors">
              Theo thời gian thực
            </button>
          </div>
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
            {data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-4 p-4 rounded-2xl hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100 group"
              >
                <div
                  className={`mt-1 p-2 rounded-xl scale-95 group-hover:scale-100 transition-transform ${activity.status === "success"
                    ? "bg-green-100 text-green-600"
                    : activity.status === "warning"
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600"
                    }`}
                >
                  {activity.type === "ORDER" && <Package className="w-4 h-4" />}
                  {activity.type === "SHIPPER" && <Users className="w-4 h-4" />}
                  {activity.type === "COMPLAINT" && (
                    <MessageSquare className="w-4 h-4" />
                  )}
                  {activity.type === "PICKUP" && <Truck className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-gray-900 leading-snug">
                    {activity.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-3 h-3 text-gray-400" />
                    <p className="text-[11px] text-gray-500 font-medium">
                      {activity.time}
                    </p>
                  </div>
                </div>
                <button className="text-[11px] font-black uppercase text-gray-400 hover:text-blue-600 tracking-wider">
                  Xem
                </button>
              </div>
            ))}
          </div>
        </Card>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all flex flex-col items-center justify-center text-center group">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl mb-4 group-hover:rotate-6 transition-transform">
              <Activity className="w-10 h-10" />
            </div>
            <span className="font-black text-gray-900 text-base">
              Quản lý hoạt động
            </span>
            <span className="text-[10px] text-blue-500 mt-1 uppercase tracking-[0.2em] font-black">
              Operations
            </span>
          </button>

          <button className="bg-white border border-gray-100 p-6 rounded-3xl shadow-sm hover:shadow-xl hover:scale-[1.03] transition-all flex flex-col items-center justify-center text-center group">
            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
              <AlertCircle className="w-10 h-10" />
            </div>
            <span className="font-black text-gray-900 text-base">
              Hỗ trợ khẩn cấp
            </span>
            <span className="text-[10px] text-purple-500 mt-1 uppercase tracking-[0.2em] font-black">
              Emergency
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}