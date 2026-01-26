import api from "../lib/axios";
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  CustomerRegisterRequest,
} from "../models";
import { STORAGE_KEYS } from "../constants";

/**
 * Authentication service
 * Handles login, registration, and token management
 */
export const authService = {
  /**
   * Authenticate user with username and password
   */
  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      data
    );
    return response.data;
  },

  /**
   * Register new customer account
   */
  register: async (
    data: CustomerRegisterRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>("/auth/register", data);
    return response.data;
  },

  /**
   * Clear authentication token and log out user
   */
  logout: (): void => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Get current authentication token
   */
  getToken: (): string | null => {
    return localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Store authentication token
   */
  setToken: (token: string): void => {
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  },
};
