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
      { to: "/dashboard", icon: Home, label: "Dashboard" },
      { to: "/provinces", icon: MapPin, label: "Provinces" },
    ];

    if (role === "SYSTEM_ADMIN") {
      items.push({ to: "/admin/system", icon: Users, label: "System Admin" });
    }

    if (role === "SYSTEM_ADMIN" || role === "HUB_ADMIN") {
      items.push({ to: "/admin/hub", icon: Building2, label: "Hub Admin" });
    }

    if (role === "PO_PROVINCE_ADMIN" || role === "WH_PROVINCE_ADMIN") {
      items.push({
        to: "/admin/province",
        icon: Building2,
        label: "Province Admin",
      });
    }

    if (role === "PO_WARD_MANAGER" || role === "WH_WARD_MANAGER") {
      items.push({ to: "/admin/ward", icon: Building2, label: "Ward Manager" });
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
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 bg-primary-600">
          <h1 className="text-xl font-bold text-white">PMS</h1>
          <button
            className="lg:hidden text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6">
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
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <button
            className="lg:hidden text-gray-600"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>

          <div className="flex-1 lg:flex-none" />

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700">
                {user && "fullName" in user ? user.fullName : "User"}
              </span>
              <span className="text-xs px-2 py-1 bg-primary-100 text-primary-700 rounded-full">
                {role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
