import { Link, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import {
  Home,
  MapPin,
  Users,
  Building2,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";
import { useState } from "react";
import { getRoleLabel } from "../lib/utils";

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const role = user?.role || "";

  // Navigation items based on role
  const getNavItems = () => {
    const items = [
      { to: "/dashboard", icon: Home, label: "Tổng quan" },
      { to: "/provinces", icon: MapPin, label: "Tỉnh thành" },
    ];

    if (role === "SYSTEM_ADMIN") {
      items.push({ to: "/admin/system", icon: Users, label: "Quản trị hệ thống" });
    }

    if (role === "SYSTEM_ADMIN" || role === "HUB_ADMIN") {
      items.push({ to: "/admin/hub", icon: Building2, label: "Quản lý bưu cục" });
    }

    if (role === "PO_PROVINCE_ADMIN" || role === "WH_PROVINCE_ADMIN") {
      items.push({
        to: "/admin/province",
        icon: Building2,
        label: "Quản lý tỉnh",
      });
    }

    if (role === "PO_WARD_MANAGER" || role === "WH_WARD_MANAGER") {
      items.push({ to: "/admin/ward", icon: Building2, label: "Quản lý xã" });
    }

    return items;
  };

  const navItems = getNavItems();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600 shrink-0">
          <h1 className="text-xl font-bold text-white uppercase tracking-wider">PMS</h1>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 flex-1 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
              onClick={() => setSidebarOpen(false)}
            >
              <item.icon size={20} className="mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Profile at the bottom */}
        <div className="border-t border-gray-100 p-4 shrink-0">
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 transition-colors group">
            <Link
              to="/profile"
              className="flex items-center min-w-0 flex-1"
              onClick={() => setSidebarOpen(false)}
            >
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center shrink-0 group-hover:bg-primary-200 transition-colors">
                <User size={20} className="text-primary-600" />
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user && "fullName" in user ? user.fullName : "Người dùng"}
                </p>
                <p className="text-xs text-primary-600 font-semibold truncate">
                  {getRoleLabel(role)}
                </p>
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all ml-2"
              title="Đăng xuất"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6 lg:hidden">
          <button
            className="text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
