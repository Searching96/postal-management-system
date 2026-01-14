import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  RegisterHubAdminRequest,
} from "../models";

export const hubAdminService = {
  registerHubAdmin: async (
    data: RegisterHubAdminRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/hub-admins/register",
      data
    );
    return response.data;
  },
};
