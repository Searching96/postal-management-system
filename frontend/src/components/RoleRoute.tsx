import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";
import { toast } from "sonner";
import { useEffect } from "react";

interface RoleRouteProps {
    allowedRoles: string[];
}

export function RoleRoute({ allowedRoles }: RoleRouteProps) {
    const { user, isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        if (!isLoading && isAuthenticated && user && !allowedRoles.includes(user.role)) {
            toast.error("Bạn không có quyền truy cập trang này", {
                description: "Vui lòng liên hệ quản trị viên nếu bạn tin rằng đây là lỗi."
            });
        }
    }, [isLoading, isAuthenticated, user, allowedRoles]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!user || !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
}
