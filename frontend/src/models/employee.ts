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
