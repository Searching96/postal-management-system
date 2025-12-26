import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Badge, Button } from "@/components";
import { useAuthStore } from "@/store";
import { OrderService } from "@/services";
import { OrderStatus } from "@/models";
import { formatCurrency, getStatusColor, getStatusLabel } from "@/lib/utils";
import {
  Package,
  Truck,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Plus,
  Search,
} from "lucide-react";

export const PostOfficeDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = React.useState({
    total: 0,
    byStatus: {} as Record<OrderStatus, number>,
    totalRevenue: 0,
    totalCod: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getStatistics();
      setStats(data);
    } catch (error) {
      console.error("Failed to load statistics:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      label: "Tổng đơn hàng",
      value: stats.total,
      icon: <Package className="text-blue-600" size={24} />,
      color: "bg-blue-50",
    },
    {
      label: "Đang giao hàng",
      value:
        (stats.byStatus[OrderStatus.OUT_FOR_DELIVERY] || 0) +
        (stats.byStatus[OrderStatus.IN_TRANSIT] || 0),
      icon: <Truck className="text-purple-600" size={24} />,
      color: "bg-purple-50",
    },
    {
      label: "Đã giao thành công",
      value: stats.byStatus[OrderStatus.DELIVERED] || 0,
      icon: <CheckCircle className="text-green-600" size={24} />,
      color: "bg-green-50",
    },
    {
      label: "Giao thất bại",
      value: stats.byStatus[OrderStatus.FAILED] || 0,
      icon: <AlertCircle className="text-red-600" size={24} />,
      color: "bg-red-50",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-2xl font-bold text-secondary-900">
          Xin chào, {user?.fullName}!
        </h1>
        <p className="text-secondary-600 mt-1">
          Tổng quan hoạt động hệ thống bưu chính
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button
          variant="primary"
          size="md"
          onClick={() => navigate("/orders/create")}
        >
          <Plus size={18} className="mr-2" />
          Tạo đơn hàng mới
        </Button>
        <Button variant="outline" size="md" onClick={() => navigate("/orders")}>
          <Search size={18} className="mr-2" />
          Tra cứu đơn hàng
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-secondary-600 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-secondary-900">
                  {loading ? "..." : stat.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title="Doanh thu vận chuyển">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-secondary-900">
                {loading ? "..." : formatCurrency(stats.totalRevenue)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                Tổng phí vận chuyển
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </div>
        </Card>

        <Card title="Thu hộ COD">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold text-secondary-900">
                {loading ? "..." : formatCurrency(stats.totalCod)}
              </p>
              <p className="text-sm text-secondary-600 mt-1">
                Tổng tiền thu hộ
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <Package className="text-blue-600" size={32} />
            </div>
          </div>
        </Card>
      </div>

      {/* Status Breakdown */}
      <Card title="Phân loại theo trạng thái">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="text-center p-4 bg-secondary-50 rounded-lg"
            >
              <Badge className={getStatusColor(status)}>
                {getStatusLabel(status)}
              </Badge>
              <p className="text-2xl font-bold text-secondary-900 mt-2">
                {count}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Activity */}
      <Card
        title="Hoạt động gần đây"
        subtitle="Các đơn hàng được cập nhật mới nhất"
      >
        <div className="text-center py-8 text-secondary-500">
          <Package size={48} className="mx-auto mb-2 opacity-50" />
          <p>Chức năng đang được phát triển</p>
        </div>
      </Card>
    </div>
  );
};
