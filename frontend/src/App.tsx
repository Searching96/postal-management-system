import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./lib/AuthContext";
import { Layout, ProtectedRoute, PublicRoute } from "./components";
import {
  LoginPage,
  RegisterPage,
  DashboardPage,
  ProvincesPage,
  SystemAdminPage,
  HubAdminPage,
  ProvinceAdminPage,
  WardManagerPage,
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

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/provinces" element={<ProvincesPage />} />
              <Route path="/admin/system" element={<SystemAdminPage />} />
              <Route path="/admin/hub" element={<HubAdminPage />} />
              <Route path="/admin/province" element={<ProvinceAdminPage />} />
              <Route path="/admin/ward" element={<WardManagerPage />} />
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
