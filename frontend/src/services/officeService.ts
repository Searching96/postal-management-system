import api from '../lib/axios';

export interface Office {
    officeId: string;
    officeName: string;
    officeEmail: string;
    officePhoneNumber: string;
    officeAddress: string;
    officeType: string;
    provinceCode?: string;
    provinceName?: string;
    regionName?: string;
    parentOfficeId?: string;
    parentOfficeName?: string;
    capacity?: number;
    isAcceptingOrders: boolean;
    workingHours: string;
    isOpen: boolean;
}

export interface OfficeStatusUpdateRequest {
    isAcceptingOrders?: boolean;
    workingHours?: string;
}

export const officeService = {
    // Search offices (public)
    searchOffices: async (search?: string, page = 0, size = 10) => {
        const params = { search, page, size };
        const response = await api.get('/offices', { params });
        return response.data;
    },

    // Get office details
    getOfficeDetails: async (id: string) => {
        const response = await api.get(`/offices/${id}`);
        return response.data;
    },

    // Update status (manager)
    updateStatus: async (id: string, request: OfficeStatusUpdateRequest) => {
        const response = await api.put(`/offices/${id}/status`, request);
        return response.data;
    }
};
