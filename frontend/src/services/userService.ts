import api from "../lib/axios";
import type { ApiResponse, MeResponse } from "../models";

export const userService = {
  fetchMe: async (): Promise<ApiResponse<MeResponse>> => {
    const response = await api.get<ApiResponse<MeResponse>>("/users/me");
    return response.data;
  },
};
