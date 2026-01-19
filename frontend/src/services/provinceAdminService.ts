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
  UpdateStaffRequest,
  OfficeResponse,
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
    status: "all" | "assigned" | "unassigned" = "all",
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<WardAssignmentInfo>>> => {
    const params = new URLSearchParams();
    if (provinceCode) params.append("provinceCode", provinceCode);
    params.append("page", page.toString());
    params.append("size", size.toString());
    if (search && search.trim()) params.append("search", search.trim());
    params.append("status", status);
    const response = await api.get<ApiResponse<PageResponse<WardAssignmentInfo>>>(
      `/province-admin/wards/assignment-status?${params.toString()}`,
      { signal }
    );
    return response.data;
  },

  getEmployees: async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<PageResponse<EmployeeResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<EmployeeResponse>>>("/province-admin/employees", { params });
    return response.data;
  },

  getEmployeeById: async (staffId: string): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.get<ApiResponse<EmployeeResponse>>(`/province-admin/employees/${staffId}`);
    return response.data;
  },

  updateEmployee: async (staffId: string, data: UpdateStaffRequest): Promise<ApiResponse<EmployeeResponse>> => {
    const response = await api.put<ApiResponse<EmployeeResponse>>(`/province-admin/employees/${staffId}`, data);
    return response.data;
  },

  deleteEmployee: async (staffId: string): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(`/province-admin/employees/${staffId}`);
    return response.data;
  },

  getWardOfficesByProvince: async (params?: {
    search?: string;
    page?: number;
    size?: number;
  }): Promise<ApiResponse<PageResponse<OfficeResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<OfficeResponse>>>(
      "/province-admin/offices/ward",
      { params }
    );
    return response.data;
  },
};
