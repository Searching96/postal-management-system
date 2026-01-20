import { OfficeType } from './office';

export interface RouteStop {
    wardCode: string;
    wardOfficeName: string;
    officeName?: string; // Added for visualization
    order: number;
    distanceKm?: number;
}

export interface CapacityInfo {
    maxWeightKg: number;
    maxVolumeCm3?: number;
    maxOrders: number;
}

export interface ProvinceInfo {
    code: string;
    name: string;
}

export interface OfficeInfo {
    id: string;
    name: string;
    code: string;
}

export interface StatusInfo {
    isActive: boolean;
    totalConsolidatedOrders: number;
    lastConsolidationAt?: string;
}

export interface ConsolidationRoute {
    id: string;
    name: string;
    province: ProvinceInfo;
    destinationWarehouse: OfficeInfo;
    routeStops: RouteStop[];
    capacity: CapacityInfo;
    status: StatusInfo;
    createdAt: string;
    updatedAt: string;
}

export interface ConsolidationStatusResponse {
    routeId: string;
    routeName: string;
    pendingOrderCount: number;
    pendingWeightKg: number;
    pendingVolumeCm3?: number;
    canConsolidate: boolean;
    consolidationBlockReason?: string;
    nextConsolidationTime: string;
    lastConsolidation?: {
        timestamp: string;
        ordersConsolidated: number;
        totalWeightKg: number;
    };
}

export interface CreateConsolidationRouteRequest {
    name: string;
    provinceCode: string;
    destinationWarehouseId: string;
    routeStops: RouteStop[];
    maxWeightKg: number;
    maxVolumeCm3?: number;
    maxOrders: number;
    isActive?: boolean;
}

export interface RerouteTarget {
    routeId: string;
    routeName: string;
    level: 'SAME' | 'UPPER';
    capacity?: {
        currentOrderCount: number;
        maxOrders: number;
    };
}

export interface TemporaryReroute {
    sourceRouteId: string;
    targetRouteId: string;
    targetRouteName: string;
    reason: string;
    expectedEndTime: string;
    startTime: string;
}

// Route hierarchy levels
export enum RouteLevel {
    WARD = 'WARD',          // Ward to Province consolidation
    PROVINCE = 'PROVINCE',  // Province to Hub transfer
    HUB = 'HUB',           // Hub to Hub inter-hub
    DIRECT_HUB = 'DIRECT_HUB' // Direct hub connections (high throughput)
}

// Office hierarchy for route visibility
export const OFFICE_LEVEL_HIERARCHY: Record<OfficeType, number> = {
    'SYSTEM_HUB': 4,
    'HUB': 4,
    'PROVINCE_WAREHOUSE': 3,
    'WARD_OFFICE': 2,
    'CUSTOMER_LOCATION': 1,
};

// Determine which route levels a user can VIEW
// Note: Consolidation routes are ONLY WARD → PROVINCE level
// Transfer routes (PROVINCE → HUB, HUB → HUB) are managed via separate TransferRoute API
export function getAccessibleRouteLevels(officeType: OfficeType | undefined): RouteLevel[] {
    if (!officeType) return [];

    switch (officeType) {
        case 'SYSTEM_HUB':
        case 'HUB':
            // HUB can view WARD consolidation routes (for monitoring)
            // They manage PROVINCE/HUB routes via TransferRoute API
            return [RouteLevel.WARD];

        case 'PROVINCE_WAREHOUSE':
            // PROVINCE can view and manage WARD consolidation routes
            return [RouteLevel.WARD];

        case 'WARD_OFFICE':
            // WARD can only see WARD consolidation routes
            return [RouteLevel.WARD];

        default:
            return [];
    }
}

// Determine which route level a user can CREATE (one level below)
// Consolidation routes are WARD → PROVINCE only
// Transfer routes (PROVINCE → HUB, HUB → HUB) are managed separately via TransferRoute API
export function getCreatableRouteLevel(officeType: OfficeType | undefined): RouteLevel | null {
    if (!officeType) return null;

    switch (officeType) {
        case 'PROVINCE_WAREHOUSE':
            // Province warehouse admins can create WARD consolidation routes
            return RouteLevel.WARD;

        // Note: HUB and SYSTEM_HUB manage transfer routes via the Transfer Route API
        // They do NOT create consolidation routes through this interface
        default:
            return null;
    }
}

// Get label for route level
export function getRouteLevelLabel(level: RouteLevel): string {
    const labels: Record<RouteLevel, string> = {
        [RouteLevel.WARD]: 'Tuyến tập kết từ phường',
        [RouteLevel.PROVINCE]: 'Tuyến trung chuyển từ tỉnh',
        [RouteLevel.HUB]: 'Tuyến liên kho',
        [RouteLevel.DIRECT_HUB]: 'Tuyến trực tiếp (cao thông lượng)',
    };
    return labels[level];
}
