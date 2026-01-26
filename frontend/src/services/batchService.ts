import api from "../lib/axios";
import type { PageResponse } from "../models";
import { BatchStatus } from "../constants/batchStatus";

/**
 * Simplified order item for batch display
 */
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

/**
 * Batch package response interface
 */
export interface BatchPackageResponse {
  id: string;
  batchCode: string;
  status: BatchStatus;
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

/**
 * Auto batch result response
 */
export interface AutoBatchResultResponse {
  batchesCreated: number;
  ordersProcessed: number;
  batches: BatchPackageResponse[];
}

/**
 * Batchable destinations response
 */
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

/**
 * Create batch request
 */
export interface CreateBatchRequest {
  destinationOfficeId: string;
  maxWeightKg: number;
  orderIds?: string[];
}

/**
 * Auto batch request
 */
export interface AutoBatchRequest {
  maxWeightPerBatch?: number;
  destinationOfficeId?: string;
}

/**
 * Add orders to batch request
 */
export interface AddOrdersToBatchRequest {
  batchId: string;
  orderIds: string[];
}

/**
 * Batch service
 * Handles batch creation, operations, and queries
 */
export const batchService = {
  /**
   * Create a new batch
   */
  createBatch: async (
    data: CreateBatchRequest
  ): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>("/batches", data);
    return response.data;
  },

  /**
   * Automatically create batches from unbatched orders
   */
  autoBatchOrders: async (
    data: AutoBatchRequest
  ): Promise<AutoBatchResultResponse> => {
    const response = await api.post<AutoBatchResultResponse>(
      "/batches/auto-batch",
      data
    );
    return response.data;
  },

  /**
   * Add orders to an existing batch
   */
  addOrdersToBatch: async (
    data: AddOrdersToBatchRequest
  ): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      "/batches/add-orders",
      data
    );
    return response.data;
  },

  /**
   * Remove an order from a batch
   */
  removeOrderFromBatch: async (
    batchId: string,
    orderId: string
  ): Promise<BatchPackageResponse> => {
    const response = await api.delete<BatchPackageResponse>(
      `/batches/${batchId}/orders/${orderId}`
    );
    return response.data;
  },

  /**
   * Seal a batch to prevent further modifications
   */
  sealBatch: async (batchId: string): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      `/batches/${batchId}/seal`
    );
    return response.data;
  },

  /**
   * Dispatch a batch for transit
   */
  dispatchBatch: async (batchId: string): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      `/batches/${batchId}/dispatch`
    );
    return response.data;
  },

  /**
   * Mark batch as arrived at destination
   */
  markBatchArrived: async (batchId: string): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      `/batches/${batchId}/arrive`
    );
    return response.data;
  },

  /**
   * Distribute batch orders at destination office
   */
  distributeBatch: async (batchId: string): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      `/batches/${batchId}/distribute`
    );
    return response.data;
  },

  /**
   * Cancel a batch
   */
  cancelBatch: async (batchId: string): Promise<BatchPackageResponse> => {
    const response = await api.post<BatchPackageResponse>(
      `/batches/${batchId}/cancel`
    );
    return response.data;
  },

  /**
   * Get batch by ID
   */
  getBatchById: async (
    batchId: string,
    includeOrders = false
  ): Promise<BatchPackageResponse> => {
    const response = await api.get<BatchPackageResponse>(
      `/batches/${batchId}`,
      {
        params: { includeOrders },
      }
    );
    return response.data;
  },

  /**
   * Get batch by code
   */
  getBatchByCode: async (
    batchCode: string,
    includeOrders = false
  ): Promise<BatchPackageResponse> => {
    const response = await api.get<BatchPackageResponse>(
      `/batches/code/${batchCode}`,
      {
        params: { includeOrders },
      }
    );
    return response.data;
  },

  /**
   * Get batches with pagination and filtering
   */
  getBatches: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<BatchPackageResponse>> => {
    const response = await api.get<PageResponse<BatchPackageResponse>>(
      "/batches",
      { params }
    );
    return response.data;
  },

  /**
   * Get incoming batches (batches arriving at current office)
   */
  getIncomingBatches: async (params?: {
    status?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<BatchPackageResponse>> => {
    const response = await api.get<PageResponse<BatchPackageResponse>>(
      "/batches/incoming",
      { params }
    );
    return response.data;
  },

  /**
   * Get open batches (batches that can still receive orders)
   */
  getOpenBatches: async (params?: {
    page?: number;
    size?: number;
  }): Promise<PageResponse<BatchPackageResponse>> => {
    const response = await api.get<PageResponse<BatchPackageResponse>>(
      "/batches/open",
      { params }
    );
    return response.data;
  },

  /**
   * Get destinations with unbatched orders
   */
  getDestinationsWithUnbatchedOrders:
    async (): Promise<BatchableDestinationsResponse> => {
      const response = await api.get<BatchableDestinationsResponse>(
        "/batches/destinations"
      );
      return response.data;
    },
};
