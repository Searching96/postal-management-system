import api from "../lib/axios";
import type { ApiResponse } from "../models";

export interface UploadResponse {
    avatarUrl?: string;
    evidenceUrl?: string;
    attachmentUrl?: string;
    evidenceType?: string;
    category?: string;
}

export const uploadService = {
    uploadAvatar: async (file: File): Promise<ApiResponse<UploadResponse>> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await api.post<ApiResponse<UploadResponse>>("/uploads/avatar", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    },

    uploadEvidence: async (
        orderId: string,
        evidenceType: "pickup" | "delivery",
        file: File
    ): Promise<ApiResponse<UploadResponse>> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", evidenceType);

        const response = await api.post<ApiResponse<UploadResponse>>(
            `/uploads/orders/${orderId}/evidence`,
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            }
        );
        return response.data;
    },

    uploadAttachment: async (category: string, file: File): Promise<ApiResponse<UploadResponse>> => {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("category", category);

        const response = await api.post<ApiResponse<UploadResponse>>("/uploads/attachments", formData, {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        });
        return response.data;
    }
};
