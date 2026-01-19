import api from '../lib/axios';

export interface ProvinceOption {
    code: string;
    name: string;
}

export interface WardOption {
    code: string;
    name: string;
    provinceCode: string;
}

export interface OfficeOption {
    id: string;
    name: string;
    code: string;
    type: string;
}

/**
 * Fetch all provinces for route creation
 */
export async function getAllProvinces(): Promise<ProvinceOption[]> {
    try {
        const response = await api.get('/administrative/provinces');
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching provinces:', error);
        return [];
    }
}

/**
 * Fetch all wards by province
 */
export async function getWardsByProvince(provinceCode: string): Promise<WardOption[]> {
    try {
        const response = await api.get(`/administrative/provinces/${provinceCode}/wards`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching wards:', error);
        return [];
    }
}

/**
 * Fetch all offices (for warehouse/destination selection)
 * Can filter by type: SYSTEM_HUB, HUB, PROVINCE_WAREHOUSE, WARD_OFFICE
 */
export async function getOffices(type?: string): Promise<OfficeOption[]> {
    try {
        const response = await api.get('/offices');

        // Handle paginated response
        let offices = response.data.content || response.data || [];

        // Filter by type if specified
        if (type) {
            offices = offices.filter((office: any) => office.officeType === type);
        }

        // Map to OfficeOption format
        return offices.map((office: any) => ({
            id: office.officeId,
            name: office.officeName,
            code: office.officeType,
            type: office.officeType,
        }));
    } catch (error) {
        console.error('Error fetching offices:', error);
        return [];
    }
}

/**
 * Fetch all province warehouses
 */
export async function getProvinceWarehouses(): Promise<OfficeOption[]> {
    return getOffices('PROVINCE_WAREHOUSE');
}

/**
 * Fetch all hub warehouses
 */
export async function getHubWarehouses(): Promise<OfficeOption[]> {
    const response = await getOffices('HUB');
    const systemHubs = await getOffices('SYSTEM_HUB');
    return [...response, ...systemHubs];
}

/**
 * Fetch all ward offices
 */
export async function getWardOffices(): Promise<OfficeOption[]> {
    return getOffices('WARD_OFFICE');
}

/**
 * Fetch ward offices by province
 */
export async function getWardOfficesByProvince(provinceCode: string): Promise<OfficeOption[]> {
    try {
        const response = await api.get(`/administrative/provinces/${provinceCode}/post-offices`);
        return response.data.data || [];
    } catch (error) {
        console.error('Error fetching ward offices:', error);
        return [];
    }
}

// Export as object for convenience
export const officeDataService = {
    getAllProvinces,
    getWardsByProvince,
    getOffices,
    getProvinceWarehouses,
    getHubWarehouses,
    getWardOffices,
    getWardOfficesByProvince,
};
