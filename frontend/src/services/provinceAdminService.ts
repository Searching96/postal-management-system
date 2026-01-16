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
  PageResponse,
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

  getWardOfficePairs: async (
    signal?: AbortSignal
  ): Promise<ApiResponse<WardOfficePairResponse[]>> => {
    const response = await api.get<ApiResponse<WardOfficePairResponse[]>>(
      "/province-admin/ward-offices",
      { signal }
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

  getWardAssignmentStatusPaginated: async (
    provinceCode?: string,
    page = 0,
    size = 12,
    search?: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<WardAssignmentInfo>>> => {
    const params = new URLSearchParams();
    if (provinceCode) params.append("provinceCode", provinceCode);
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (search && search.trim()) params.append("search", search.trim());
    const response = await api.get<ApiResponse<PageResponse<WardAssignmentInfo>>>(
      `/province-admin/wards/assignment-status?${params.toString()}`,
      { signal }
    );
    return response.data;
  },
};
