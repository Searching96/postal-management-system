import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import {
  Home,
  Package,
  Truck,
  FileText,
  AlertCircle,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  DollarSign,
  BarChart,
  UserCheck,
  Building,
  MessageSquare,
  QrCode,
  Scan,
  ClipboardList,
  Calculator,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { getNavigationForRole, RBAC_CONFIG } from "@/config/rbac.config";

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  Users: <Users size={20} />,
  DollarSign: <DollarSign size={20} />,
  BarChart: <BarChart size={20} />,
  FileText: <FileText size={20} />,
  UserCheck: <UserCheck size={20} />,
  AlertCircle: <AlertCircle size={20} />,
  Building: <Building size={20} />,
  Package: <Package size={20} />,
  MessageSquare: <MessageSquare size={20} />,
  QrCode: <QrCode size={20} />,
  Scan: <Scan size={20} />,
  ClipboardList: <ClipboardList size={20} />,
  Truck: <Truck size={20} />,
  Calculator: <Calculator size={20} />,
  CreditCard: <CreditCard size={20} />,
  TrendingUp: <TrendingUp size={20} />,
  Home: <Home size={20} />,
};

export const DashboardLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // Get navigation items strictly based on RBAC configuration
  const navigationItems = getNavigationForRole(user.role);
  const roleLabel = RBAC_CONFIG[user.role]?.label || user.role;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="flex h-screen bg-secondary-50">
      {/* Sidebar - Desktop */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-white border-r border-secondary-200 transition-all duration-300 hidden lg:block`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-center border-b border-secondary-200 px-4">
            {sidebarOpen ? (
              <h1 className="text-xl font-bold text-primary-600">Bưu chính</h1>
            ) : (
              <Package className="text-primary-600" size={24} />
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            {navigationItems.map((item) => (
              <a
                key={item.path}
                href={item.path}
                className="flex items-center px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              >
                <span className="flex-shrink-0">{ICON_MAP[item.icon]}</span>
                {sidebarOpen && (
                  <span className="ml-3 text-sm font-medium">{item.label}</span>
                )}
              </a>
            ))}
          </nav>

          {/* User Info */}
          <div className="border-t border-secondary-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-600 font-semibold text-sm">
                    {user.fullName.charAt(0)}
                  </span>
                </div>
              </div>
              {sidebarOpen && (
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-secondary-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-secondary-500">{roleLabel}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full flex items-center justify-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={16} />
              {sidebarOpen && <span className="ml-2">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white">
            <div className="flex flex-col h-full">
              <div className="h-16 flex items-center justify-between px-4 border-b border-secondary-200">
                <h1 className="text-xl font-bold text-primary-600">
                  Bưu chính
                </h1>
                <button onClick={() => setMobileMenuOpen(false)}>
                  <X size={24} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.path}
                    href={item.path}
                    className="flex items-center px-4 py-3 text-secondary-700 hover:bg-primary-50 hover:text-primary-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {ICON_MAP[item.icon]}
                    <span className="ml-3 text-sm font-medium">
                      {item.label}
                    </span>
                  </a>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-secondary-200 flex items-center justify-between px-4">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block text-secondary-500 hover:text-secondary-700 mr-4"
            >
              <Menu size={24} />
            </button>
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden text-secondary-500 hover:text-secondary-700"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-lg font-semibold text-secondary-900 ml-4">
              Xin chào, {user.fullName}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative text-secondary-500 hover:text-secondary-700">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
