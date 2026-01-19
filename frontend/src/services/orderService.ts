import api from "../lib/axios";
import type { PageResponse, ApiResponse } from "../models";

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
    status: "CREATED" | "ACCEPTED" | "PENDING_PICKUP" | "PICKED_UP" | "AT_ORIGIN_OFFICE" | "SORTED_AT_ORIGIN" | "IN_TRANSIT_TO_HUB" | "AT_HUB" | "IN_TRANSIT_FROM_HUB" | "IN_TRANSIT_TO_DESTINATION" | "AT_DESTINATION_HUB" | "IN_TRANSIT_TO_OFFICE" | "AT_DESTINATION_OFFICE" | "OUT_FOR_DELIVERY" | "DELIVERED" | "DELIVERY_FAILED" | "CANCELLED" | "RETURNED" | "RETURNING" | "ON_HOLD" | "LOST" | "DAMAGED";
    totalAmount: number;
    totalFee?: number;
    weightKg: number;
    acceptedAt?: string;
    deliveryProofUrl?: string;
    signatureData?: string;
    deliveryLocation?: string;
    serviceType: string;
    deliveryInstructions?: string;
    shippingFee: number;
    insuranceFee: number;
    codAmount: number;
    declaredValue?: number;
    currentOfficeName?: string;
    createdByEmployeeName?: string;
    assignedShipperName?: string;
    statusHistory?: any[];
    dimensions?: string;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    packageType?: string;
    packageDescription?: string;
    createdAt: string;
    updatedAt: string;
}


export interface ServiceOption {
    serviceType: string;
    serviceName: string;
    shippingFee: number;
    totalAmount: number;
    estimatedDeliveryDays: number;
    estimatedDeliveryDate?: string;
    slaDescription?: string;
}

export interface PriceCalculationResponse {
    actualWeightKg: number;
    volumetricWeightKg: number;
    chargeableWeightKg: number;
    originProvinceName: string;
    destinationProvinceName: string;
    destinationWardName: string;
    sameProvince: boolean;
    sameRegion: boolean;
    baseShippingFee: number;
    weightSurcharge: number;
    packageTypeSurcharge: number;
    distanceSurcharge: number;
    subscriptionDiscount: number;
    shippingFee: number;
    insuranceFee: number;
    totalAmount: number;
    serviceType: string;
    estimatedDeliveryDays: number;
    estimatedDeliveryDate?: string;
    slaDescription?: string;
    availableServices: ServiceOption[];
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
    declaredValue?: number;
    codAmount?: number;
    addInsurance?: boolean;
}

export interface PriceCalculationRequest {
    originWardCode?: string;
    destinationWardCode: string;
    packageType?: string;
    weightKg: number;
    lengthCm?: number;
    widthCm?: number;
    heightCm?: number;
    serviceType?: string;
    declaredValue?: number;
    addInsurance?: boolean;
}

export interface AssignShipperRequest {
    orderId: string;
    shipperId: string;
}

export interface ReceiveIncomingRequest {
    orderIds: string[];
}

export interface AssignDeliveryRequest {
    shipperId: string;
    orderIds: string[];
}

export interface DeliveryAttemptRequest {
    note?: string;
    proofImageUrl?: string;
    signatureData?: string;
    location?: string;
}

export interface GroupOrderResponse {
    successCount: number;
    failureCount: number;
    orders: Order[];
    message: string;
}

export interface PaginationParams {
    page?: number;
    size?: number;
    status?: string;
    search?: string;
}

export const orderService = {
    getOrders: async (params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders", { params });
        return response.data;
    },

    getOrderById: async (id: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/${id}`);
        return response.data;
    },

    getOrderByTrackingNumber: async (trackingNumber: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/tracking/${trackingNumber}`);
        return response.data;
    },

    createOrder: async (data: CreateOrderRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders", data);
        return response.data;
    },

    calculatePrice: async (data: PriceCalculationRequest): Promise<PriceCalculationResponse> => {
        const response = await api.post<PriceCalculationResponse>("/orders/calculate-price", data);
        return response.data;
    },

    // Customer methods
    getOrdersByCustomerId: async (customerId: string, params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>(`/orders/customer/${customerId}`, { params });
        return response.data;
    },

    createCustomerPickupOrder: async (data: CreateOrderRequest): Promise<Order> => {
        const response = await api.post<Order>("/orders/customer/pickup", data);
        return response.data;
    },

    // Staff/Pickup methods
    getPendingPickupOrders: async (params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders/pending-pickups", { params });
        return response.data;
    },

    assignShipperToPickup: async (data: AssignShipperRequest): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>("/orders/assign-shipper", data);
        return response.data;
    },

    // Shipper methods
    getShipperAssignedOrders: async (params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders/shipper/assigned", { params });
        return response.data;
    },

    getShipperDeliveryOrders: async (params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>("/orders/shipper/deliveries", { params });
        return response.data;
    },

    markOrderPickedUp: async (orderId: string): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/pickup`);
        return response.data;
    },

    acceptOrder: async (orderId: string): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/accept`);
        return response.data;
    },

    // Public/Track
    trackOrder: async (trackingNumber: string): Promise<Order> => {
        const response = await api.get<Order>(`/orders/track/${trackingNumber}`);
        return response.data;
    },

    getOrdersBySenderPhone: async (phone: string, params?: PaginationParams): Promise<PageResponse<Order>> => {
        const response = await api.get<PageResponse<Order>>(`/orders/by-phone/${phone}`, { params });
        return response.data;
    },

    // New: Ingest & Last Mile
    receiveIncomingOrders: async (data: ReceiveIncomingRequest): Promise<GroupOrderResponse> => {
        const response = await api.post<GroupOrderResponse>("/orders/receive-incoming", data);
        return response.data;
    },

    assignOrdersToShipper: async (data: AssignDeliveryRequest): Promise<GroupOrderResponse> => {
        const response = await api.post<GroupOrderResponse>("/orders/assign-delivery", data);
        return response.data;
    },

    markOrderDelivered: async (orderId: string): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/deliver`);
        return response.data;
    },

    markOrderDeliveryFailed: async (orderId: string, note: string): Promise<ApiResponse<Order>> => {
        const response = await api.post<ApiResponse<Order>>(`/orders/${orderId}/fail-delivery`, null, {
            params: { note }
        });
        return response.data;
    }
};
