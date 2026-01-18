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
