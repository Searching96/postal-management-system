import { useState, useEffect } from "react";
import { hubAdminService } from "../../services/hubAdminService";
import { administrativeService } from "../../services/administrativeService";
import { User, Mail, Lock, Building2, Phone, Plus, ShieldCheck, Map, Users, ClipboardList } from "lucide-react";
import type { RegionResponse } from "../../models";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
  Modal,
  FormSelect,
} from "../../components/ui";

export function HubAdminPage() {
  const [regions, setRegions] = useState<RegionResponse[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
    regionId: 0,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchRegions();
  }, []);

  const fetchRegions = async () => {
    try {
      const response = await administrativeService.getAllRegions();
      if (response.success) {
        setRegions(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, regionId: response.data[0].id }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch regions:", err);
    }
  };

  // Fetch Hub Stats
  const [stats, setStats] = useState({ orderCount: "0", userCount: "0" });
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch orders to show activity in the hub
        const orders = await import("../../services/orderService").then(m => m.orderService.getOrders({ size: 1 })).catch(() => ({ data: { totalElements: 0 } }));
        setStats(prev => ({ ...prev, orderCount: orders.data.totalElements.toString() }));
      } catch (e) { console.error(e); }
    };
    fetchStats();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const response = await hubAdminService.registerHubAdmin(formData);
      if (response.success) {
        setSuccess(`Đã đăng ký thành công Hub Admin: ${response.data.fullName}`);
        setFormData({
          fullName: "",
          phoneNumber: "",
          email: "",
          password: "",
          regionId: regions.length > 0 ? regions[0].id : 0,
        });
        setIsModalOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Lỗi khi đăng ký Hub Admin. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate/Fetch stats
  const areaCount = regions.length;
  // TODO: Add endpoint to fetch Hub Admins count directly if needed, or use separate GET /employees API
  // TODO: Add endpoint to fetch Hub Admins count directly if needed, or use separate GET /employees API

  const systemStats = [
    { label: "Khu vực quản lý", value: areaCount.toString(), icon: Map, color: "bg-blue-500" },
    { label: "Đơn hàng xử lý", value: stats.orderCount, icon: ClipboardList, color: "bg-primary-500" },
    { label: "Tổng nhân sự bưu cục", value: "—", icon: Users, color: "bg-green-500" },
    { label: "Tình trạng Hub", value: "Ổn định", icon: Building2, color: "bg-indigo-500" },
  ];

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Quản trị Hub"
        description="Quản lý và cấp quyền cho các Quản trị viên Khu vực (Hub Admins)"
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

      <Card title="Quản lý Quản trị viên Khu vực">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <p className="text-sm text-gray-500">
            Cấp quyền cho quản trị viên mới để quản lý hoạt động bưu chính và kho bãi tại các vùng miền.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Đăng ký Admin mới
          </Button>
        </div>

        <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <ShieldCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 font-bold mb-1">Danh sách Quản trị viên Hub</h3>
          <p className="text-sm text-gray-400">Chưa có dữ liệu liệt kê. Sử dụng nút đăng ký để thêm mới.</p>
        </div>
      </Card>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Đăng ký Hub Admin Mới"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-gray-500 mb-4">
            Vui lòng nhập đầy đủ thông tin để khởi tạo tài khoản quản trị cho khu vực.
          </p>

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

          <FormSelect
            label="Khu vực phụ trách (Region)"
            icon={Building2}
            value={formData.regionId}
            onChange={val => setFormData({ ...formData, regionId: val as number })}
            required
            options={regions.map(r => ({ value: r.id, label: r.name }))}
          />

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading} className="px-8">Đăng ký ngay</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
