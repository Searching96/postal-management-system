import api from "../lib/axios";
import type { ApiResponse, PageResponse } from "../models";

export interface Shipper {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    status: "ACTIVE" | "INACTIVE";
    hubId?: string; // If shippers are managed at Hub level
    wardCode?: string; // If shippers belong to a ward
}

export interface CreateShipperRequest {
    fullName: string;
    email?: string;
    phone: string;
    password?: string;
    hubId?: string;
    wardCode?: string;
}

export interface UpdateShipperRequest {
    fullName?: string;
    email?: string;
    phone?: string;
    status?: "ACTIVE" | "INACTIVE";
}

export const shipperService = {
    getShippers: async (params?: { page?: number; size?: number; search?: string }): Promise<ApiResponse<PageResponse<Shipper>>> => {
        // Assuming backend has an endpoint for filtering employees by role SHIPPER
        // or a dedicated /shippers endpoint.
        // Based on previous contexts, likely using /employees with role filter
        const response = await api.get<ApiResponse<PageResponse<Shipper>>>("/employees", {
            params: { ...params, role: "SHIPPER" }
        });
        return response.data;
    },

    getShipperById: async (id: string): Promise<ApiResponse<Shipper>> => {
        const response = await api.get<ApiResponse<Shipper>>(`/employees/${id}`);
        return response.data;
    },

    createShipper: async (data: CreateShipperRequest): Promise<ApiResponse<Shipper>> => {
        const response = await api.post<ApiResponse<Shipper>>("/employees", { ...data, role: "SHIPPER" });
        return response.data;
    },

    updateShipper: async (id: string, data: UpdateShipperRequest): Promise<ApiResponse<Shipper>> => {
        const response = await api.put<ApiResponse<Shipper>>(`/employees/${id}`, data);
        return response.data;
    },

    deleteShipper: async (id: string): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/employees/${id}`);
        return response.data;
    }
};
