import { useState } from "react";
import { dashboardService } from "../../services/dashboardService";
import { User, Mail, Lock, Phone, Plus, ShieldCheck, Database, Settings, Activity } from "lucide-react";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
  Modal,
} from "../../components/ui";

export function SystemAdminPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await dashboardService.registerAdmin(formData);
      if (response.success) {
        setSuccess(`Tài khoản System Admin đã được khởi tạo thành công.`);
        setFormData({ fullName: "", phoneNumber: "", email: "", password: "" });
        setIsModalOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Lỗi hệ thống khi đăng ký admin. Vui lòng thử lại sau.");
    } finally {
      setIsLoading(false);
    }
  };

  const systemStats = [
    { label: "Tổng System Admin", value: "—", icon: ShieldCheck, color: "bg-primary-500" },
    { label: "Dung lượng Database", value: "—", icon: Database, color: "bg-indigo-500" },
    { label: "Cấu hình hệ thống", value: "Chuẩn", icon: Settings, color: "bg-orange-500" },
    { label: "Trạng thái Server", value: "Online", icon: Activity, color: "bg-green-500" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Quản trị Hệ thống"
        description="Quản lý các tài khoản quản trị cao cấp nhất (Root Admins)"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {systemStats.map((stat, idx) => (
          <Card key={idx} className="p-4">
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-xl shadow-inner`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {error && <Alert type="error" onClose={() => setError("")}>{error}</Alert>}
      {success && <Alert type="success" onClose={() => setSuccess("")}>{success}</Alert>}

      <Card title="Quản lý System Administrator">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <p className="text-sm text-gray-500 max-w-xl">
            Tài khoản System Admin có quyền hạn cao nhất trong toàn bộ hệ thống.
            Hãy cẩn trọng khi cấp quyền mới cho bộ phận kỹ thuật hoặc vận hành cấp cao.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Thêm Root Admin
          </Button>
        </div>

        <div className="grid gap-6">
          <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center bg-gray-50/30">
            <ShieldCheck className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-sm italic">Danh sách quản trị viên hệ thống sẽ được liệt kê tại đây.</p>
          </div>
        </div>
      </Card>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký System Admin Mới"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
            <Settings className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <p className="text-xs text-orange-700 leading-relaxed font-medium">
              Cảnh báo: Tài khoản này có thể truy cập toàn bộ dữ liệu người dùng và hệ thống.
              Đảm bảo người được cấp quyền tuân thủ các chính sách bảo mật của công ty.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <FormInput
              label="Họ và Tên"
              icon={User}
              required
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
            />

            <FormInput
              label="Số Điện Thoại"
              icon={Phone}
              required
              value={formData.phoneNumber}
              onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
            />

            <FormInput
              label="Email"
              icon={Mail}
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
            />

            <FormInput
              label="Mật Khẩu"
              icon={Lock}
              type="password"
              required
              minLength={6}
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading} className="min-w-[140px]">Tạo tài khoản</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
