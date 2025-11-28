import { Link } from "react-router-dom";
import DriverShell from "@/components/DriverShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, CheckCircle2, XCircle } from "lucide-react";

export default function DriverIndex() {
  return (
    <DriverShell title="Bảng điều khiển" userName="Nguyễn Văn A" role="Bưu tá">
      <section className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <QuickAction to="/delivery-driver/pickup-confirm" icon={<ClipboardCheck className="h-5 w-5"/>} label="Xác nhận lấy"/>
          <QuickAction to="/delivery-driver/deliver-success" icon={<CheckCircle2 className="h-5 w-5"/>} label="Giao thành công"/>
          <QuickAction to="/delivery-driver/deliver-fail" icon={<XCircle className="h-5 w-5"/>} label="Giao thất bại"/>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Thống kê hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Đơn cần lấy" value="12" />
            <Stat label="Đơn cần giao" value="45" />
            <Stat label="Đã giao" value="28" />
            <Stat label="Thất bại" value="3" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">COD & Hoàn trả</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CODRow label="Tổng tiền COD thu" value="8.5M₫" highlight="text-blue-600" />
            <CODRow label="Cần hoàn lại khách" value="2.3M₫" highlight="text-orange-600" />
            <CODRow label="Đã nộp cho công ty" value="6.2M₫" highlight="text-green-600" />
            <CODRow label="Chờ xác nhận hoàn" value="1.5M₫" highlight="text-yellow-600" />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Hiệu suất</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <PerformanceRow label="Tỉ lệ giao đúng hạn" value="92%" highlight="text-green-600" />
            <PerformanceRow label="Tỉ lệ giao thành công" value="89%" highlight="text-green-600" />
            <PerformanceRow label="Giá trị trung bình/đơn" value="125K₫" />
          </CardContent>
        </Card>

        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 p-4">
          <h3 className="font-semibold">Ghi chú nhanh</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Ưu tiên hoàn tất các đơn hẹn giờ trước.</li>
            <li>Ghi nhận hình ảnh khi lấy/giao để làm bằng chứng.</li>
          </ul>
        </div>
      </section>
    </DriverShell>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="block">
      <Button variant="secondary" className="w-full h-16 rounded-xl flex flex-col items-center justify-center gap-1 shadow-sm text-xs">
        {icon}
        <span className="font-medium">{label}</span>
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

function CODRow({ label, value, highlight }: { label: string; value: string; highlight: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight}`}>{value}</span>
    </div>
  );
}

function PerformanceRow({ label, value, highlight }: { label: string; value: string; highlight?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`font-semibold ${highlight || ""}`}>{value}</span>
    </div>
  );
}
