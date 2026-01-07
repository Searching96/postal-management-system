import { Link } from "react-router-dom";
import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, MessageSquareMore } from "lucide-react";

export default function CustomerIndex() {
  return (
    <CustomerShell title="Bảng điều khiển" userName="Nguyễn Văn A" role="Khách hàng">
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-3">
          <QuickAction to="/customer/pickup" icon={<PackagePlus className="h-5 w-5"/>} label="Yêu cầu lấy hàng"/>
          <QuickAction to="/customer/complaint" icon={<MessageSquareMore className="h-5 w-5"/>} label="Gửi khiếu nại"/>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Thống kê hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Đơn hàng gửi đi" value="8" />
            <Stat label="Đã giao" value="6" />
            <Stat label="Đang vận chuyển" value="2" />
            <Stat label="Tổng giá trị COD" value="4.2M₫" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tóm tắt giao hàng</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <DeliveryRow label="Giao đúng hẹn" value="85%" highlight="text-green-600" />
            <DeliveryRow label="Chờ xác nhận" value="2 đơn" highlight="text-yellow-600" />
            <DeliveryRow label="Khiếu nại mở" value="1 đơn" highlight="text-red-600" />
          </CardContent>
        </Card>

        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 p-4">
          <h3 className="font-semibold">Ghi chú nhanh</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Kiểm tra trạng thái giao hàng thường xuyên.</li>
            <li>Liên hệ nhà cung cấp nếu xảy ra vấn đề.</li>
          </ul>
        </div>
      </section>
    </CustomerShell>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="block">
      <Button variant="secondary" className="w-full h-20 rounded-xl flex flex-col items-center justify-center gap-2 shadow-sm">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </Button>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}

function DeliveryRow({ label, value, highlight }: { label: string; value: string; highlight: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight}`}>{value}</span>
    </div>
  );
}
