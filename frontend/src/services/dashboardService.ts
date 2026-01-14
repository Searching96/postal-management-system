import api from "../lib/axios";
import type { ApiResponse, RegisterSystemAdminRequest } from "../models";

export const dashboardService = {
  registerAdmin: async (
    data: RegisterSystemAdminRequest
  ): Promise<ApiResponse<void>> => {
    const response = await api.post<ApiResponse<void>>(
      "/dashboard/register-admin",
      data
    );
    return response.data;
  },
};
