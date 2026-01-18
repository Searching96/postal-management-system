import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  CreateWardStaffRequest,
  CreateWardManagerEmployeeRequest,
  PageResponse,
  UpdateStaffRequest,
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

  getEmployees: async (params?: {
    page?: number;
    size?: number;
    search?: string;
  }): Promise<ApiResponse<PageResponse<EmployeeResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployeeResponse>>>("/ward-manager/employees", { params });
    return response.data;
  },

  getEmployeeById: async (staffId: string): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.get<ApiResponse<EmployeeResponse>>(`/ward-manager/employees/${staffId}`);
    return response.data;
  },

  updateEmployee: async (staffId: string, data: UpdateStaffRequest): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.put<ApiResponse<EmployeeResponse>>(`/ward-manager/employees/${staffId}`, data);
    return response.data;
  },

  deleteEmployee: async (staffId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/ward-manager/employees/${staffId}`);
    return response.data;
  },
};
