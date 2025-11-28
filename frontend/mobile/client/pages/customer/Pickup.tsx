import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchCustomerInfo } from "@/services/mockApi";
import { useEffect, useState } from "react";

interface FormState {
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: string;
  value: string;
  length: string;
  width: string;
  height: string;
  note: string;
  service: string;
  cod: string;
  insurance: string;
  pickupTime: string;
  deliverTime: string;
}

export default function PickupRequest() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<FormState>({
    senderName: "",
    senderPhone: "",
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    weight: "",
    value: "",
    length: "",
    width: "",
    height: "",
    note: "",
    service: "express",
    cod: "",
    insurance: "",
    pickupTime: "",
    deliverTime: "",
  });

  // Load customer info on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const customerInfo = await fetchCustomerInfo();

        // Autofill sender info from customer info
        setFormData((prev) => ({
          ...prev,
          senderName: customerInfo.name,
          senderPhone: customerInfo.phone,
          senderAddress: customerInfo.address
        }));
      } catch (error) {
        console.error("Failed to load customer info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
    }, 3000);
  };

  if (loading) {
    return (
      <CustomerShell title="Yêu cầu lấy hàng" userName="Nguyễn Văn A" role="Khách hàng">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell title="Yêu cầu lấy hàng" userName="Nguyễn Văn A" role="Khách hàng">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Người gửi</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input
              name="senderName"
              label="Họ và tên"
              value={formData.senderName}
              onChange={handleInputChange}
              required
            />
            <Input
              name="senderPhone"
              label="Số điện thoại"
              value={formData.senderPhone}
              onChange={handleInputChange}
              required
              pattern="^(0|\+?84)[0-9]{8,10}$"
            />
            <Input
              name="senderAddress"
              label="Địa chỉ"
              value={formData.senderAddress}
              onChange={handleInputChange}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Người nhận</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input
              name="receiverName"
              label="Họ và tên"
              value={formData.receiverName}
              onChange={handleInputChange}
              required
            />
            <Input
              name="receiverPhone"
              label="Số điện thoại"
              value={formData.receiverPhone}
              onChange={handleInputChange}
              required
              pattern="^(0|\+?84)[0-9]{8,10}$"
            />
            <Input
              name="receiverAddress"
              label="Địa chỉ"
              value={formData.receiverAddress}
              onChange={handleInputChange}
              required
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết Bưu kiện</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <Input
              name="weight"
              label="Khối lượng (kg)"
              type="number"
              step="0.01"
              min={0}
              value={formData.weight}
              onChange={handleInputChange}
              required
            />
            <Input
              name="value"
              label="Giá trị khai (₫)"
              type="number"
              min={0}
              value={formData.value}
              onChange={handleInputChange}
            />
            <Input
              name="length"
              label="Dài (cm)"
              type="number"
              min={0}
              value={formData.length}
              onChange={handleInputChange}
            />
            <Input
              name="width"
              label="Rộng (cm)"
              type="number"
              min={0}
              value={formData.width}
              onChange={handleInputChange}
            />
            <Input
              name="height"
              label="Cao (cm)"
              type="number"
              min={0}
              value={formData.height}
              onChange={handleInputChange}
            />
            <div className="col-span-2">
              <label className="text-sm font-medium">Ghi chú</label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleInputChange}
                className="mt-1 w-full resize-y rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                rows={3}
                placeholder="Hàng dễ vỡ, vui lòng gọi trước..."
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tùy chọn Dịch vụ</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-3 gap-2">
              <Radio
                name="service"
                value="express"
                label="Hỏa tốc"
                checked={formData.service === "express"}
                onChange={handleInputChange}
              />
              <Radio
                name="service"
                value="fast"
                label="Nhanh"
                checked={formData.service === "fast"}
                onChange={handleInputChange}
              />
              <Radio
                name="service"
                value="economy"
                label="Tiết kiệm"
                checked={formData.service === "economy"}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                name="cod"
                label="Thu hộ COD (₫)"
                type="number"
                min={0}
                value={formData.cod}
                onChange={handleInputChange}
              />
              <Input
                name="insurance"
                label="Bảo hiểm (₫)"
                type="number"
                min={0}
                value={formData.insurance}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium">Thời gian lấy dự kiến</label>
                <input
                  name="pickupTime"
                  type="datetime-local"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Hẹn giờ giao</label>
                <input
                  name="deliverTime"
                  type="datetime-local"
                  value={formData.deliverTime}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                />
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
    </CustomerShell>
  );
}

function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
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

function Radio({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
      <input type="radio" {...props} />
      {label}
    </label>
  );
}
