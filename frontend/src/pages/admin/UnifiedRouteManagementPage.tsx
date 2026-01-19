import React, { useState, useEffect } from 'react';
import { AlertCircle, Loader2, RefreshCw, Tabs } from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { EmployeeMeResponse } from '../../models/user';
import { ConsolidationRouteManagementPage } from './ConsolidationRouteManagementPage';
import { RouteManagementPage as TransferRouteManagementPage } from './RouteManagementPage';

type RouteTab = 'consolidation' | 'transfer-province' | 'transfer-hub';

export function UnifiedRouteManagementPage() {
    const { user: currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState<RouteTab>('consolidation');
    const [loading, setLoading] = useState(false);

    if (!currentUser || !('office' in currentUser)) {
        return (
            <div className="p-6 text-center text-gray-500">
                Vui lòng đăng nhập với tài khoản nhân viên
            </div>
        );
    }

    const employeeUser = currentUser as EmployeeMeResponse;
    const userRole = currentUser.role;
    const isProvinceAdmin = userRole === 'PO_PROVINCE_ADMIN' || userRole === 'WH_PROVINCE_ADMIN';
    const isHubAdmin = userRole === 'HUB_ADMIN' || userRole === 'SYSTEM_ADMIN';
    const isWardManager = userRole === 'PO_WARD_MANAGER' || userRole === 'WH_WARD_MANAGER';

    // Determine which tabs are accessible
    const canViewConsolidation = isProvinceAdmin || isWardManager || isHubAdmin || userRole === 'SYSTEM_ADMIN';
    const canViewTransfer = isHubAdmin || userRole === 'SYSTEM_ADMIN';

    // Auto-select first available tab
    useEffect(() => {
        if (!canViewConsolidation && activeTab === 'consolidation') {
            setActiveTab('transfer-province');
        } else if (!canViewTransfer && (activeTab === 'transfer-province' || activeTab === 'transfer-hub')) {
            setActiveTab('consolidation');
        }
    }, [canViewConsolidation, canViewTransfer, activeTab]);

    const tabs: Array<{
        id: RouteTab;
        label: string;
        icon: string;
        visible: boolean;
        description: string;
    }> = [
        {
            id: 'consolidation',
            label: 'Tuyến Tập Kết',
            icon: '📦',
            visible: canViewConsolidation,
            description: 'Tuyến từ phường lên tỉnh (WARD → PROVINCE)',
        },
        {
            id: 'transfer-province',
            label: 'Tuyến Trung Chuyển',
            icon: '🚚',
            visible: canViewTransfer,
            description: 'Tuyến từ tỉnh lên hub (PROVINCE → HUB)',
        },
        {
            id: 'transfer-hub',
            label: 'Tuyến Liên Kho',
            icon: '🔄',
            visible: canViewTransfer,
            description: 'Tuyến giữa các hub (HUB → HUB / DIRECT)',
        },
    ];

    const visibleTabs = tabs.filter((t) => t.visible);

    if (visibleTabs.length === 0) {
        return (
            <div className="p-6 text-center text-gray-500">
                Bạn không có quyền quản lý tuyến đường
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Quản Lý Tuyến Đường</h1>
                    <p className="text-gray-600 mt-1">
                        Cơ sở: {employeeUser.office?.name} ({userRole})
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="flex border-b border-gray-200 overflow-x-auto">
                    {visibleTabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`px-6 py-4 font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                                activeTab === tab.id
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 border-b-2 border-transparent'
                            }`}
                            title={tab.description}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="p-6">
                    {activeTab === 'consolidation' && canViewConsolidation && (
                        <div>
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm text-blue-900">
                                    <strong>Tuyến Tập Kết:</strong> Quản lý tuyến từ phường lên tỉnh.
                                    Cấp tỉnh tạo tuyến này, cấp phường xem được để gán đơn hàng.
                                </p>
                            </div>
                            <ConsolidationRouteManagementPage />
                        </div>
                    )}

                    {activeTab === 'transfer-province' && canViewTransfer && (
                        <div>
                            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-sm text-amber-900">
                                    <strong>Tuyến Trung Chuyển:</strong> Quản lý tuyến từ tỉnh lên hub.
                                    Dùng để định tuyến đơn hàng từ kho tỉnh đến hub khu vực.
                                </p>
                            </div>
                            <TransferRouteManagementPage filterRouteType="PROVINCE_TO_HUB" />
                        </div>
                    )}

                    {activeTab === 'transfer-hub' && canViewTransfer && (
                        <div>
                            <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                                <p className="text-sm text-green-900">
                                    <strong>Tuyến Liên Kho:</strong> Quản lý tuyến giữa các hub.
                                    Bao gồm tuyến thường (HUB_TO_HUB) và tuyến trực tiếp (DIRECT_HUB) cho thông lượng cao.
                                </p>
                            </div>
                            <TransferRouteManagementPage filterRouteType="HUB_TO_HUB" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
