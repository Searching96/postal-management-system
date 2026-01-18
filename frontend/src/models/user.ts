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
  address: string;
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
    address: string;
    type: string;
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
