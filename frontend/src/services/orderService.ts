import api from "../lib/axios";
import type { ApiResponse, PageResponse } from "../models";

export interface Order {
    orderId: string;
    id?: string;
    trackingNumber: string;
    senderName: string;
    senderPhone: string;
    senderAddress: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    status: "CREATED" | "PENDING_PICKUP" | "PICKED_UP" | "IN_TRANSIT_TO_HUB" | "AT_HUB" | "IN_TRANSIT_FROM_HUB" | "OUT_FOR_DELIVERY" | "DELIVERED" | "CANCELLED" | "RETURNED";
    totalAmount: number;
    totalFee?: number;
    weightKg: number;
    createdAt: string;
    updatedAt: string;
}

export interface PriceCalculationResponse {
    basePrice: number;
    distancePrice: number;
    weightPrice: number;
    totalPrice: number;
    discountPercent: number;
    discountedPrice: number;
    estimatedDeliveryDays: number;
}

// Request interfaces
export interface CreateOrderRequest {
    senderName: string;
    senderPhone: string;
    senderAddress?: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress?: string;
    destinationWardCode: string;
    weightKg: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    packageType?: string;
    serviceType: string;
    description?: string;
    insuranceRequested?: boolean;
    insuranceValue?: number;
}

export interface PriceCalculationRequest {
    originWardCode?: string;
    destinationWardCode: string;
    weightKg: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    insuranceValue?: number;
}

export interface AssignShipperRequest {
    orderId: string;
    shipperId: string;
}

export interface PaginationParams {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
}

export const orderService = {
    getOrders: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>("/orders", { params });
        return response.data;
    },

    getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
        const response = await api.get<ApiResponse<Order>>(`/orders/${id}`);
        return response.data;
    },

    createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders", data);
        return response.data;
    },

    calculatePrice: async (data: PriceCalculationRequest): Promise<ApiResponse<PriceCalculationResponse>> => {
        const response = await api.post<ApiResponse<PriceCalculationResponse>>("/orders/calculate-price", data);
        return response.data;
    },

    // Customer methods
    getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>(`/orders/customer/${customerId}`, { params });
        return response.data;
    },

    createCustomerPickupOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders/customer/pickup", data);
        return response.data;
    },

    // Staff/Pickup methods
    getPendingPickupOrders: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>("/orders/pending-pickups", { params });
        return response.data;
    },

    assignShipperToPickup: async (data: AssignShipperRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders/assign-shipper", data);
        return response.data;
    },

    // Shipper methods
    getShipperAssignedOrders: async (params?: PaginationParams): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>("/orders/shipper/assigned", { params });
        return response.data;
    },

    markOrderPickedUp: async (orderId: string): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/pickup`);
        return response.data;
    },

    // Public/Track
    trackOrder: async (trackingNumber: string): Promise<ApiResponse<Order>> => {
        const response = await api.get<ApiResponse<Order>>(`/orders/track/${trackingNumber}`);
        return response.data;
    },

    getOrdersBySenderPhone: async (phone: string, params?: PaginationParams): Promise<ApiResponse<PageResponse<Order>>> => {
        const response = await api.get<ApiResponse<PageResponse<Order>>>(`/orders/by-phone/${phone}`, { params });
        return response.data;
    }
};
