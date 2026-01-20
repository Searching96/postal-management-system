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
    regionName?: string;
    parentOfficeId?: string;
    wardCode?: string;
    provinceCode?: string;
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
        const params: any = { size: 1000 };
        if (type) {
            params.type = type;
        }

        const response = await api.get('/offices', { params });

        // Handle paginated response
        const offices = response.data.content || response.data || [];

        // Map to OfficeOption format
        return offices.map((office: any) => ({
            id: office.officeId,
            name: office.officeName,
            code: office.officeType,
            type: office.officeType,
            regionName: office.regionName,
            parentOfficeId: office.parentOfficeId,
            wardCode: office.wardCode,
            provinceCode: office.provinceCode,
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
 * Only returns WARD_POST type offices (ward-level post offices) that have ward codes assigned
 * Excludes PROVINCE_POST (province-level warehouses) as they are destinations, not stops
 */
export async function getWardOfficesByProvince(provinceCode: string): Promise<OfficeOption[]> {
    try {
        console.log(`[getWardOfficesByProvince] Fetching for province: ${provinceCode}`);
        const response = await api.get(`/administrative/provinces/${provinceCode}/post-offices`);
        const offices = response.data.data || [];
        console.log(`[getWardOfficesByProvince] Raw API response (${offices.length} offices):`, offices);

        // Filter and map to OfficeOption format
        const filteredOffices = offices
            .filter((office: any) => {
                const isWardPost = office.officeType === 'WARD_POST';
                const hasWardCode = !!office.wardCode;
                console.log(`[getWardOfficesByProvince] Office ${office.officeName}:`, {
                    officeType: office.officeType,
                    isWardPost,
                    wardCode: office.wardCode,
                    hasWardCode,
                    willInclude: isWardPost && hasWardCode
                });
                // Only include ward-level post offices (WARD_POST)
                // Exclude PROVINCE_POST (those are destination warehouses, not route stops)
                // Also require a valid wardCode since consolidation routes need it
                return isWardPost && hasWardCode;
            })
            .map((office: any) => ({
                id: office.officeId,
                name: office.officeName,
                code: office.wardCode || office.officeId,
                type: office.officeType,
                regionName: office.regionName,
                parentOfficeId: office.parentOfficeId,
                wardCode: office.wardCode,
                provinceCode: office.provinceCode,
            }));

        console.log(`[getWardOfficesByProvince] Filtered offices (${filteredOffices.length}):`, filteredOffices);

        // Log warning if offices were filtered out due to missing ward codes
        const excludedCount = offices.filter((o: any) => o.officeType === 'WARD_POST' && !o.wardCode).length;
        if (excludedCount > 0) {
            console.warn(`${excludedCount} WARD_POST office(s) excluded due to missing wardCode in province ${provinceCode}`);
        }

        return filteredOffices;
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
