import api from "../lib/axios";
import type { ApiResponse, PageResponse } from "../models";

// Helper to ensure Order type is available. 
// If `../models` already exports Order, this might conflict or substitute. 
// Given the previous file check, it was defined inline. I'll define it fully here.

export interface Order {
    orderId: string; // Changed from id to orderId
    id?: string; // Optional fallback
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    status: "CREATED" | "PENDING_PICKUP" | "PICKED_UP" | "IN_TRANSIT_TO_HUB" | "AT_HUB" | "IN_TRANSIT_FROM_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
    totalAmount: number; // Changed from totalFee
    totalFee?: number; // Fallback
    weightKg: number;
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
    }): Promise<PageResponse<Order>> => {
        // Backend returns PageResponse directly, not wrapped in ApiResponse
        const response = await api.get<PageResponse<Order>>("/orders", { params });
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
    },

    // Customer methods
    getOrdersByCustomerId: async (customerId: string, params?: any): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>(`/orders/customer/${customerId}`, { params });
        return response.data;
    },

    createCustomerPickupOrder: async (data: any): Promise<Order> => { // Returns Order directly? Check controller.
        // Controller returns OrderResponse directly or wrapped?
        // Controller: return ResponseEntity.status(HttpStatus.CREATED).body(response); (OrderResponse)
        const response = await api.post<Order>("/orders/customer/pickup", data);
        return response.data;
    },

    // Staff/Pickup methods
    getPendingPickupOrders: async (params?: any): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders/pending-pickups", { params });
        return response.data;
    },

    assignShipperToPickup: async (data: any): Promise<Order> => {
        const response = await api.post<Order>("/orders/assign-shipper", data);
        return response.data;
    },

    // Shipper methods
    getShipperAssignedOrders: async (params?: any): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders/shipper/assigned", { params });
        return response.data;
    },

    markOrderPickedUp: async (orderId: string): Promise<Order> => {
        const response = await api.post<Order>(`/orders/${orderId}/pickup`);
        return response.data;
    },

    // Public/Track
    trackOrder: async (trackingNumber: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/track/${trackingNumber}`);
        return response.data;
    },

    getOrdersBySenderPhone: async (phone: string, params?: any): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>(`/orders/by-phone/${phone}`, { params });
        return response.data;
    }
};
