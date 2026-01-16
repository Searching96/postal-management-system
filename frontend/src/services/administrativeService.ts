import api from "../lib/axios";
import type {
  ApiResponse,
  PageResponse,
  RegionResponse,
  ProvinceResponse,
  WardResponse,
  OfficeResponse,
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
    search?: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<ProvinceResponse>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await api.get<ApiResponse<PageResponse<ProvinceResponse>>>(
      `/administrative/provinces/paginated?${params.toString()}`,
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
    search?: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<PageResponse<WardResponse>>> => {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (search && search.trim()) {
      params.append('search', search.trim());
    }

    const response = await api.get<ApiResponse<PageResponse<WardResponse>>>(
      `/administrative/provinces/${provinceCode}/wards/paginated?${params.toString()}`,
      { signal }
    );
    return response.data;
  },

  getPostOfficesByProvince: async (
    provinceCode: string,
    signal?: AbortSignal
  ): Promise<ApiResponse<OfficeResponse[]>> => {
    const response = await api.get<ApiResponse<OfficeResponse[]>>(
      `/administrative/provinces/${provinceCode}/post-offices`,
      { signal }
    );
    return response.data;
  },
};