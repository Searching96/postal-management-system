import api from "../lib/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  CustomerRegisterRequest,
} from "../models";

export const authService = {
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  register: async (
    data: CustomerRegisterRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>("/auth/register", data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getToken: (): string | null => {
    return localStorage.getItem("token");
  },

  setToken: (token: string): void => {
    localStorage.setItem("token", token);
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem("token");
  },
};
