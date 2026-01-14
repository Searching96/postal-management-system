import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  CreateWardStaffRequest,
  CreateWardManagerEmployeeRequest,
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
};
