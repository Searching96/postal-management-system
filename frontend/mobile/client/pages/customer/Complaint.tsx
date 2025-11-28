import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import { fetchCustomerInfo, fetchOrders } from "@/services/mockApi";
import { useEffect, useState } from "react";

interface FormState {
  name: string;
  phone: string;
  email: string;
  tracking: string;
  type: string;
  detail: string;
  channel: string;
  claim: string;
}

export default function ComplaintCreate() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<{ value: string; label: string }[]>([]);
  const [formData, setFormData] = useState<FormState>({
    name: "",
    phone: "",
    email: "",
    tracking: "",
    type: "late",
    detail: "",
    channel: "App",
    claim: "",
  });

  // Load customer info and orders on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [customerInfo, ordersList] = await Promise.all([
          fetchCustomerInfo(),
          fetchOrders(),
        ]);

        // Autofill customer info
        setFormData((prev) => ({
          ...prev,
          name: customerInfo.name,
          phone: customerInfo.phone,
          email: customerInfo.email,
        }));

        // Transform orders for combobox
        const orderOptions = ordersList.map((order) => ({
          value: order.orderNumber,
          label: `${order.orderNumber} - ${order.recipientName}`,
        }));
        setOrders(orderOptions);
      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderSelect = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      tracking: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData((prev) => ({
        ...prev,
        tracking: "",
        type: "late",
        detail: "",
        claim: "",
      }));
    }, 3000);
  };

  if (loading) {
    return (
      <CustomerShell title="Gửi khiếu nại" userName="Nguyễn Văn A" role="Khách hàng">
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Đang tải...</div>
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell title="Gửi khiếu nại" userName="Nguyễn Văn A" role="Khách hàng">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Thông tin Khách hàng</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Input
              label="Họ và tên"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <Input
              label="Số điện thoại"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              pattern="^(0|\+?84)[0-9]{8,10}$"
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Đơn hàng liên quan</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-3">
            <Combobox
              label="Mã vận đơn"
              options={orders}
              value={formData.tracking}
              onChange={handleOrderSelect}
              placeholder="Chọn hoặc nhập mã vận đơn..."
              allowCustomInput={true}
            />

            <div>
              <label className="text-sm font-medium">Loại khiếu nại</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
              >
                <option value="late">Giao chậm</option>
                <option value="lost">Mất hàng</option>
                <option value="damage">Hư hỏng</option>
                <option value="cod">Sai COD</option>
                <option value="other">Khác</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Mô tả chi tiết</label>
              <textarea
                name="detail"
                value={formData.detail}
                onChange={handleInputChange}
                rows={4}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                placeholder="Mô tả vấn đề gặp phải..."
              />
            </div>

            <div className="grid grid-cols-2 gap-3 items-end">
              <div>
                <label className="text-sm font-medium">Kênh tiếp nhận đơn h��ng</label>
                <select
                  name="channel"
                  value={formData.channel}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-md border bg-background px-3 py-2"
                >
                  <option>App</option>
                  <option>Web</option>
                  <option>Hotline</option>
                  <option>Quầy</option>
                </select>
              </div>
              <Input
                label="Số tiền bồi thường mong muốn (₫)"
                name="claim"
                type="number"
                value={formData.claim}
                onChange={handleInputChange}
                min={0}
              />
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
