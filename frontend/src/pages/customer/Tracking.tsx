import CustomerShell from "@/components/CustomerShell";
import {
  fetchOrderTracking,
  formatDateTime,
  TrackingEvent,
} from "@/services/mockApi";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Truck, Package, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TrackingData {
  orderNumber: string;
  trackingHistory: TrackingEvent[];
  currentMilestoneIndex: number;
  loading: boolean;
  error?: string;
}

export default function Tracking() {
  const location = useLocation();
  const order = location.state?.order;

  const [data, setData] = useState<TrackingData>({
    orderNumber: order?.orderNumber || "",
    trackingHistory: [],
    currentMilestoneIndex: -1,
    loading: true,
  });

  useEffect(() => {
    const loadTracking = async () => {
      if (!order?.orderNumber) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Order data not provided",
        }));
        return;
      }

      try {
        setData((prev) => ({ ...prev, loading: true }));
        const { trackingHistory, currentMilestoneIndex } =
          await fetchOrderTracking(order.orderNumber);
        setData({
          orderNumber: order.orderNumber,
          trackingHistory,
          currentMilestoneIndex,
          loading: false,
        });
      } catch (error) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load tracking information",
        }));
      }
    };

    loadTracking();
  }, [order]);

  if (data.loading) {
    return (
      <CustomerShell
        title={`Theo dõi ${data.orderNumber}`}
        userName="Nguyễn Văn A"
        role="Khách hàng"
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </CustomerShell>
    );
  }

  if (data.error) {
    return (
      <CustomerShell
        title="Theo dõi đơn hàng"
        userName="Nguyễn Văn A"
        role="Khách hàng"
      >
        <div className="flex flex-col items-center justify-center py-12 gap-4">
          <div className="text-muted-foreground">{data.error}</div>
          <Button variant="outline" onClick={() => window.history.back()}>
            Quay lại
          </Button>
        </div>
      </CustomerShell>
    );
  }

  const milestones = [
    { key: "picked-up", label: "Đã lấy", icon: Package },
    { key: "transferring", label: "Đang chuyển", icon: Truck },
    { key: "delivering", label: "Đang giao", icon: MapPin },
    { key: "delivered", label: "Đã giao", icon: CheckCircle2 },
  ];

  return (
    <CustomerShell
      title={`Theo dõi ${data.orderNumber}`}
      userName="Nguyễn Văn A"
      role="Khách hàng"
    >
      <div className="space-y-6">
        {/* Order Details */}
        {order && (
          <div className="bg-card rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-sm">Thông tin đơn hàng</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Người nhận:</span>
                <span>{order.recipientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Địa chỉ:</span>
                <span className="text-right">{order.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Ghi chú:</span>
                <span>{order.items}</span>
              </div>
              {order.codAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">COD:</span>
                  <span className="font-medium">
                    {formatCurrency(order.codAmount)}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Horizontal Progress Bar */}
        <div className="bg-card rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-lg">Tiến trình vận chuyển</h3>

          {/* Horizontal Milestone Timeline */}
          <div className="relative flex items-center justify-between">
            {/* Background Track */}
            <div className="absolute inset-0 h-1 bg-secondary/30 rounded-full" />

            <div className="flex items-center w-full z-10">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const isCompleted = index < data.currentMilestoneIndex;
                const isCurrent = index === data.currentMilestoneIndex;

                const getStatusColor = () => {
                  // First 3 milestones: blue when activated (completed or current)
                  if (index < 3 && (isCompleted || isCurrent)) {
                    return "bg-blue-500 border-blue-500 text-white shadow-blue-200/50";
                  }

                  // 4th milestone (index 3): yellow for returned, green for delivered
                  if (index === 3) {
                    if (order?.status === "delivered") {
                      return "bg-green-500 border-green-500 text-white shadow-green-200/50";
                    }
                    if (order?.status === "returned") {
                      return "bg-yellow-500 border-yellow-500 text-white shadow-yellow-200/50";
                    }
                    // Default for 4th milestone when current but not final status
                    if (isCurrent) {
                      return "bg-blue-500 border-blue-500 text-white shadow-blue-200/50";
                    }
                  }

                  // Future milestones (including 4th when not reached)
                  return "bg-secondary/20 border-secondary/50 text-muted-foreground shadow-sm";
                };

                // Progress fill up to current milestone (first 3 always blue when reached)
                const progressWidth =
                  ((Math.min(data.currentMilestoneIndex, 3) + 1) /
                    milestones.length) *
                  100;

                return (
                  <div
                    key={milestone.key}
                    className="flex flex-col items-center gap-2 flex-1"
                  >
                    {/* Milestone Circle */}
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center border-3 shadow-lg ${getStatusColor()}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>

                    {/* Label */}
                    <p className="text-xs font-medium text-center text-muted-foreground px-1 whitespace-nowrap">
                      {milestone.label}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Progress Fill - Blue for first 3, stops before 4th unless delivered */}
            <div
              className={`absolute top-0 left-0 h-1 rounded-full transition-all duration-300 ${
                order?.status === "delivered" ? "bg-green-500" : "bg-blue-500"
              }`}
            />
          </div>
        </div>

        {/* Tracking History */}
        <div className="space-y-2">
          <h3 className="font-semibold text-sm">Lịch sử vận chuyển</h3>

          {data.trackingHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground text-sm">
              Chưa có thông tin theo dõi
            </div>
          ) : (
            <div className="space-y-3">
              {data.trackingHistory.map((event, index) => {
                const isLatest = index === data.trackingHistory.length - 1;

                return (
                  <TrackingEventCard
                    key={index}
                    event={event}
                    isLatest={isLatest}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Back Button */}
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại đơn hàng
        </Button>
      </div>
    </CustomerShell>
  );
}

function TrackingEventCard({
  event,
  isLatest,
}: {
  event: TrackingEvent;
  isLatest: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-4 border-l-4 space-y-2 ${
        isLatest
          ? "bg-primary/5 border-l-primary"
          : "bg-secondary/5 border-l-secondary"
      }`}
    >
      {/* Timestamp */}
      <div
        className={`text-xs font-semibold ${
          isLatest ? "text-foreground/70" : "text-foreground/50"
        }`}
      >
        {formatDateTime(event.timestamp)}
      </div>

      {/* Message */}
      <div className="text-sm font-medium text-foreground">{event.message}</div>

      {/* Location */}
      {event.location && (
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {event.location}
        </div>
      )}
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  }).format(amount);
}
