export interface UserRole {
  role: string;
}

export interface CustomerMeResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phoneNumber: string;
  addressLine1: string;
  wardCode?: string;
  wardName?: string;
  provinceCode?: string;
  provinceName?: string;
  subscriptionPlan: string;
  active: boolean;
}

export interface EmployeeMeResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  fullName: string;
  phoneNumber: string;
  active: boolean;
  office: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    addressLine1: string;
    type: string;
    wardCode?: string;
    wardName?: string;
    region?: {
      id: number;
      name: string;
    };
    province?: {
      code: string;
      name: string;
    };
  };
}

export type MeResponse = CustomerMeResponse | EmployeeMeResponse;
