import MobileShell from "@/components/MobileShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";

export default function ComplaintCreate() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <MobileShell title="Gửi khiếu nại" userName="Nguyễn Văn A" role="Khách hàng">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
        }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input label="Họ và tên" name="name" required />
            <Input label="Số điện thoại" name="phone" required pattern="^(0|\+?84)[0-9]{8,10}$" />
            <Input label="Email" name="email" type="email" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input label="Mã vận đơn" name="tracking" required />
            <div>
              <label className="text-sm font-medium">Loại khiếu nại</label>
              <select name="type" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
                <option value="late">Giao chậm</option>
                <option value="lost">Mất hàng</option>
                <option value="damage">Hư hỏng</option>
                <option value="cod">Sai COD</option>
                <option value="other">Khác</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Mô tả chi tiết</label>
              <textarea name="detail" rows={4} className="mt-1 w-full rounded-md border bg-background px-3 py-2" placeholder="Mô tả vấn đề gặp phải..." />
            </div>
            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-sm font-medium">Kênh tiếp nhận đơn hàng</label>
                <select name="channel" className="mt-1 w-full rounded-md border bg-background px-3 py-2">
                  <option>App</option>
                  <option>Web</option>
                  <option>Hotline</option>
                  <option>Quầy</option>
                </select>
              </div>
              <Input label="Số tiền bồi thường mong muốn (₫)" name="claim" type="number" min={0} />
            </div>
          </CardContent>
        </Card>

        <Button className="w-full h-12 rounded-xl">Gửi khiếu nại</Button>
        {submitted && (
          <div className="rounded-lg border bg-amber-50 p-3 text-sm text-amber-700">
            Khiếu nại đã được tiếp nhận. Chúng tôi sẽ phản hồi trong thời gian sớm nhất.
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
      <input {...props} className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring" />
    </div>
  );
}
