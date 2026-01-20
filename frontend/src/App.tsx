import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { Layout, ProtectedRoute, PublicRoute, RoleRoute } from "./components";
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
  PendingPickupsPage,
  CustomerPickupPage,
  LiveTrackingPage,
  OfficeSearchPage,
  MessagesPage,
  AssignDeliveryPage,
  ShipperDeliveryPage,
  ShipperPickupPage,
  DebugLoginPage,
  ConsolidationRouteManagementPage,
  UnifiedRouteManagementPage,
  PackingRequestPage
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
            <Route path="/debug/:phoneNumber" element={<DebugLoginPage />} />
          </Route>

          {/* Public tracking page (no auth required) */}
          <Route path="/track" element={<TrackOrderPage />} />
          <Route path="/offices" element={<OfficeSearchPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/provinces" element={<ProvincesPage />} />
              <Route path="/messages" element={<MessagesPage />} />

              {/* System Admin only */}
              <Route element={<RoleRoute allowedRoles={["SYSTEM_ADMIN"]} />}>
                <Route path="/admin/system" element={<SystemAdminPage />} />
              </Route>

              {/* Hub Admin & System Admin - Route Management (role-based routing) */}
              <Route element={<RoleRoute allowedRoles={["SYSTEM_ADMIN", "HUB_ADMIN"]} />}>
                <Route path="/admin/hub" element={<HubAdminPage />} />
                <Route path="/admin/routes" element={<UnifiedRouteManagementPage />} />
              </Route>

              {/* Province Admin - Consolidation Routes Management (WARD → PROVINCE) */}
              <Route element={<RoleRoute allowedRoles={["SYSTEM_ADMIN", "PO_PROVINCE_ADMIN", "WH_PROVINCE_ADMIN"]} />}>
                <Route path="/admin/consolidation-routes" element={<ConsolidationRouteManagementPage />} />
              </Route>

              {/* Province Admin */}
              <Route element={<RoleRoute allowedRoles={["PO_PROVINCE_ADMIN", "WH_PROVINCE_ADMIN"]} />}>
                <Route path="/admin/province" element={<ProvinceAdminPage />} />
              </Route>

              {/* Ward Manager */}
              <Route element={<RoleRoute allowedRoles={["PO_WARD_MANAGER", "WH_WARD_MANAGER"]} />}>
                <Route path="/admin/ward" element={<WardManagerPage />} />
              </Route>

              {/* Shipper Management (Hub/WH Province/WH Ward/PO Province/PO Ward) */}
              <Route element={<RoleRoute allowedRoles={["HUB_ADMIN", "WH_PROVINCE_ADMIN", "WH_WARD_MANAGER", "PO_PROVINCE_ADMIN", "PO_WARD_MANAGER"]} />}>
                <Route path="/admin/shippers" element={<ShipperManagementPage />} />
              </Route>

              {/* PO Staff Duties (Order Creation) */}
              <Route element={<RoleRoute allowedRoles={["PO_STAFF", "PO_WARD_MANAGER", "PO_PROVINCE_ADMIN"]} />}>
                <Route path="/orders/create" element={<CreateOrderPage />} />
                <Route path="/orders/pending-pickups" element={<PendingPickupsPage />} />
              </Route>

              {/* Order Access (All Staff & Customers) */}
              <Route element={<RoleRoute allowedRoles={["PO_STAFF", "WH_STAFF", "PO_WARD_MANAGER", "WH_WARD_MANAGER", "PO_PROVINCE_ADMIN", "WH_PROVINCE_ADMIN", "HUB_ADMIN", "SYSTEM_ADMIN", "CUSTOMER"]} />}>
                <Route path="/orders" element={<OrderListPage />} />
                <Route path="/orders/:id" element={<OrderDetailsPage />} />
              </Route>

              {/* Staff Duties (Delivery & Transit) */}
              <Route element={<RoleRoute allowedRoles={["PO_STAFF", "WH_STAFF", "PO_WARD_MANAGER", "WH_WARD_MANAGER", "PO_PROVINCE_ADMIN", "WH_PROVINCE_ADMIN", "HUB_ADMIN", "SYSTEM_ADMIN"]} />}>
                <Route path="/orders/delivery" element={<AssignDeliveryPage />} />
                <Route path="/batches" element={<BatchListPage />} />
                <Route path="/batches/:id" element={<BatchDetailsPage />} />
              </Route>

              {/* Warehouse Staff - Packing Requests */}
              <Route element={<RoleRoute allowedRoles={["WH_STAFF"]} />}>
                <Route path="/staff/packing-requests" element={<PackingRequestPage />} />
              </Route>

              {/* Shipper specifics */}
              <Route element={<RoleRoute allowedRoles={["SHIPPER"]} />}>
                <Route path="/shipper/pickups" element={<ShipperPickupPage />} />
                <Route path="/shipper/deliveries" element={<ShipperDeliveryPage />} />
              </Route>

              {/* Customer specifics */}
              <Route element={<RoleRoute allowedRoles={["CUSTOMER"]} />}>
                <Route path="/customer/pickup" element={<CustomerPickupPage />} />
              </Route>
            </Route>
          </Route>

          {/* Public Tracking Route (Outside Protected) */}
          <Route path="/tracking/:orderId/live" element={<LiveTrackingPage />} />

          {/* Fallback route */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
