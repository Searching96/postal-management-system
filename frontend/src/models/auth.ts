export interface LoginRequest {
  username: string;
  password: string;
}

export interface CustomerRegisterRequest {
  fullName: string;
  username: string;
  password: string;
  email: string;
  addressLine1: string;
  wardCode: string;
  provinceCode: string;
}

export interface AuthResponse {
  token: string;
}
