/**
 * User role constants
 * Centralized enum for user roles across the application
 */
export enum UserRole {
  SYSTEM_ADMIN = "SYSTEM_ADMIN",
  HUB_ADMIN = "HUB_ADMIN",
  PO_PROVINCE_ADMIN = "PO_PROVINCE_ADMIN",
  WH_PROVINCE_ADMIN = "WH_PROVINCE_ADMIN",
  PROVINCE_ADMIN = "PROVINCE_ADMIN",
  PO_WARD_MANAGER = "PO_WARD_MANAGER",
  WH_WARD_MANAGER = "WH_WARD_MANAGER",
  WARD_MANAGER = "WARD_MANAGER",
  PO_STAFF = "PO_STAFF",
  WH_STAFF = "WH_STAFF",
  STAFF = "STAFF",
  SHIPPER = "SHIPPER",
  CUSTOMER = "CUSTOMER",
}

/**
 * Office type constants
 */
export enum OfficeType {
  SYSTEM_HUB = "SYSTEM_HUB",
  PROVINCE_WAREHOUSE = "PROVINCE_WAREHOUSE",
  PROVINCE_POST = "PROVINCE_POST",
  WARD_WAREHOUSE = "WARD_WAREHOUSE",
  WARD_POST = "WARD_POST",
}

/**
 * Service type constants
 */
export enum ServiceType {
  EXPRESS = "EXPRESS",
  STANDARD = "STANDARD",
  ECONOMY = "ECONOMY",
}

/**
 * Package type constants
 */
export enum PackageType {
  BOX = "BOX",
  ENVELOPE = "ENVELOPE",
  TUBE = "TUBE",
  PALLET = "PALLET",
}

/**
 * Get display label for user role
 */
export const getRoleLabel = (role: UserRole | string): string => {
  const labels: Record<UserRole, string> = {
    [UserRole.SYSTEM_ADMIN]: "Quản trị hệ thống",
    [UserRole.HUB_ADMIN]: "Quản trị Hub",
    [UserRole.PO_PROVINCE_ADMIN]: "Quản trị Tỉnh (BC)",
    [UserRole.WH_PROVINCE_ADMIN]: "Quản trị Tỉnh (Kho)",
    [UserRole.PROVINCE_ADMIN]: "Quản trị Tỉnh",
    [UserRole.PO_WARD_MANAGER]: "Quản lý Xã (BC)",
    [UserRole.WH_WARD_MANAGER]: "Quản lý Xã (Kho)",
    [UserRole.WARD_MANAGER]: "Quản lý Xã",
    [UserRole.PO_STAFF]: "Giao dịch viên",
    [UserRole.WH_STAFF]: "Nhân viên Kho",
    [UserRole.STAFF]: "Nhân viên",
    [UserRole.SHIPPER]: "Bưu tá",
    [UserRole.CUSTOMER]: "Khách hàng",
  };

  return labels[role as UserRole] || role;
};

/**
 * Get display label for office type
 */
export const getOfficeTypeLabel = (type: OfficeType | string): string => {
  const labels: Record<OfficeType, string> = {
    [OfficeType.SYSTEM_HUB]: "Trung tâm Hệ thống",
    [OfficeType.PROVINCE_WAREHOUSE]: "Kho cấp Tỉnh",
    [OfficeType.PROVINCE_POST]: "Bưu cục cấp Tỉnh",
    [OfficeType.WARD_WAREHOUSE]: "Kho cấp Xã/Phường",
    [OfficeType.WARD_POST]: "Bưu cục cấp Xã/Phường",
  };

  return labels[type as OfficeType] || type;
};

/**
 * Check if role is a Post Office role
 */
export const isPostOfficeRole = (role: UserRole | string): boolean => {
  return role.startsWith("PO_");
};

/**
 * Check if role is a Warehouse role
 */
export const isWarehouseRole = (role: UserRole | string): boolean => {
  return role.startsWith("WH_");
};

/**
 * Check if role is an admin role
 */
export const isAdminRole = (role: UserRole | string): boolean => {
  return [
    UserRole.SYSTEM_ADMIN,
    UserRole.HUB_ADMIN,
    UserRole.PO_PROVINCE_ADMIN,
    UserRole.WH_PROVINCE_ADMIN,
    UserRole.PROVINCE_ADMIN,
  ].includes(role as UserRole);
};

/**
 * Check if role is a manager role
 */
export const isManagerRole = (role: UserRole | string): boolean => {
  return [
    UserRole.PO_WARD_MANAGER,
    UserRole.WH_WARD_MANAGER,
    UserRole.WARD_MANAGER,
  ].includes(role as UserRole);
};
