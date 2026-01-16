import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  CreateWardStaffRequest,
  CreateWardManagerEmployeeRequest,
  PageResponse,
} from "../models";

export const wardManagerService = {
  createStaff: async (
    data: CreateWardStaffRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/ward-manager/employees/staff",
      data
    );
    return response.data;
  },

  createWardManager: async (
    data: CreateWardManagerEmployeeRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/ward-manager/employees/ward-manager",
      data
    );
    return response.data;
  },

  getEmployees: async (params?: { page?: number; size?: number }): Promise<ApiResponse<PageResponse<EmployeeResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployeeResponse>>>("/ward-manager/employees", { params });
    return response.data;
  }
};
