import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { EmployeeMeResponse } from '../../models/user';
import { ConsolidationRouteManagementPage } from './ConsolidationRouteManagementPage';
import { RouteManagementPage as TransferRouteManagementPage } from './RouteManagementPage';

/**
 * Smart router that displays role-based route management pages.
 *
 * - PROVINCE_ADMIN/WH_PROVINCE_ADMIN: Consolidation routes (WARD → PROVINCE)
 * - HUB_ADMIN: Transfer routes (PROVINCE → HUB only)
 * - SYSTEM_ADMIN: Transfer routes (HUB → HUB only)
 * - Others: No access
 */
export function UnifiedRouteManagementPage() {
    const { user: currentUser } = useAuth();

    if (!currentUser || !('office' in currentUser)) {
        return (
            <div className="p-6 text-center text-gray-500">
                Vui lòng đăng nhập với tài khoản nhân viên
            </div>
        );
    }

    const userRole = currentUser.role;
    const employeeUser = currentUser as EmployeeMeResponse;

    // Province-level managers: manage consolidation routes (WARD → PROVINCE)
    if (userRole === 'PO_PROVINCE_ADMIN' || userRole === 'WH_PROVINCE_ADMIN') {
        return <ConsolidationRouteManagementPage />;
    }

    // Hub admin: manage PROVINCE_TO_HUB transfer routes
    if (userRole === 'HUB_ADMIN') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tuyến Trung Chuyển</h1>
                        <p className="text-gray-600 mt-1">
                            Tuyến từ tỉnh lên hub • Cơ sở: {employeeUser.office?.name}
                        </p>
                    </div>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-900">
                        <strong>Tuyến Trung Chuyển:</strong> Quản lý tuyến từ tỉnh lên hub.
                        Dùng để định tuyến đơn hàng từ kho tỉnh đến hub khu vực.
                    </p>
                </div>
                <TransferRouteManagementPage filterRouteType="PROVINCE_TO_HUB" />
            </div>
        );
    }

    // System admin: manage HUB_TO_HUB transfer routes
    if (userRole === 'SYSTEM_ADMIN') {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tuyến Liên Kho</h1>
                        <p className="text-gray-600 mt-1">
                            Tuyến giữa các hub • Cơ sở: {employeeUser.office?.name}
                        </p>
                    </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                        <strong>Tuyến Liên Kho:</strong> Quản lý tuyến giữa các hub.
                        Bao gồm tuyến thường (HUB_TO_HUB) và tuyến trực tiếp (DIRECT_HUB) cho thông lượng cao.
                    </p>
                </div>
                <TransferRouteManagementPage filterRouteType="HUB_TO_HUB" />
            </div>
        );
    }

    // Ward-level and other roles: no access
    return (
        <div className="p-6 max-w-md mx-auto">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-red-900 mb-2">Truy cập bị từ chối</h3>
                <p className="text-red-700">
                    Bạn không có quyền quản lý tuyến đường. Chỉ quản lý viên cấp tỉnh, hub hoặc hệ thống mới có thể truy cập.
                </p>
            </div>
        </div>
    );
}
