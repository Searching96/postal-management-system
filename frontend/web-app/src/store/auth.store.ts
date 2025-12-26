import { create } from "zustand";
import { User } from "@/models";
import { AuthService } from "@/services";

interface AuthState {
  user: Omit<User, "passwordHash"> | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (username: string, password: string) => {
    set({ isLoading: true });
    try {
      const response = await AuthService.login(username, password);
      set({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
      // Store token in localStorage
      localStorage.setItem("auth_token", response.token);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await AuthService.logout();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
  },

  checkAuth: () => {
    const token = localStorage.getItem("auth_token");
    const userStr = localStorage.getItem("auth_user");

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      } catch (error) {
        // Clear invalid data
        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
      }
    }
  },
}));
