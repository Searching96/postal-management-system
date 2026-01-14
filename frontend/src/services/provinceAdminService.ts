import api from "../lib/axios";
import type {
  ApiResponse,
  EmployeeResponse,
  CreateProvinceAdminRequest,
  CreateWardManagerRequest,
  CreateStaffRequest,
  WardOfficePairResponse,
  CreateWardOfficeRequest,
  AssignWardsRequest,
  WardAssignmentInfo,
} from "../models";

export const provinceAdminService = {
  createProvinceAdmin: async (
    data: CreateProvinceAdminRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/province-admin/employees/province-admin",
      data
    );
    return response.data;
  },

  createWardManager: async (
    data: CreateWardManagerRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/province-admin/employees/ward-manager",
      data
    );
    return response.data;
  },

  createStaff: async (
    data: CreateStaffRequest
  ): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.post<ApiResponse<EmployeeResponse>>(
      "/province-admin/employees/staff",
      data
    );
    return response.data;
  },

  createWardOfficePair: async (
    data: CreateWardOfficeRequest
  ): Promise<ApiResponse<WardOfficePairResponse>> => {
    const response = await api.post<ApiResponse<WardOfficePairResponse>>(
      "/province-admin/ward-offices",
      data
    );
    return response.data;
  },

  assignWardsToOfficePair: async (
    data: AssignWardsRequest
  ): Promise<ApiResponse<WardOfficePairResponse>> => {
    const response = await api.post<ApiResponse<WardOfficePairResponse>>(
      "/province-admin/ward-offices/assign-wards",
      data
    );
    return response.data;
  },

  getWardOfficePairs: async (): Promise<
    ApiResponse<WardOfficePairResponse[]>
  > => {
    const response = await api.get<ApiResponse<WardOfficePairResponse[]>>(
      "/province-admin/ward-offices"
    );
    return response.data;
  },

  getWardOfficePairById: async (
    officePairId: string
  ): Promise<ApiResponse<WardOfficePairResponse>> => {
    const response = await api.get<ApiResponse<WardOfficePairResponse>>(
      `/province-admin/ward-offices/${officePairId}`
    );
    return response.data;
  },

  getWardAssignmentStatus: async (
    provinceCode?: string
  ): Promise<ApiResponse<WardAssignmentInfo[]>> => {
    const params = provinceCode ? `?provinceCode=${provinceCode}` : "";
    const response = await api.get<ApiResponse<WardAssignmentInfo[]>>(
      `/province-admin/wards/assignment-status${params}`
    );
    return response.data;
  },
};
