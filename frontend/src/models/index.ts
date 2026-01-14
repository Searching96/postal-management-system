// API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errorCode?: string;
  timestamp: string;
}

// Paginated response
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Auth
export interface LoginRequest {
  username: string;
  password: string;
}

export interface CustomerRegisterRequest {
  fullName: string;
  username: string;
  password: string;
  email: string;
  address: string;
}

export interface AuthResponse {
  token: string;
}

// Administrative
export interface ProvinceResponse {
  code: string;
  name: string;
  administrativeRegionName: string;
}

export interface WardResponse {
  code: string;
  name: string;
  provinceName: string;
}

// User
export interface UserRole {
  role: string;
}

export interface CustomerMeResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  address: string;
  subscriptionPlan: string;
  role: string;
}

export interface EmployeeMeResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  officeName: string;
  officeType: string;
}

export type MeResponse = CustomerMeResponse | EmployeeMeResponse;

// Employee management
export interface EmployeeResponse {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  role: string;
  officeName: string;
  officeType: string;
}

export interface RegisterHubAdminRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  regionId: number;
}

export interface CreateProvinceAdminRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  officeId: string;
}

export interface CreateWardManagerRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  officeId: string;
}

export interface CreateStaffRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  officeId: string;
}

export interface RegisterSystemAdminRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

// Ward Office
export interface WardOfficePairResponse {
  officePairId: string;
  wardPostId: string;
  wardPostName: string;
  wardWarehouseId: string;
  wardWarehouseName: string;
  provinceName: string;
  wards: WardResponse[];
}

export interface CreateWardOfficeRequest {
  postOfficeName: string;
  warehouseName: string;
  address: string;
  provinceCode: string;
}

export interface AssignWardsRequest {
  officePairId: string;
  wardCodes: string[];
}

export interface WardAssignmentInfo {
  wardCode: string;
  wardName: string;
  assigned: boolean;
  officePairId?: string;
  wardPostName?: string;
}

// Ward Manager Employee
export interface CreateWardStaffRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}

export interface CreateWardManagerEmployeeRequest {
  fullName: string;
  phone: string;
  email: string;
  password: string;
}
