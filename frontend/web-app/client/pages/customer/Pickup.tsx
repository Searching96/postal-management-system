import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
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
            <div className="space-y-2">
              <Label htmlFor="senderName">Họ và tên</Label>
              <Input
                id="senderName"
                name="senderName"
                value={formData.senderName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderPhone">Số điện thoại</Label>
              <Input
                id="senderPhone"
                name="senderPhone"
                value={formData.senderPhone}
                onChange={handleInputChange}
                required
                pattern="^(0|\+?84)[0-9]{8,10}$"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senderAddress">Địa chỉ</Label>
              <Input
                id="senderAddress"
                name="senderAddress"
                value={formData.senderAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Người nhận</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label htmlFor="receiverName">Họ và tên</Label>
              <Input
                id="receiverName"
                name="receiverName"
                value={formData.receiverName}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverPhone">Số điện thoại</Label>
              <Input
                id="receiverPhone"
                name="receiverPhone"
                value={formData.receiverPhone}
                onChange={handleInputChange}
                required
                pattern="^(0|\+?84)[0-9]{8,10}$"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receiverAddress">Địa chỉ</Label>
              <Input
                id="receiverAddress"
                name="receiverAddress"
                value={formData.receiverAddress}
                onChange={handleInputChange}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Chi tiết Bưu kiện</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="weight">Khối lượng (kg)</Label>
              <Input
                id="weight"
                name="weight"
                type="number"
                step="0.01"
                min={0}
                value={formData.weight}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="value">Giá trị khai (₫)</Label>
              <Input
                id="value"
                name="value"
                type="number"
                min={0}
                value={formData.value}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="length">Dài (cm)</Label>
              <Input
                id="length"
                name="length"
                type="number"
                min={0}
                value={formData.length}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="width">Rộng (cm)</Label>
              <Input
                id="width"
                name="width"
                type="number"
                min={0}
                value={formData.width}
                onChange={handleInputChange}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Cao (cm)</Label>
              <Input
                id="height"
                name="height"
                type="number"
                min={0}
                value={formData.height}
                onChange={handleInputChange}
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="note">Ghi chú</Label>
              <Textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleInputChange}
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
            <div className="space-y-2">
              <Label>Dịch vụ</Label>
              <RadioGroup
                value={formData.service}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, service: value }))}
                className="grid grid-cols-3 gap-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="express" id="express" />
                  <Label htmlFor="express">Hỏa tốc</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fast" id="fast" />
                  <Label htmlFor="fast">Nhanh</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="economy" id="economy" />
                  <Label htmlFor="economy">Tiết kiệm</Label>
                </div>
              </RadioGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="cod">Thu hộ COD (₫)</Label>
                <Input
                  id="cod"
                  name="cod"
                  type="number"
                  min={0}
                  value={formData.cod}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insurance">Bảo hiểm (₫)</Label>
                <Input
                  id="insurance"
                  name="insurance"
                  type="number"
                  min={0}
                  value={formData.insurance}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="pickupTime">Thời gian lấy dự kiến</Label>
                <Input
                  id="pickupTime"
                  name="pickupTime"
                  type="datetime-local"
                  value={formData.pickupTime}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliverTime">Hẹn giờ giao</Label>
                <Input
                  id="deliverTime"
                  name="deliverTime"
                  type="datetime-local"
                  value={formData.deliverTime}
                  onChange={handleInputChange}
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
