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
