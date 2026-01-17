import api from "../lib/axios";
import type { ApiResponse, PageResponse, EmployeeResponse, UpdateStaffRequest } from "../models";

export interface CreateShipperRequest {
    fullName: string;
    email: string;
    phoneNumber: string;
    password: string;
    officeId: string;
}

// Office info returned from ward-office pairs
interface OfficeInfo {
    officeId: string;
    name: string;
    type?: string;
}

// Ward office pair response
interface WardOfficePair {
    warehouse: OfficeInfo;
    wardOffice?: OfficeInfo;
}

export const shipperService = {
    getShippers: async (params?: {
        page?: number;
        size?: number;
        search?: string
    }): Promise<ApiResponse<PageResponse<EmployeeResponse>>> => {
        const response = await api.get<ApiResponse<PageResponse<EmployeeResponse>>>("/shippers", { params });
        return response.data;
    },

    getShipperById: async (shipperId: string): Promise<ApiResponse<EmployeeResponse>> => {
        const response = await api.get<ApiResponse<EmployeeResponse>>(`/shippers/${shipperId}`);
        return response.data;
    },

    createShipper: async (data: CreateShipperRequest): Promise<ApiResponse<EmployeeResponse>> => {
        const response = await api.post<ApiResponse<EmployeeResponse>>("/shippers", data);
        return response.data;
    },

    updateShipper: async (shipperId: string, data: UpdateStaffRequest): Promise<ApiResponse<EmployeeResponse>> => {
        const response = await api.put<ApiResponse<EmployeeResponse>>(`/shippers/${shipperId}`, data);
        return response.data;
    },

    deleteShipper: async (shipperId: string): Promise<ApiResponse<void>> => {
        const response = await api.delete<ApiResponse<void>>(`/shippers/${shipperId}`);
        return response.data;
    },

    getAvailableOffices: async (): Promise<ApiResponse<OfficeInfo[]>> => {
        // Fetch warehouses from ward office pairs - shippers work at warehouses
        const response = await api.get<ApiResponse<WardOfficePair[]>>("/province-admin/ward-offices");
        // Extract warehouse offices from the pairs
        const pairs = response.data.data || [];
        const offices = pairs.map((pair) => pair.warehouse);
        return { ...response.data, data: offices };
    }
};
