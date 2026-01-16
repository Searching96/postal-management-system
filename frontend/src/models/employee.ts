export interface EmployeeResponse {
  employeeId: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  role: string;
  officeName: string;
}

export interface RegisterHubAdminRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  regionId: number;
}

export interface CreateProvinceAdminRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface CreateWardManagerRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  officeId: string;
}

export interface CreateStaffRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
  officeId: string;
}

export interface RegisterSystemAdminRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface CreateWardStaffRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface CreateWardManagerEmployeeRequest {
  fullName: string;
  phoneNumber: string;
  email: string;
  password: string;
}

export interface UpdateStaffRequest {
  fullName?: string;
  phoneNumber?: string;
  email?: string;
  active?: boolean;
}
