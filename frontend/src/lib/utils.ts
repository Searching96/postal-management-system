export const getRoleLabel = (role: string): string => {
    const roles: Record<string, string> = {
        SYSTEM_ADMIN: "Quản trị hệ thống",
        HUB_ADMIN: "Quản trị Hub",
        PO_PROVINCE_ADMIN: "Quản trị Tỉnh (BC)",
        WH_PROVINCE_ADMIN: "Quản trị Tỉnh (Kho)",
        PROVINCE_ADMIN: "Quản trị Tỉnh",
        PO_WARD_MANAGER: "Quản lý Xã (BC)",
        WH_WARD_MANAGER: "Quản lý Xã (Kho)",
        WARD_MANAGER: "Quản lý Xã",
        STAFF: "Nhân viên",
        CUSTOMER: "Khách hàng",
    };

    return roles[role] || role;
};

export const getOfficeTypeLabel = (type: string): string => {
    const types: Record<string, string> = {
        SYSTEM_HUB: "Trung tâm Hệ thống",
        PROVINCE_WAREHOUSE: "Kho cấp Tỉnh",
        PROVINCE_POST: "Bưu cục cấp Tỉnh",
        WARD_WAREHOUSE: "Kho cấp Xã/Phường",
        WARD_POST: "Bưu cục cấp Xã/Phường",
    };

    return types[type] || type;
};
