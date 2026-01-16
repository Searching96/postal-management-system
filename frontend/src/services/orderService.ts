import api from "../lib/axios";
import type { ApiResponse, PageResponse } from "../models";

// Helper to ensure Order type is available. 
// If `../models` already exports Order, this might conflict or substitute. 
// Given the previous file check, it was defined inline. I'll define it fully here.

export interface Order {
    id: string;
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    receiverName: string;
    receiverPhone: string;
    status: "PENDING" | "ACCEPTED" | "SHIPPING" | "DELIVERING" | "COMPLETED" | "CANCELLED" | "RETURNED";
    totalFee: number;
    weight: number;
    createdAt: string;
    updatedAt: string;
    // Add more fields as needed based on backend
}

export const orderService = {
    getOrders: async (params?: {
        page?: number;
        size?: number;
        status?: string;
        search?: string
    }): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>("/orders", { params });
        return response.data;
    },

    getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
        const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (data: any): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders", data);
        return response.data;
    },

    calculatePrice: async (data: any): Promise<ApiResponse<any>> => {
        const response = await api.post<ApiResponse<any>>("/orders/calculate-price", data);
        return response.data;
    },

    // Additional methods that might be useful
    updateStatus: async (id: string, status: string): Promise<ApiResponse<Order>> => {
        // This endpoint might vary based on implementation (e.g. /orders/{id}/status)
        const response = await api.put<ApiResponse<Order>>(`/orders/${id}/status`, { status });
        return response.data;
    }
};
