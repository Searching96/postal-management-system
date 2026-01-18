import api from '../lib/axios';
import { ApiResponse, PageResponse } from '../models';

export interface MessageResponse {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    content: string;
    sentAt: string;
    isRead: boolean;
    isMe: boolean;
}

export interface ContactResponse {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
    unitName?: string;
    unreadCount: number;
    lastMessage: string;
    sentAt: string;
}

export interface SendMessageRequest {
    receiverId?: string;
    receiverPhone?: string;
    content: string;
}

export const messageService = {
    sendMessage: async (data: SendMessageRequest): Promise<ApiResponse<MessageResponse>> => {
        const response = await api.post('/messages/send', data);
        return response.data;
    },

    getConversation: async (userId: string, page = 0, size = 20): Promise<ApiResponse<PageResponse<MessageResponse>>> => {
        const response = await api.get(`/messages/history/${userId}`, {
            params: { page, size }
        });
        return response.data;
    },

    getRecentContacts: async (limit = 10): Promise<ApiResponse<ContactResponse[]>> => {
        const response = await api.get('/messages/contacts', {
            params: { limit }
        });
        return response.data;
    },

    searchUsers: async (query: string): Promise<ApiResponse<ContactResponse[]>> => {
        const response = await api.get('/messages/search', {
            params: { query }
        });
        return response.data;
    },

    async getUnitEmployees(): Promise<ApiResponse<ContactResponse[]>> {
        const response = await api.get('/messages/unit');
        return response.data;
    },

    markAsRead: async (userId: string): Promise<ApiResponse<void>> => {
        const response = await api.post(`/messages/read/${userId}`);
        return response.data;
    }
};
