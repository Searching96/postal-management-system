import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store";
import { DashboardLayout, AuthLayout } from "./layouts";
import {
  LoginPage,
  DashboardPage,
  CreateOrderPage,
  OrderListPage,
  ParcelReceptionPage,
  ManifestManagementPage,
  DeliveryRouteManagementPage,
  ComplaintManagementPage,
  CODReconciliationPage,
  PricingConfigurationPage,
} from "./pages";

const App: React.FC = () => {
  const { checkAuth } = useAuthStore();

  // Check authentication on mount
  React.useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<DashboardPage />} />

          {/* ADMIN Routes */}
          <Route
            path="/users"
            element={<PlaceholderPage title="Quản lý người dùng" />}
          />
          <Route path="/pricing" element={<PricingConfigurationPage />} />
          <Route
            path="/reports"
            element={<PlaceholderPage title="Tất cả báo cáo" />}
          />

          {/* MANAGER Routes */}
          <Route
            path="/reports/organization"
            element={<PlaceholderPage title="Báo cáo bưu cục" />}
          />
          <Route
            path="/staff"
            element={<PlaceholderPage title="Quản lý nhân viên" />}
          />
          <Route path="/complaints" element={<ComplaintManagementPage />} />
          <Route
            path="/organization"
            element={<PlaceholderPage title="Thông tin bưu cục" />}
          />

          {/* CLERK Routes */}
          <Route path="/orders" element={<OrderListPage />} />
          <Route path="/orders/create" element={<CreateOrderPage />} />
          <Route path="/reception/create" element={<ParcelReceptionPage />} />
          <Route
            path="/complaints/create"
            element={<PlaceholderPage title="Tiếp nhận khiếu nại" />}
          />

          {/* WAREHOUSE Routes */}
          <Route
            path="/scan/package"
            element={<PlaceholderPage title="Quét mã vận đơn" />}
          />
          <Route
            path="/scan/manifest"
            element={<PlaceholderPage title="Quét mã bảng kê" />}
          />
          <Route path="/manifest/create" element={<ManifestManagementPage />} />
          <Route
            path="/warehouse/manifests"
            element={<ManifestManagementPage />}
          />

          {/* DISPATCHER Routes */}
          <Route
            path="/delivery-routes"
            element={<DeliveryRouteManagementPage />}
          />

          {/* ACCOUNTANT Routes */}
          <Route
            path="/cod-reconciliation"
            element={<CODReconciliationPage />}
          />
          <Route
            path="/debt"
            element={<PlaceholderPage title="Quản lý công nợ" />}
          />
          <Route
            path="/reports/financial"
            element={<PlaceholderPage title="Báo cáo tài chính" />}
          />
        </Route>

        {/* 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

// Placeholder component for unimplemented pages
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="text-center py-16">
    <h1 className="text-3xl font-bold text-secondary-900 mb-4">{title}</h1>
    <p className="text-secondary-600">Chức năng đang được phát triển</p>
  </div>
);

export default App;
