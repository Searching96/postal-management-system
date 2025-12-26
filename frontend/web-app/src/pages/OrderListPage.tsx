import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Table, Badge, Input, Select, Button } from "@/components";
import { OrderService } from "@/services";
import { Order, OrderStatus } from "@/models";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getStatusLabel,
} from "@/lib/utils";
import { Search, Filter, Eye, Plus } from "lucide-react";

export const OrderListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("");

  React.useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await OrderService.getAll();
      setOrders(data);
    } catch (error) {
      console.error("Failed to load orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.receiverPhone.includes(searchTerm);

    const matchesStatus = !statusFilter || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const columns = [
    {
      key: "trackingNumber",
      label: "Mã vận đơn",
      render: (value: string) => (
        <span className="font-mono font-medium text-primary-600">{value}</span>
      ),
    },
    {
      key: "receiverName",
      label: "Người nhận",
      render: (_: any, row: Order) => (
        <div>
          <p className="font-medium text-secondary-900">{row.receiverName}</p>
          <p className="text-xs text-secondary-500">{row.receiverPhone}</p>
        </div>
      ),
    },
    {
      key: "receiverProvince",
      label: "Địa chỉ giao",
      render: (_: any, row: Order) => (
        <div className="text-sm">
          <p>
            {row.receiverDistrict}, {row.receiverProvince}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value: OrderStatus) => (
        <Badge className={getStatusColor(value)}>{getStatusLabel(value)}</Badge>
      ),
    },
    {
      key: "totalFee",
      label: "Cước phí",
      render: (value: number) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: "codAmount",
      label: "COD",
      render: (value: number) => (
        <span
          className={
            value > 0 ? "font-medium text-orange-600" : "text-secondary-400"
          }
        >
          {value > 0 ? formatCurrency(value) : "-"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Ngày tạo",
      render: (value: Date) => (
        <span className="text-sm text-secondary-600">{formatDate(value)}</span>
      ),
    },
    {
      key: "actions",
      label: "Thao tác",
      render: (_: any, row: Order) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(`/orders/${row.id}`)}
        >
          <Eye size={16} />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">
            Quản lý đơn hàng
          </h1>
          <p className="text-secondary-600 mt-1">
            Danh sách tất cả đơn hàng trong hệ thống
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate("/orders/create")}>
          <Plus size={18} className="mr-2" />
          Tạo đơn mới
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <Input
              placeholder="Tìm kiếm theo mã vận đơn, tên, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search size={18} />}
            />
          </div>
          <Select
            options={[
              { value: "", label: "Tất cả trạng thái" },
              { value: OrderStatus.PENDING, label: "Chờ lấy hàng" },
              { value: OrderStatus.PICKED_UP, label: "Đã lấy hàng" },
              { value: OrderStatus.IN_TRANSIT, label: "Đang vận chuyển" },
              { value: OrderStatus.OUT_FOR_DELIVERY, label: "Đang giao hàng" },
              { value: OrderStatus.DELIVERED, label: "Đã giao hàng" },
              { value: OrderStatus.FAILED, label: "Giao thất bại" },
              { value: OrderStatus.RETURNED, label: "Đã hoàn trả" },
              { value: OrderStatus.CANCELLED, label: "Đã hủy" },
            ]}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          />
        </div>
      </Card>

      {/* Orders Table */}
      <Card>
        {loading ? (
          <div className="text-center py-8 text-secondary-500">
            Đang tải dữ liệu...
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={filteredOrders}
              onRowClick={(row) => navigate(`/orders/${row.id}`)}
              emptyMessage="Không tìm thấy đơn hàng nào"
            />
            <div className="mt-4 flex items-center justify-between text-sm text-secondary-600">
              <p>
                Hiển thị {filteredOrders.length} / {orders.length} đơn hàng
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
