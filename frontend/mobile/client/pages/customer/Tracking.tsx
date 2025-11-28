import CustomerShell from "@/components/CustomerShell";
import { fetchOrderTracking, formatDateTime, TrackingEvent } from "@/services/mockApi";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order") || "";


  const [data, setData] = useState<TrackingData>({
    orderNumber,
    trackingHistory: [],
    currentMilestoneIndex: -1,
    loading: true,
  });


  useEffect(() => {
    const loadTracking = async () => {
      if (!orderNumber) {
        setData((prev) => ({
          ...prev,
          loading: false,
          error: "Order number not provided",
        }));
        return;
      }


      try {
        setData((prev) => ({ ...prev, loading: true }));
        const { trackingHistory, currentMilestoneIndex } =
          await fetchOrderTracking(orderNumber);
        setData({
          orderNumber,
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
  }, [orderNumber]);


  if (data.loading) {
    return (
      <CustomerShell
        title={`Theo dõi ${orderNumber}`}
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
      title={`Theo dõi ${orderNumber}`}
      userName="Nguyễn Văn A"
      role="Khách hàng"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div className="bg-card rounded-lg p-6 space-y-4">
          <h3 className="font-semibold text-sm">Tiến trình vận chuyển</h3>


          {/* Milestone Bar */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {milestones.map((milestone, index) => {
                const Icon = milestone.icon;
                const isCompleted = index < data.currentMilestoneIndex;
                const isCurrent = index === data.currentMilestoneIndex;
                const isFuture = index > data.currentMilestoneIndex;


                return (
                  <div key={milestone.key} className="flex-1">
                    {/* Milestone Dot and Icon */}
                    <div className="flex flex-col items-center gap-2">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-colors ${isCurrent
                            ? "bg-green-100 border-green-500 text-green-600"
                            : isCompleted
                              ? "bg-primary/10 border-primary text-primary"
                              : "bg-secondary/10 border-secondary text-secondary"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-xs font-medium text-center text-muted-foreground">
                        {milestone.label}
                      </span>
                    </div>


                    {/* Connecting Line */}
                    {index < milestones.length - 1 && (
                      <div className="flex items-center justify-center h-1 mt-2">
                        <div
                          className={`flex-1 h-1 ${isCurrent
                              ? "bg-green-500"
                              : isCompleted
                                ? "bg-primary"
                                : "bg-secondary/30"
                            }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
      className={`rounded-lg p-4 border-l-4 space-y-2 ${isLatest
          ? "bg-primary/5 border-l-primary"
          : "bg-secondary/5 border-l-secondary"
        }`}
    >
      {/* Timestamp */}
      <div
        className={`text-xs font-semibold ${isLatest ? "text-foreground/70" : "text-foreground/50"
          }`}
      >
        {formatDateTime(event.timestamp)}
      </div>


      {/* Message */}
      <div className="text-sm font-medium text-foreground">
        {event.message}
      </div>


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
