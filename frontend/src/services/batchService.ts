import api from "../lib/axios";
import type { ApiResponse, PageResponse } from "../models";

// Simplified order item for batch display
export interface BatchOrderItem {
    orderId: string;
    trackingNumber: string;
    receiverName: string;
    receiverAddress: string;
    status: string;
    weightKg: number;
}

export interface BatchPackageResponse {
    id: string;
    batchCode: string;
    status: "OPEN" | "PROCESSING" | "SEALED" | "IN_TRANSIT" | "ARRIVED" | "DISTRIBUTED" | "CANCELLED";
    originOfficeId: string;
    originOfficeName: string;
    destinationOfficeId: string;
    destinationOfficeName: string;
    totalWeight: number;
    orderCount: number;
    createdAt: string;
    updatedAt: string;
    orders?: BatchOrderItem[];
}

export interface AutoBatchResultResponse {
    batchesCreated: number;
    ordersProcessed: number;
    batches: BatchPackageResponse[];
}

export interface BatchableDestinationsResponse {
    destinations: {
        officeId: string;
        officeName: string;
        orderCount: number;
        totalWeight: number;
    }[];
}

export interface CreateBatchRequest {
    destinationOfficeId: string;
    orderIds?: string[];
}

export interface AutoBatchRequest {
    maxWeightKg?: number;
    destinationOfficeId?: string;
}

export interface AddOrdersToBatchRequest {
    batchId: string;
    orderIds: string[];
}

export const batchService = {
    // Batch Creation
    createBatch: async (data: CreateBatchRequest): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>("/batches", data);
        return response.data;
    },

    autoBatchOrders: async (data: AutoBatchRequest): Promise<ApiResponse<AutoBatchResultResponse>> => {
        const response = await api.post<ApiResponse<AutoBatchResultResponse>>("/batches/auto-batch", data);
        return response.data;
    },

    // Batch Operations
    addOrdersToBatch: async (data: AddOrdersToBatchRequest): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>("/batches/add-orders", data);
        return response.data;
    },

    removeOrderFromBatch: async (batchId: string, orderId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.delete<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/orders/${orderId}`);
        return response.data;
    },

    sealBatch: async (batchId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/seal`);
        return response.data;
    },

    dispatchBatch: async (batchId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/dispatch`);
        return response.data;
    },

    markBatchArrived: async (batchId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/arrive`);
        return response.data;
    },

    distributeBatch: async (batchId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/distribute`);
        return response.data;
    },

    cancelBatch: async (batchId: string): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.post<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}/cancel`);
        return response.data;
    },

    // Batch Queries
    getBatchById: async (batchId: string, includeOrders = false): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.get<ApiResponse<BatchPackageResponse>>(`/batches/${batchId}`, {
            params: { includeOrders }
        });
        return response.data;
    },

    getBatchByCode: async (batchCode: string, includeOrders = false): Promise<ApiResponse<BatchPackageResponse>> => {
        const response = await api.get<ApiResponse<BatchPackageResponse>>(`/batches/code/${batchCode}`, {
            params: { includeOrders }
        });
        return response.data;
    },

    getBatches: async (params?: {
        status?: string;
        page?: number;
        size?: number
    }): Promise<ApiResponse<PageResponse<BatchPackageResponse>>> => {
        const response = await api.get<ApiResponse<PageResponse<BatchPackageResponse>>>("/batches", { params });
        return response.data;
    },

    getIncomingBatches: async (params?: {
        status?: string;
        page?: number;
        size?: number
    }): Promise<ApiResponse<PageResponse<BatchPackageResponse>>> => {
        const response = await api.get<ApiResponse<PageResponse<BatchPackageResponse>>>("/batches/incoming", { params });
        return response.data;
    },

    getOpenBatches: async (params?: {
        page?: number;
        size?: number
    }): Promise<ApiResponse<PageResponse<BatchPackageResponse>>> => {
        const response = await api.get<ApiResponse<PageResponse<BatchPackageResponse>>>("/batches/open", { params });
        return response.data;
    },

    getDestinationsWithUnbatchedOrders: async (): Promise<ApiResponse<BatchableDestinationsResponse>> => {
        const response = await api.get<ApiResponse<BatchableDestinationsResponse>>("/batches/destinations");
        return response.data;
    }
};
