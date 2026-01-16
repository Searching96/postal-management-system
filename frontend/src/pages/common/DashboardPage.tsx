import { Link } from "react-router-dom";
import { useAuth } from "../../lib/AuthContext";
import {
  MapPin,
  Users,
  Building2,
  Package,
  TrendingUp,
  ClipboardList,
  Truck,
  Settings,
  HelpCircle,
  BarChart3,
  ShieldCheck,
  UserCheck
} from "lucide-react";
import { PageHeader, Card } from "../../components/ui";
import { getRoleLabel } from "../../lib/utils";

export function DashboardPage() {
  const { user } = useAuth();
  const role = user?.role || "";

  // Helpers for role checks
  const isCustomer = role === "CUSTOMER";
  const isSystemAdmin = role === "SYSTEM_ADMIN";
  const isHubAdmin = role === "HUB_ADMIN";
  const isProvinceAdmin = role.includes("PROVINCE_ADMIN");
  const isWardManager = role.includes("WARD_MANAGER");

  // --- STATS CONFIGURATION ---
  const getStats = () => {
    // Basic stats for Customers
    if (isCustomer) {
      return [
        { label: "Đơn hàng đang giao", value: "0", icon: Package, color: "bg-blue-500" },
        { label: "Đã hoàn thành", value: "0", icon: Truck, color: "bg-green-500" },
        { label: "Đang chờ xử lý", value: "0", icon: ClipboardList, color: "bg-yellow-500" },
        { label: "Tổng chi tiêu", value: "0đ", icon: TrendingUp, color: "bg-purple-500" },
      ];
    }

    // Admin/Manager stats (System-wide or Area-wide)
    if (isSystemAdmin || isHubAdmin) {
      return [
        { label: "Tổng đơn hàng", value: "—", icon: Package, color: "bg-blue-500" },
        { label: "Người dùng mới", value: "—", icon: Users, color: "bg-green-500" },
        { label: "Số lượng bưu cục", value: "—", icon: Building2, color: "bg-yellow-500" },
        { label: "Doanh thu", value: "—", icon: BarChart3, color: "bg-purple-500" },
      ];
    }

    // Province/Ward stats (Focus on management, not orders directly)
    if (isProvinceAdmin || isWardManager) {
      return [
        { label: "Nhân viên bưu cục", value: "—", icon: Users, color: "bg-blue-500" },
        { label: "Bưu cục quản lý", value: "—", icon: Building2, color: "bg-green-500" },
        { label: "Hiệu suất xử lý", value: "—", icon: TrendingUp, color: "bg-yellow-500" },
        { label: "Thông báo mới", value: "0", icon: ClipboardList, color: "bg-purple-500" },
      ];
    }

    return [];
  };

  // --- ACTIONS CONFIGURATION ---
  const getActions = () => {
    const actions = [];

    if (isSystemAdmin) {
      actions.push({
        title: "Quản trị Hệ thống",
        desc: "Đăng ký admin và cấu hình",
        icon: ShieldCheck,
        color: "text-primary-600",
        to: "/admin/system"
      });
    }

    if (isHubAdmin) {
      actions.push({
        title: "Quản trị Hub",
        desc: "Quản lý Hub Admin địa phương",
        icon: Building2,
        color: "text-indigo-600",
        to: "/admin/hub"
      });
    }

    if (isCustomer) {
      actions.push({
        title: "Tạo đơn hàng",
        desc: "Bắt đầu một chuyến gửi hàng mới",
        icon: Package,
        color: "text-blue-500",
        to: "/orders/create"
      });
      actions.push({
        title: "Tra cứu vận đơn",
        desc: "Kiểm tra tình trạng hàng hóa",
        icon: MapPin,
        color: "text-green-500",
        to: "/track"
      });
    }

    if (isProvinceAdmin) {
      actions.push({
        title: "Quản trị Tỉnh",
        desc: "Quản lý bưu cục & phân phường",
        icon: Building2,
        color: "text-orange-600",
        to: "/admin/province"
      });
    }

    if (isWardManager) {
      actions.push({
        title: "Quản lý Phường",
        desc: "Điều hành nhân sự tại đơn vị",
        icon: UserCheck,
        color: "text-green-600",
        to: "/admin/ward"
      });
    }

    // Common management actions
    if (role && !isCustomer) {
      actions.push({
        title: "Sơ đồ bưu chính",
        desc: "Tra cứu hệ thống tỉnh thành",
        icon: MapPin,
        color: "text-indigo-500",
        to: "/provinces"
      });
    }

    // Common actions
    actions.push({
      title: "Hỗ trợ",
      desc: "Giải đáp thắc mắc và khiếu nại",
      icon: HelpCircle,
      color: "text-gray-500",
      to: "/support"
    });

    return actions;
  };

  const stats = getStats();
  const actions = getActions();

  return (
    <div className="space-y-8 pb-8">
      <PageHeader
        title="Tổng quan"
        description={`Chào mừng trở lại, ${user && "fullName" in user ? user.fullName : "Người dùng"
          }!`}
      />

      {/* Hero Card / Welcome */}
      <Card className="bg-gradient-to-r from-primary-600 to-primary-700 text-white border-none p-8 overflow-hidden relative">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-2">Xin chào, {user?.fullName}!</h2>
          <p className="text-primary-100 max-w-md">
            Hôm nay bạn có {isCustomer ? "0 đơn hàng" : "một số công việc"} cần xử lý. Hãy bắt đầu một ngày làm việc năng suất nhé!
          </p>
          <div className="mt-6">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-semibold backdrop-blur-sm">
              Vai trò: {getRoleLabel(role)}
            </span>
          </div>
        </div>
        <Package className="absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/10 rotate-12" />
      </Card>

      {/* Stats Grid */}
      {stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => (
            <Card key={idx} className="p-4 hover:shadow-md transition-shadow">
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
      )}

      {/* Quick Actions */}
      <section>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Thực hiện nhanh
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {actions.map((action, idx) => (
            <Link
              key={idx}
              to={action.to}
              className="p-5 bg-white border border-gray-100 rounded-2xl hover:border-primary-500 hover:shadow-lg hover:shadow-primary-500/10 transition-all text-left flex items-start gap-4 group"
            >
              <div className={`p-3 rounded-xl bg-gray-50 group-hover:bg-primary-50 transition-colors ${action.color}`}>
                <action.icon className="h-6 w-6" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{action.title}</p>
                <p className="text-sm text-gray-500 truncate">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
