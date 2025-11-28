import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { fetchOrders, getStatusLabel, getStatusColor, getStatusBgColor, Order } from "@/services/mockApi";
import { useEffect, useState } from "react";
import { ChevronRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      const data = await fetchOrders();
      setOrders(data);
      setLoading(false);
    };
    loadOrders();
  }, []);

  if (loading) {
    return (
      <CustomerShell title="Đơn hàng của tôi" userName="Nguyễn Văn A" role="Khách hàng">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell title="Đơn hàng của tôi" userName="Nguyễn Văn A" role="Khách hàng">
      <div className="space-y-3">
        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </CustomerShell>
  );
}

function OrderCard({ order }: { order: Order }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const handleTracking = () => {
    navigate(`/customer/tracking?order=${order.orderNumber}`);
  };

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      {/* Header: Order number and status */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm">{order.orderNumber}</h3>
          <p className={`text-xs font-medium ${getStatusColor(order.status)}`}>
            {getStatusLabel(order.status)}
          </p>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${getStatusBgColor(order.status)} ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>

      {/* Subheading: Delivery date, COD, Details button */}
      <div className="pt-2 border-t space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div>
            <span className="font-medium">Dự kiến giao:</span> {formatDate(order.targetDeliveryDate)}
          </div>
          {order.codAmount > 0 && (
            <div className="font-medium text-foreground">
              COD: {formatCurrency(order.codAmount)}
            </div>
          )}
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between text-xs text-primary hover:text-primary/80 font-medium mt-2"
        >
          <span>Chi tiết đơn hàng</span>
          <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="pt-3 border-t space-y-3">
          <div className="space-y-2 text-sm">
            <DetailRow label="Người nhận" value={order.recipientName} />
            <DetailRow label="Số điện thoại" value={order.recipientPhone} />
            <DetailRow label="Địa chỉ" value={order.address} />
            <DetailRow label="Nội dung" value={order.items} />
            <DetailRow label="Ngày tạo" value={formatDate(order.createdDate)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              className="text-xs h-8"
              onClick={handleTracking}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Theo dõi
            </Button>
            <Button variant="outline" className="text-xs h-8">
              Liên hệ hỗ trợ
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <span className="text-muted-foreground font-medium">{label}:</span>
      <span className="text-foreground text-right flex-1">{value}</span>
    </div>
  );
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}
