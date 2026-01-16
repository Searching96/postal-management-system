import api from "../lib/axios";
import type {
  ApiResponse,
  PageResponse,
  RegionResponse,
  ProvinceResponse,
  WardResponse,
} from "../models";

export const administrativeService = {
  getAllRegions: async (signal?: AbortSignal): Promise<ApiResponse<RegionResponse[]>> => {
    const response = await api.get<ApiResponse<RegionResponse[]>>(
      "/administrative/regions",
      { signal }
    );
    return response.data;
  },

  getProvincesByRegion: async (
    regionId: number,
    signal?: AbortSignal
  ): Promise<ApiResponse<ProvinceResponse[]>> => {
    const response = await api.get<ApiResponse<ProvinceResponse[]>>(
      `/administrative/regions/${regionId}/provinces`,
      { signal }
    );
    return response.data;
  },

  getAllProvinces: async (signal?: AbortSignal): Promise<ApiResponse<ProvinceResponse[]>> => {
    const response = await api.get<ApiResponse<ProvinceResponse[]>>(
      "/administrative/provinces",
      { signal }
    );
    return response.data;
  },

  getAllProvincesPaginated: async (
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<ProvinceResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<ProvinceResponse>>>(
      `/administrative/provinces/paginated?page=${page}&size=${size}`,
      { signal }
    );
    return response.data;
  },

  getWardsByProvince: async (
    provinceCode: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<WardResponse[]>> => {
    const response = await api.get<ApiResponse<WardResponse[]>>(
      `/administrative/provinces/${provinceCode}/wards`,
      { signal }
    );
    return response.data;
  },

  getWardsByProvincePaginated: async (
    provinceCode: string,
    page = 0,
    size = 10,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<WardResponse>>> => {
    const response = await api.get<ApiResponse<PageResponse<WardResponse>>>(
      `/administrative/provinces/${provinceCode}/wards/paginated?page=${page}&size=${size}`,
      { signal }
    );
    return response.data;
  },
};
