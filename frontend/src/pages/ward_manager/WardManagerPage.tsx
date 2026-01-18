import { useState, useEffect } from "react";
import { wardManagerService } from "../../services/wardManagerService";
import { User, Mail, Lock, Users, Phone, ShieldCheck, ClipboardList, TrendingUp, Plus } from "lucide-react";
import {
  PageHeader,
  Card,
  Alert,
  Button,
  FormInput,
  Modal,
} from "../../components/ui";

export function WardManagerPage() {
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [employeeRole, setEmployeeRole] = useState<"staff" | "manager">("staff");

  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const payload = {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        password: formData.password
      };

      const response =
        employeeRole === "staff"
          ? await wardManagerService.createStaff(payload)
          : await wardManagerService.createWardManager(payload);

      if (response.success) {
        setSuccess(`Tạo thành công ${employeeRole === 'staff' ? 'Nhân viên' : 'Quản lý'} ${response.data.fullName}`);
        setFormData({ fullName: "", phoneNumber: "", email: "", password: "" });
        setIsEmployeeModalOpen(false);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError("Lỗi khi tạo nhân sự. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };  // --- STATS & DATA FETCHING ---
  const [statsData, setStatsData] = useState<Record<string, string>>({
    staffCount: "0",
    orderCount: "0",
  });

  const stats = [
    { label: "Nhân sự trực thuộc", value: statsData.staffCount || "0", icon: Users, color: "bg-blue-500" },
    { label: "Đơn hàng trong ngày", value: statsData.orderCount || "0", icon: ClipboardList, color: "bg-green-500" },
    { label: "Hiệu suất xử lý", value: "—", icon: TrendingUp, color: "bg-orange-500" },
    { label: "Trạng thái vận hành", value: "Tốt", icon: ShieldCheck, color: "bg-primary-500" },
  ];

  // --- EMPLOYEE DATA ---
  const [employees, setEmployees] = useState<any[]>([]);
  const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchEmployees = async () => {
    setIsEmployeesLoading(true);
    try {
      const response = await wardManagerService.getEmployees({ size: 10, search: searchTerm });
      if (response.success) {
        setEmployees(response.data.content);
        setStatsData(prev => ({ ...prev, staffCount: response.data.totalElements.toString() }));
      }
    } catch (e) { console.error(e); }
    finally { setIsEmployeesLoading(false); }
  };

  useEffect(() => {
    fetchEmployees();
  }, [searchTerm]);

  const handleDeleteEmployee = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa nhân sự này?")) return;
    try {
      const res = await wardManagerService.deleteEmployee(id);
      if (res.success) {
        setSuccess("Đã xóa nhân sự thành công");
        fetchEmployees();
      }
    } catch (e) {
      setError("Không thể xóa nhân sự");
    }
  };

  // Main Actions Area
  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Quản lý Phường/Xã"
        description="Quản lý nhân sự và theo dõi hoạt động bưu cục/kho tại địa bàn"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Phân bổ Nhân sự">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              <Button
                variant="ghost"
                onClick={() => {
                  setEmployeeRole("staff");
                  setIsEmployeeModalOpen(true);
                }}
                className="group p-6 h-auto border border-gray-100 rounded-2xl hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-left bg-white flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-primary-50 transition-colors">
                  <Users className="h-6 w-6 text-blue-600 group-hover:text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Tạo Nhân viên (Staff)</h3>
                <p className="text-sm text-gray-500">Thêm nhân viên xử lý đơn hàng/giao nhận cho đơn vị.</p>
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setEmployeeRole("manager");
                  setIsEmployeeModalOpen(true);
                }}
                className="group p-6 h-auto border border-gray-100 rounded-2xl hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/5 transition-all text-left bg-white flex-col items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4 group-hover:bg-primary-50 transition-colors">
                  <ShieldCheck className="h-6 w-6 text-green-600 group-hover:text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1">Thêm Quản lý Ward</h3>
                <p className="text-sm text-gray-500">Cấp quyền quản lý cho một thành viên khác trong đơn vị.</p>
              </Button>
            </div>
          </Card>

          <Card title="Danh sách nhân sự đơn vị" className="overflow-hidden">
            <div className="p-4 border-b">
              <FormInput
                label="Tìm kiếm nhân sự"
                placeholder="Tìm kiếm theo tên, sđt..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 text-gray-500 font-medium border-b">
                  <tr>
                    <th className="px-6 py-3">Họ và tên</th>
                    <th className="px-4 py-3">Liên hệ</th>
                    <th className="px-4 py-3">Vai trò</th>
                    <th className="px-6 py-3 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {isEmployeesLoading ? (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-400">Đang tải...</td></tr>
                  ) : employees.length === 0 ? (
                    <tr><td colSpan={4} className="py-10 text-center text-gray-400">Chưa có nhân sự nào</td></tr>
                  ) : (
                    employees.map(emp => (
                      <tr key={emp.employeeId} className="hover:bg-gray-50/50">
                        <td className="px-6 py-4 font-medium text-gray-900">{emp.fullName}</td>
                        <td className="px-4 py-4 text-gray-500">
                          <div>{emp.phoneNumber}</div>
                          <div className="text-xs opacity-60">{emp.email}</div>
                        </td>
                        <td className="px-4 py-4 uppercase text-[10px] font-bold">
                          <span className="px-2 py-0.5 rounded bg-gray-100">{emp.role.replace('ROLE_', '')}</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDeleteEmployee(emp.employeeId)}>Xóa</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Thông báo đơn vị">
            <div className="space-y-4">
              {[1, 2].map(i => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 italic text-gray-500 text-xs">
                  Hệ thống tự động: Bản tin cập nhật bưu cục hàng tuần dự kiến vào sáng thứ Hai.
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      <Modal
        isOpen={isEmployeeModalOpen}
        onClose={() => setIsEmployeeModalOpen(false)}
        title={`Thêm ${employeeRole === 'staff' ? 'Nhân viên' : 'Quản lý'} mới`}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="p-4 bg-primary-50 rounded-xl border border-primary-100 flex items-start gap-3 mt-4">
            <ShieldCheck className="w-5 h-5 text-primary-600 shrink-0" />
            <p className="text-xs text-primary-700 leading-relaxed">
              Lưu ý: Nhân sự mới sẽ được mặc định gắn vào <strong>đơn vị hiện tại</strong> của bạn.
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t mt-6">
            <Button variant="ghost" onClick={() => setIsEmployeeModalOpen(false)}>Hủy</Button>
            <Button type="submit" isLoading={isLoading} className="gap-2">
              <Plus className="w-4 h-4" /> Tạo Tài Khoản
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
