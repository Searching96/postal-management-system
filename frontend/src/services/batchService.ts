import api from "../lib/axios";
import type { PageResponse } from "../models";

// Simplified order item for batch display
export interface BatchOrderItem {
    orderId: string;
    trackingNumber: string;
    receiverName: string;
    receiverAddressLine1: string;
    receiverWardName: string;
    receiverProvinceName: string;
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
    originOfficeId: string;
    destinations: {
        officeId: string;
        officeName: string;
        province: string;
        unbatchedOrderCount: number;
        totalWeight: number;
        openBatchCount: number;
    }[];
}

export interface CreateBatchRequest {
    destinationOfficeId: string;
    maxWeightKg: number;
    orderIds?: string[];
}

export interface AutoBatchRequest {
    maxWeightPerBatch?: number;
    destinationOfficeId?: string;
}

export interface AddOrdersToBatchRequest {
    batchId: string;
    orderIds: string[];
}

export const batchService = {
    // Batch Creation
    createBatch: async (data: CreateBatchRequest): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>("/batches", data);
        return response.data;
    },

    autoBatchOrders: async (data: AutoBatchRequest): Promise<AutoBatchResultResponse> => {
        const response = await api.post<AutoBatchResultResponse>("/batches/auto-batch", data);
        return response.data;
    },

    // Batch Operations
    addOrdersToBatch: async (data: AddOrdersToBatchRequest): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>("/batches/add-orders", data);
        return response.data;
    },

    removeOrderFromBatch: async (batchId: string, orderId: string): Promise<BatchPackageResponse> => {
        const response = await api.delete<BatchPackageResponse>(`/batches/${batchId}/orders/${orderId}`);
        return response.data;
    },

    sealBatch: async (batchId: string): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>(`/batches/${batchId}/seal`);
        return response.data;
    },

    dispatchBatch: async (batchId: string): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>(`/batches/${batchId}/dispatch`);
        return response.data;
    },

    markBatchArrived: async (batchId: string): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>(`/batches/${batchId}/arrive`);
        return response.data;
    },

    distributeBatch: async (batchId: string): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>(`/batches/${batchId}/distribute`);
        return response.data;
    },

    cancelBatch: async (batchId: string): Promise<BatchPackageResponse> => {
        const response = await api.post<BatchPackageResponse>(`/batches/${batchId}/cancel`);
        return response.data;
    },

    // Batch Queries
    getBatchById: async (batchId: string, includeOrders = false): Promise<BatchPackageResponse> => {
        const response = await api.get<BatchPackageResponse>(`/batches/${batchId}`, {
            params: { includeOrders }
        });
        return response.data;
    },

    getBatchByCode: async (batchCode: string, includeOrders = false): Promise<BatchPackageResponse> => {
        const response = await api.get<BatchPackageResponse>(`/batches/code/${batchCode}`, {
            params: { includeOrders }
        });
        return response.data;
    },

    getBatches: async (params?: {
        status?: string;
        page?: number;
        size?: number
    }): Promise<PageResponse<BatchPackageResponse>> => {
        const response = await api.get<PageResponse<BatchPackageResponse>>("/batches", { params });
        return response.data;
    },

    getIncomingBatches: async (params?: {
        status?: string;
        page?: number;
        size?: number
    }): Promise<PageResponse<BatchPackageResponse>> => {
        const response = await api.get<PageResponse<BatchPackageResponse>>("/batches/incoming", { params });
        return response.data;
    },

    getOpenBatches: async (params?: {
        page?: number;
        size?: number
    }): Promise<PageResponse<BatchPackageResponse>> => {
        const response = await api.get<PageResponse<BatchPackageResponse>>("/batches/open", { params });
        return response.data;
    },

    getDestinationsWithUnbatchedOrders: async (): Promise<BatchableDestinationsResponse> => {
        const response = await api.get<BatchableDestinationsResponse>("/batches/destinations");
        return response.data;
    }
};
