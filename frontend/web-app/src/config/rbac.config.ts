import { UserRole } from "@/models";

export interface RoleConfig {
  label: string;
  access: string[];
}

export const RBAC_CONFIG: Record<UserRole, RoleConfig> = {
  [UserRole.ADMIN]: {
    label: "Quản trị viên",
    access: [
      "Bảng điều khiển Admin",
      "Quản lý người dùng",
      "Thiết lập bảng giá",
      "Tất cả báo cáo",
    ],
  },
  [UserRole.MANAGER]: {
    label: "Quản lý Bưu cục",
    access: [
      "Bảng điều khiển Bưu cục",
      "Báo cáo bưu cục",
      "Quản lý nhân viên",
      "Quản lý khiếu nại",
      "Thông tin bưu cục",
    ],
  },
  [UserRole.CLERK]: {
    label: "Giao dịch viên",
    access: [
      "Bảng điều khiển Giao dịch",
      "Quản lý vận đơn",
      "Tiếp nhận khiếu nại",
      "Thông tin bưu cục",
    ],
  },
  [UserRole.WAREHOUSE]: {
    label: "Nhân viên Kho/Khai thác",
    access: [
      "Bảng điều khiển Kho",
      "Quét mã vận đơn",
      "Quét mã bảng kê",
      "Lập bảng kê",
    ],
  },
  [UserRole.DISPATCHER]: {
    label: "Điều phối viên",
    access: ["Quản lý tuyến giao hàng"],
  },
  [UserRole.ACCOUNTANT]: {
    label: "Kế toán",
    access: ["Đối soát COD", "Quản lý công nợ", "Báo cáo tài chính"],
  },
  [UserRole.COURIER]: {
    label: "Nhân viên giao hàng",
    access: ["Tuyến giao hàng của tôi", "Lịch sử giao hàng"],
  },
};

// Navigation items mapped to permissions
export interface NavItem {
  label: string;
  path: string;
  icon: string;
  permission: string;
}

export const NAVIGATION_ITEMS: NavItem[] = [
  // Dashboard navigation items (always first)
  {
    label: "Bảng điều khiển",
    path: "/admin/dashboard",
    icon: "Home",
    permission: "Bảng điều khiển Admin",
  },
  {
    label: "Bảng điều khiển",
    path: "/manager/dashboard",
    icon: "Home",
    permission: "Bảng điều khiển Bưu cục",
  },
  {
    label: "Bảng điều khiển",
    path: "/clerk/dashboard",
    icon: "Home",
    permission: "Bảng điều khiển Giao dịch",
  },
  {
    label: "Bảng điều khiển",
    path: "/warehouse/dashboard",
    icon: "Home",
    permission: "Bảng điều khiển Kho",
  },
  // ADMIN permissions
  {
    label: "Quản lý người dùng",
    path: "/users",
    icon: "Users",
    permission: "Quản lý người dùng",
  },
  {
    label: "Thiết lập bảng giá",
    path: "/pricing",
    icon: "DollarSign",
    permission: "Thiết lập bảng giá",
  },
  {
    label: "Tất cả báo cáo",
    path: "/reports",
    icon: "BarChart",
    permission: "Tất cả báo cáo",
  },
  // MANAGER permissions
  {
    label: "Báo cáo bưu cục",
    path: "/reports/organization",
    icon: "FileText",
    permission: "Báo cáo bưu cục",
  },
  {
    label: "Quản lý nhân viên",
    path: "/staff",
    icon: "UserCheck",
    permission: "Quản lý nhân viên",
  },
  {
    label: "Quản lý khiếu nại",
    path: "/complaints",
    icon: "AlertCircle",
    permission: "Quản lý khiếu nại",
  },
  {
    label: "Thông tin bưu cục",
    path: "/organization",
    icon: "Building",
    permission: "Thông tin bưu cục",
  },
  // CLERK permissions
  {
    label: "Quản lý vận đơn",
    path: "/orders",
    icon: "Package",
    permission: "Quản lý vận đơn",
  },
  {
    label: "Tiếp nhận khiếu nại",
    path: "/complaints/create",
    icon: "MessageSquare",
    permission: "Tiếp nhận khiếu nại",
  },
  // WAREHOUSE permissions
  {
    label: "Quét mã vận đơn",
    path: "/scan/package",
    icon: "QrCode",
    permission: "Quét mã vận đơn",
  },
  {
    label: "Quét mã bảng kê",
    path: "/scan/manifest",
    icon: "Scan",
    permission: "Quét mã bảng kê",
  },
  {
    label: "Lập bảng kê",
    path: "/manifest/create",
    icon: "ClipboardList",
    permission: "Lập bảng kê",
  },
  // DISPATCHER permissions
  {
    label: "Quản lý tuyến giao hàng",
    path: "/delivery-routes",
    icon: "Truck",
    permission: "Quản lý tuyến giao hàng",
  },
  // ACCOUNTANT permissions
  {
    label: "Đối soát COD",
    path: "/cod-reconciliation",
    icon: "Calculator",
    permission: "Đối soát COD",
  },
  {
    label: "Quản lý công nợ",
    path: "/debt",
    icon: "CreditCard",
    permission: "Quản lý công nợ",
  },
  {
    label: "Báo cáo tài chính",
    path: "/reports/financial",
    icon: "TrendingUp",
    permission: "Báo cáo tài chính",
  },
  // COURIER permissions
  {
    label: "Tuyến giao hàng của tôi",
    path: "/courier/my-route",
    icon: "Truck",
    permission: "Tuyến giao hàng của tôi",
  },
  {
    label: "Lịch sử giao hàng",
    path: "/courier/history",
    icon: "FileText",
    permission: "Lịch sử giao hàng",
  },
];

/**
 * Check if a user has access to a specific permission
 */
export const hasPermission = (
  userRole: UserRole,
  permission: string
): boolean => {
  const roleConfig = RBAC_CONFIG[userRole];
  if (!roleConfig) return false;
  return roleConfig.access.includes(permission);
};

/**
 * Get filtered navigation items based on user role
 */
export const getNavigationForRole = (userRole: UserRole): NavItem[] => {
  const roleConfig = RBAC_CONFIG[userRole];
  if (!roleConfig) return [];

  return NAVIGATION_ITEMS.filter((item) =>
    roleConfig.access.includes(item.permission)
  );
};
