import { Link } from "react-router-dom";
import MobileShell from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePlus, ClipboardCheck, CheckCircle2, XCircle, MessageSquareMore } from "lucide-react";

export default function Index() {
  return (
    <MobileShell title="Bảng điều khiển" userName="Nguyễn Văn A" role="Bưu tá">
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <QuickAction to="/pickup" icon={<PackagePlus className="h-5 w-5"/>} label="Yêu cầu lấy hàng"/>
          <QuickAction to="/pickup-confirm" icon={<ClipboardCheck className="h-5 w-5"/>} label="Xác nhận đã lấy"/>
          <QuickAction to="/deliver-success" icon={<CheckCircle2 className="h-5 w-5"/>} label="Giao thành công"/>
          <QuickAction to="/deliver-fail" icon={<XCircle className="h-5 w-5"/>} label="Giao thất bại"/>
          <QuickAction to="/complaint" icon={<MessageSquareMore className="h-5 w-5"/>} label="Gửi khiếu nại"/>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Tổng quan hôm nay</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3 text-sm">
            <Stat label="Đơn cần lấy" value="12" />
            <Stat label="Đơn cần giao" value="45" />
            <Stat label="Thành công" value="89%" />
            <Stat label="Khiếu nại mới" value="2" />
          </CardContent>
        </Card>

        <div className="rounded-lg bg-gradient-to-r from-primary/10 via-primary/5 to-accent/20 p-4">
          <h3 className="font-semibold">Mẹo nhanh</h3>
          <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
            <li>Ưu tiên hoàn tất các đơn hẹn giờ trước.</li>
            <li>Ghi nhận hình ảnh khi lấy/giao để làm bằng chứng.</li>
          </ul>
        </div>
      </section>
    </MobileShell>
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
