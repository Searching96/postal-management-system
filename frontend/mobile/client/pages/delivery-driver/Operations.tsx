import DriverShell from "@/components/DriverShell";
import { Button } from "@/components/ui/button";

export function ConfirmPickup() {
  return (
    <DriverShell title="Xác nhận đã lấy hàng" userName="Nguyễn Văn A" role="Bưu tá">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quét mã vận đơn và xác nhận đã lấy hàng tại địa chỉ yêu cầu.
        </p>
        <form className="space-y-3">
          <div>
            <label className="text-sm font-medium">Mã vận đơn</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="VD: VN123456789VN" />
          </div>
          <div>
            <label className="text-sm font-medium">Ghi chú</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="Tình trạng gói hàng..." />
          </div>
          <Button className="w-full">Xác nhận</Button>
        </form>
      </div>
    </DriverShell>
  );
}

export function ConfirmDeliverySuccess() {
  return (
    <DriverShell title="Xác nhận giao thành công" userName="Nguyễn Văn A" role="Bưu tá">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Nhập mã vận đơn, thu COD (nếu có) và xác nhận giao thành công.</p>
        <form className="space-y-3">
          <div>
            <label className="text-sm font-medium">Mã vận đơn</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Số tiền COD (₫)</label>
            <input type="number" min={0} className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <Button className="w-full">Xác nhận giao</Button>
        </form>
      </div>
    </DriverShell>
  );
}

export function ReportDeliveryFailure() {
  return (
    <DriverShell title="Báo cáo giao thất bại" userName="Nguyễn Văn A" role="Bưu tá">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Chọn lý do thất bại và cập nhật để hệ thống xử lý theo quy trình.</p>
        <form className="space-y-3">
          <div>
            <label className="text-sm font-medium">Mã vận đơn</label>
            <input className="mt-1 w-full rounded-md border bg-background px-3 py-2" />
          </div>
          <div>
            <label className="text-sm font-medium">Lý do</label>
            <select className="mt-1 w-full rounded-md border bg-background px-3 py-2">
              <option>Khách hẹn lại</option>
              <option>Không liên lạc được</option>
              <option>Sai địa chỉ</option>
              <option>Khách từ chối nhận</option>
            </select>
          </div>
          <Button className="w-full">Gửi báo cáo</Button>
        </form>
      </div>
    </DriverShell>
  );
}
