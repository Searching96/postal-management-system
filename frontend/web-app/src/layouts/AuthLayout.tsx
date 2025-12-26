import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/store";
import { Package } from "lucide-react";

export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-lg mb-4">
            <Package className="text-primary-600" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">
            Hệ thống Quản lý Bưu chính
          </h1>
          <p className="text-primary-100 mt-2">
            Giải pháp quản lý vận đơn hiện đại
          </p>
        </div>

        {/* Auth Content */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <Outlet />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-primary-100 text-sm">
          <p>© 2025 Postal Management System. Phát triển bởi SE100 Team.</p>
        </div>
      </div>
    </div>
  );
};
