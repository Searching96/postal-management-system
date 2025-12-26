import React from "react";
import { Button, Card, Badge, Modal, Select } from "@/components";
import { Truck, MapPin, User, CheckCircle } from "lucide-react";
import { OrderService } from "@/services";
import { OrderStatus } from "@/models";
import { formatDate, formatCurrency } from "@/lib/utils";

interface Route {
  id: number;
  courierId: number | null;
  courierName: string;
  date: Date;
  orders: any[];
  status: "PENDING" | "ASSIGNED" | "IN_PROGRESS" | "COMPLETED";
}

export const DeliveryRouteManagementPage: React.FC = () => {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [routes, setRoutes] = React.useState<Route[]>([]);
  const [selectedOrders, setSelectedOrders] = React.useState<number[]>([]);
  const [showAssignModal, setShowAssignModal] = React.useState(false);
  const [selectedCourier, setSelectedCourier] = React.useState<number>(0);
  const [filterStatus, setFilterStatus] = React.useState<string>("ALL");

  const couriers = [
    { id: 1, name: "Trần Văn Bình", phone: "0901234569", vehicle: "Xe máy" },
    { id: 2, name: "Lê Thị Mai", phone: "0901234570", vehicle: "Xe máy" },
    {
      id: 3,
      name: "Nguyễn Văn Cường",
      phone: "0901234571",
      vehicle: "Ô tô tải",
    },
  ];

  React.useEffect(() => {
    loadOrders();
    loadRoutes();
  }, []);

  const loadOrders = async () => {
    const allOrders = await OrderService.getAll();
    // Filter orders that are ready for delivery
    const readyOrders = allOrders.filter(
      (o: any) =>
        o.status === OrderStatus.PENDING ||
        o.status === OrderStatus.IN_TRANSIT ||
        o.status === OrderStatus.OUT_FOR_DELIVERY
    );
    setOrders(readyOrders);
  };

  const loadRoutes = () => {
    // Mock routes data
    const mockRoutes: Route[] = [
      {
        id: 1,
        courierId: 1,
        courierName: "Trần Văn Bình",
        date: new Date(),
        orders: [1, 2, 3],
        status: "IN_PROGRESS",
      },
      {
        id: 2,
        courierId: 2,
        courierName: "Lê Thị Mai",
        date: new Date(),
        orders: [4, 5],
        status: "COMPLETED",
      },
    ];
    setRoutes(mockRoutes);
  };

  const handleSelectOrder = (orderId: number) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    const filteredOrderIds = getFilteredOrders().map((o) => o.id);
    if (selectedOrders.length === filteredOrderIds.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(filteredOrderIds);
    }
  };

  const handleAssignToCourier = () => {
    if (selectedOrders.length === 0) {
      alert("Vui lòng chọn ít nhất 1 đơn hàng!");
      return;
    }
    setShowAssignModal(true);
  };

  const confirmAssign = () => {
    if (!selectedCourier) {
      alert("Vui lòng chọn bưu tá!");
      return;
    }

    const courier = couriers.find((c) => c.id === selectedCourier);
    if (!courier) return;

    const newRoute: Route = {
      id: routes.length + 1,
      courierId: selectedCourier,
      courierName: courier.name,
      date: new Date(),
      orders: selectedOrders,
      status: "ASSIGNED",
    };

    setRoutes([newRoute, ...routes]);
    setSelectedOrders([]);
    setShowAssignModal(false);
    setSelectedCourier(0);
    alert(
      `Đã phân công ${selectedOrders.length} đơn hàng cho ${courier.name}!`
    );
  };

  const getFilteredOrders = () => {
    if (filterStatus === "ALL") return orders;
    return orders.filter((o) => o.status === filterStatus);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { variant: "success" | "warning" | "danger"; text: string }
    > = {
      PENDING: { variant: "warning", text: "Chờ xử lý" },
      IN_TRANSIT: { variant: "warning", text: "Đang vận chuyển" },
      OUT_FOR_DELIVERY: { variant: "warning", text: "Đang giao" },
      DELIVERED: { variant: "success", text: "Đã giao" },
      FAILED: { variant: "danger", text: "Thất bại" },
    };

    const config = statusMap[status] || {
      variant: "warning" as const,
      text: status,
    };
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  const getRouteStatusBadge = (status: Route["status"]) => {
    const statusMap: Record<
      Route["status"],
      { variant: "success" | "warning" | "danger"; text: string }
    > = {
      PENDING: { variant: "warning", text: "Chưa bắt đầu" },
      ASSIGNED: { variant: "warning", text: "Đã phân công" },
      IN_PROGRESS: { variant: "warning", text: "Đang giao" },
      COMPLETED: { variant: "success", text: "Hoàn thành" },
    };

    const config = statusMap[status];
    return <Badge variant={config.variant}>{config.text}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 flex items-center gap-2">
            <Truck size={28} />
            Quản lý Tuyến Giao hàng
          </h1>
          <p className="text-secondary-600 mt-1">
            Phân công và theo dõi tuyến giao hàng cho bưu tá
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleAssignToCourier}
          disabled={selectedOrders.length === 0}
        >
          <User size={18} />
          Phân công bưu tá ({selectedOrders.length})
        </Button>
      </div>

      {/* Active Routes */}
      <Card>
        <div className="p-6">
          <h3 className="text-lg font-semibold text-secondary-900 mb-4">
            Tuyến đang hoạt động
          </h3>
          <div className="space-y-3">
            {routes
              .filter((r) => r.status !== "COMPLETED")
              .map((route) => (
                <div
                  key={route.id}
                  className="border border-secondary-200 rounded-lg p-4 hover:bg-secondary-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                        <User size={24} className="text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-secondary-900">
                          {route.courierName}
                        </h4>
                        <p className="text-sm text-secondary-600">
                          {route.orders.length} đơn hàng •{" "}
                          {formatDate(route.date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getRouteStatusBadge(route.status)}
                      <Button size="sm" variant="secondary">
                        Xem chi tiết
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            {routes.filter((r) => r.status !== "COMPLETED").length === 0 && (
              <div className="text-center py-8 text-secondary-500">
                <Truck size={48} className="mx-auto mb-3 opacity-30" />
                <p>Chưa có tuyến nào đang hoạt động</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Pending Orders */}
      <Card>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900">
              Đơn hàng chờ phân công
            </h3>
            <div className="flex items-center gap-3">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: "ALL", label: "Tất cả trạng thái" },
                  { value: OrderStatus.PENDING, label: "Chờ xử lý" },
                  { value: OrderStatus.IN_TRANSIT, label: "Đang vận chuyển" },
                  { value: OrderStatus.OUT_FOR_DELIVERY, label: "Đang giao" },
                ]}
              />
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedOrders.length === getFilteredOrders().length
                  ? "Bỏ chọn tất cả"
                  : "Chọn tất cả"}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {getFilteredOrders().map((order) => (
              <label
                key={order.id}
                className={`flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedOrders.includes(order.id)
                    ? "border-primary-500 bg-primary-50"
                    : "border-secondary-200 hover:border-secondary-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order.id)}
                  onChange={() => handleSelectOrder(order.id)}
                  className="w-5 h-5"
                />
                <div className="flex-1 grid grid-cols-5 gap-4 items-center">
                  <div>
                    <p className="font-mono text-sm font-semibold text-secondary-900">
                      {order.trackingNumber}
                    </p>
                    <p className="text-xs text-secondary-600">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-secondary-900">
                      {order.receiverName}
                    </p>
                    <p className="text-xs text-secondary-600">
                      {order.receiverPhone}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-secondary-700 flex items-start gap-1">
                      <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">
                        {order.receiverAddress}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(order.status)}
                    <p className="text-sm font-semibold text-secondary-900 mt-1">
                      {formatCurrency(order.totalFee)}
                    </p>
                  </div>
                </div>
              </label>
            ))}

            {getFilteredOrders().length === 0 && (
              <div className="text-center py-12 text-secondary-500">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-30" />
                <p>Không có đơn hàng nào</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Assign Modal */}
      <Modal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        title="Phân công Bưu tá"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              Đã chọn <span className="font-bold">{selectedOrders.length}</span>{" "}
              đơn hàng
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              Chọn bưu tá *
            </label>
            <div className="space-y-2">
              {couriers.map((courier) => (
                <label
                  key={courier.id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    selectedCourier === courier.id
                      ? "border-primary-500 bg-primary-50"
                      : "border-secondary-200 hover:border-secondary-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="courier"
                    value={courier.id}
                    checked={selectedCourier === courier.id}
                    onChange={(e) => setSelectedCourier(Number(e.target.value))}
                    className="w-4 h-4"
                  />
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <User size={20} className="text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-secondary-900">
                      {courier.name}
                    </p>
                    <p className="text-sm text-secondary-600">
                      {courier.phone} • {courier.vehicle}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={confirmAssign}
              className="flex-1"
            >
              <CheckCircle size={18} />
              Xác nhận phân công
            </Button>
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>
              Hủy
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
