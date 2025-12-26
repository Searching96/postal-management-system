import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store";

/**
 * Home Component - Role-based Dashboard Redirect
 * Redirects users to their appropriate dashboard based on role
 */
export const Home: React.FC = () => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role-based redirect logic
  const roleRedirectMap: Record<string, string> = {
    ADMIN: "/admin/dashboard",
    MANAGER: "/manager/dashboard",
    CLERK: "/reception/create",
    WAREHOUSE: "/warehouse/dashboard",
    COURIER: "/courier/my-route",
    DISPATCHER: "/delivery-routes",
    ACCOUNTANT: "/cod-reconciliation",
  };

  const redirectPath = roleRedirectMap[user.role] || "/manager/dashboard";

  return <Navigate to={redirectPath} replace />;
};
