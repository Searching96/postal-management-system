import api from "../lib/axios";
import type {
  ApiResponse,
  PageResponse,
  RegionResponse,
  ProvinceResponse,
  WardResponse,
} from "../models";

export const administrativeService = {
  getAllRegions: async (): Promise<ApiResponse<RegionResponse[]>> => {
    const response = await api.get<ApiResponse<RegionResponse[]>>(
      "/administrative/regions"
    );
    return response.data;
  },

  getProvincesByRegion: async (
    regionId: number
  ): Promise<ApiResponse<ProvinceResponse[]>> => {
    const response = await api.get<ApiResponse<ProvinceResponse[]>>(
      `/administrative/regions/${regionId}/provinces`
    );
    return response.data;
  },

  getAllProvinces: async (): Promise<ApiResponse<ProvinceResponse[]>> => {
    const response = await api.get<ApiResponse<ProvinceResponse[]>>(
      "/administrative/provinces"
    );
    return response.data;
  },

  getAllProvincesPaginated: async (
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<ProvinceResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<ProvinceResponse>>>(
      `/administrative/provinces/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },

  getWardsByProvince: async (
    provinceCode: string
  ): Promise<ApiResponse<WardResponse[]>> => {
    const response = await api.get<ApiResponse<WardResponse[]>>(
      `/administrative/provinces/${provinceCode}/wards`
    );
    return response.data;
  },

  getWardsByProvincePaginated: async (
    provinceCode: string,
    page = 0,
    size = 10
  ): Promise<ApiResponse<PageResponse<WardResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<WardResponse>>>(
      `/administrative/provinces/${provinceCode}/wards/paginated?page=${page}&size=${size}`
    );
    return response.data;
  },
};
