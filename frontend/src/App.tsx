import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { Layout, ProtectedRoute, PublicRoute } from "./components";
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProvincesPage,
  ProfilePage,
  SystemAdminPage,
  HubAdminPage,
  ProvinceAdminPage,
  WardManagerPage,
  OrderListPage,
  CreateOrderPage,
  OrderDetailsPage,
  TrackOrderPage,
  BatchListPage,
  BatchDetailsPage,
  ShipperManagementPage,
  ShipperDashboardPage,
  PendingPickupsPage,
  CustomerPickupPage,
} from "./pages";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Public tracking page (no auth required) */}
          <Route path="/track" element={<TrackOrderPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/provinces" element={<ProvincesPage />} />
              <Route path="/admin/system" element={<SystemAdminPage />} />
              <Route path="/admin/hub" element={<HubAdminPage />} />
              <Route path="/admin/province" element={<ProvinceAdminPage />} />
              <Route path="/admin/ward" element={<WardManagerPage />} />

              {/* Order Management */}
              <Route path="/orders" element={<OrderListPage />} />
              <Route path="/orders/create" element={<CreateOrderPage />} />
              <Route path="/orders/:id" element={<OrderDetailsPage />} />

              {/* Batch Management */}
              <Route path="/batches" element={<BatchListPage />} />
              <Route path="/batches/:id" element={<BatchDetailsPage />} />

              {/* Shipper */}
              <Route path="/shipper" element={<ShipperDashboardPage />} />
              <Route path="/orders/pending-pickups" element={<PendingPickupsPage />} />
              <Route path="/customer/pickup" element={<CustomerPickupPage />} />

              {/* Other Admin */}
              <Route path="/admin/shippers" element={<ShipperManagementPage />} />
            </Route>
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
