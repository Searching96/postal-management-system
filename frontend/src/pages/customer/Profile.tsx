import CustomerShell from "@/components/CustomerShell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/ui/phone-input";
import { EmailInput } from "@/components/ui/email-input";
import { ProvinceSelect } from "@/components/ui/province-select";
import { CommuneSelect } from "@/components/ui/commune-select";
import { fetchCustomerInfo } from "@/services/mockApi";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ProfileFormState {
  name: string;
  email: string;
  phone: string;
  provinceCode: string;
  communeName: string;
  specificAddress: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<ProfileFormState>({
    name: "",
    email: "",
    phone: "",
    provinceCode: "",
    communeName: "",
    specificAddress: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const data = await fetchCustomerInfo();
        // Mock parsing address: "Specific, Commune, Province"
        // This is a rough estimation since we don't have structured address in mockApi
        const parts = data.address.split(",").map((p) => p.trim());
        const specific = parts.slice(0, parts.length - 2).join(", ");
        // Note: We don't have province code in mock data, so this might fail to pre-select
        // In a real app, API should return structured address codes.
        // For now, we leave select placeholders empty or rely on user to re-select.

        setForm((prev) => ({
          ...prev,
          name: data.name,
          email: data.email,
          phone: data.phone,
          specificAddress: specific,
          // province/commune left empty as we can't reverse map name to code easily without full list lookup
        }));
      } catch (error) {
        console.error("Failed to load profile", error);
        setMessage({ type: "error", text: "Không thể tải thông tin cá nhân" });
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProvinceChange = (value: string) => {
    setForm((prev) => ({ ...prev, provinceCode: value, communeName: "" }));
  };

  const handleCommuneChange = (value: string) => {
    setForm((prev) => ({ ...prev, communeName: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Basic Password Confirmation
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setMessage({ type: "error", text: "Mật khẩu mới không khớp!" });
      return;
    }

    try {
      setSubmitting(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
      // Reset password fields
      setForm((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({ type: "error", text: "Có lỗi xảy ra khi cập nhật." });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <CustomerShell
        title="Thông tin cá nhân"
        userName="Nguyễn Văn A"
        role="Khách hàng"
      >
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </CustomerShell>
    );
  }

  return (
    <CustomerShell
      title="Thông tin cá nhân"
      userName={form.name || "Nguyễn Văn A"}
      role="Khách hàng"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        {message && (
          <div
            className={`p-4 rounded-md text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <EmailInput
                    id="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Số điện thoại</Label>
                  <PhoneInput
                    id="phone"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Địa chỉ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tỉnh / Thành phố</Label>
                  <ProvinceSelect
                    value={form.provinceCode}
                    onValueChange={handleProvinceChange}
                    placeholder="Chọn Tỉnh/Thành phố"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phường / Xã</Label>
                  <CommuneSelect
                    provinceCode={form.provinceCode}
                    value={form.communeName}
                    onValueChange={handleCommuneChange}
                    disabled={!form.provinceCode}
                    placeholder="Chọn Phường/Xã"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specificAddress">Địa chỉ cụ thể</Label>
                <Input
                  id="specificAddress"
                  name="specificAddress"
                  placeholder="Số nhà, tên đường..."
                  value={form.specificAddress}
                  onChange={handleChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Đổi mật khẩu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={form.currentPassword}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Mật khẩu mới</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={form.newPassword}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang cập nhật...
              </>
            ) : (
              "Lưu thay đổi"
            )}
          </Button>
        </form>
      </div>
    </CustomerShell>
  );
}
