import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  RegisterHubAdminRequest,
  PageResponse,
  OfficeResponse,
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

  getProvinceOffices: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<OfficeResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<OfficeResponse>>>(
      "/hub-admins/province-offices",
      { params }
    );
    return response.data;
  },
};
