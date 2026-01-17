import { useState, useEffect } from "react";
import { hubAdminService } from "../../services/hubAdminService";
import { administrativeService } from "../../services/administrativeService";
import { User, Mail, Lock, Building2, Phone, Plus, ShieldCheck, Map, ClipboardList } from "lucide-react";
import type { RegionResponse } from "../../models";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
  Modal,
  FormSelect,
  Badge,
  LoadingSpinner,
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

  const [provinceOffices, setProvinceOffices] = useState<any[]>([]);
  const [isOfficesLoading, setIsOfficesLoading] = useState(false);

  useEffect(() => {
    fetchProvinceOffices();
  }, []);

  const fetchProvinceOffices = async () => {
    setIsOfficesLoading(true);
    try {
      const response = await hubAdminService.getProvinceOffices({ size: 10 });
      if (response.success) {
        setProvinceOffices(response.data.content);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsOfficesLoading(false);
    }
  };

  const areaCount = regions.length;
  // TODO: Add endpoint to fetch Hub Admins count directly if needed, or use separate GET /employees API

  const systemStats = [
    { label: "Khu vực quản lý", value: areaCount.toString(), icon: Map, color: "bg-blue-500" },
    { label: "Đơn hàng xử lý", value: stats.orderCount, icon: ClipboardList, color: "bg-primary-500" },
    { label: "Tổng bưu cục tỉnh", value: provinceOffices.length.toString(), icon: Building2, color: "bg-green-500" },
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

      <div className="grid lg:grid-cols-2 gap-8">
        <Card title="Quản lý Quản trị viên Khu vực">
          <div className="flex flex-col justify-between h-full gap-4">
            <div className="mb-2">
              <p className="text-sm text-gray-500 mb-4">
                Cấp quyền cho quản trị viên mới để quản lý hoạt động bưu chính tại các vùng miền.
              </p>
              <Button onClick={() => setIsModalOpen(true)} className="gap-2 w-full">
                <Plus className="w-4 h-4" /> Đăng ký Admin mới
              </Button>
            </div>

            <div className="border border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50">
              <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <h3 className="text-gray-900 font-bold mb-1">Danh sách Admin</h3>
              <p className="text-xs text-gray-400">Xem và quản lý tài khoản Hub Admin.</p>
            </div>
          </div>
        </Card>

        <Card title="Các Bưu cục Tỉnh phụ trách">
          <div className="space-y-4 h-full">
            <p className="text-sm text-gray-500">
              Danh sách các bưu cục cấp Tỉnh đang hoạt động trong các vùng bạn quản lý.
            </p>
            <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
              {isOfficesLoading ? (
                <div className="py-10 text-center"><LoadingSpinner size="sm" /></div>
              ) : provinceOffices.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Chưa có dữ liệu bưu cục</div>
              ) : (
                provinceOffices.map((office) => (
                  <div key={office.id} className="flex items-center p-3 rounded-xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/10 transition-colors">
                    <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center mr-4">
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{office.officeName}</p>
                      <p className="text-xs text-gray-500 truncate">{office.provinceName || "Bưu cục cấp tỉnh"}</p>
                    </div>
                    <div className="ml-4">
                      <Badge variant="success" className="text-[10px] uppercase">Active</Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

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
