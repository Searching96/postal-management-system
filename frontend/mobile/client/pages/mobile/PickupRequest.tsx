import MobileShell from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function PickupRequest() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <MobileShell title="Yêu cầu lấy hàng" userName="Nguyễn Văn A" role="Khách hàng">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Người gửi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input name="senderName" label="Họ và tên" required />
            <Input name="senderPhone" label="Số điện thoại" required pattern="^(0|\+?84)[0-9]{8,10}$" />
            <Input name="senderAddress" label="Địa chỉ" required />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Người nhận</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input name="receiverName" label="Họ và tên" required />
            <Input name="receiverPhone" label="Số điện thoại" required pattern="^(0|\+?84)[0-9]{8,10}$" />
            <Input name="receiverAddress" label="Địa chỉ" required />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết Bưu kiện</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Input name="weight" label="Khối lượng (kg)" type="number" step="0.01" min={0} required />
            <Input name="value" label="Giá trị khai (₫)" type="number" min={0} />
            <Input name="length" label="Dài (cm)" type="number" min={0} />
            <Input name="width" label="Rộng (cm)" type="number" min={0} />
            <Input name="height" label="Cao (cm)" type="number" min={0} />
            <div className="col-span-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea name="note" className="mt-1 w-full resize-y rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" rows={3} placeholder="Hàng dễ vỡ, vui lòng gọi trước..." />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tùy chọn Dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Radio name="service" value="express" label="Hỏa tốc" defaultChecked />
              <Radio name="service" value="fast" label="Nhanh" />
              <Radio name="service" value="economy" label="Tiết kiệm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input name="cod" label="Thu hộ COD (₫)" type="number" min={0} />
              <Input name="insurance" label="Bảo hiểm (₫)" type="number" min={0} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Thời gian lấy dự kiến</label>
                <input name="pickupTime" type="datetime-local" className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className="text-sm font-medium">Hẹn giờ giao</label>
                <input name="deliverTime" type="datetime-local" className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-12 rounded-xl">Gửi yêu cầu lấy hàng</Button>

        {submitted && (
          <div className="rounded-lg border bg-green-50 p-3 text-sm text-green-700">
            Đã ghi nhận yêu cầu. Chúng tôi sẽ liên hệ để xác nhận lịch lấy hàng.
          </div>
        )}
      </form>
    </MobileShell>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input
        {...props}
        className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  );
}

function Radio({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <input type="radio" {...props} />
      {label}
    </label>
  );
}
