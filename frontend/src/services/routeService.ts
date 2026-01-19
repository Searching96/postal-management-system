import api from '../lib/axios';

export type RouteType = 'PROVINCE_TO_HUB' | 'HUB_TO_HUB';

export interface TransferRoute {
    id: string;
    fromHubId: string;
    fromHubName: string;
    fromRegionName: string | null;
    toHubId: string;
    toHubName: string;
    toRegionName: string | null;
    distanceKm: number | null;
    transitHours: number | null;
    priority: number;
    isActive: boolean;
    activeDisruption: DisruptionInfo | null;
    routeType?: RouteType;
}

export interface DisruptionInfo {
    disruptionId: string;
    type: DisruptionType;
    reason: string | null;
    startTime: string;
    expectedEndTime: string | null;
    affectedBatchCount: number;
    affectedOrderCount: number;
}

export type DisruptionType =
    | 'ROAD_BLOCKED'
    | 'POLICY_CHANGE'
    | 'EMERGENCY'
    | 'MAINTENANCE'
    | 'OTHER';

export interface DisableRouteRequest {
    disruptionType: DisruptionType;
    reason?: string;
    expectedEndTime?: string;
}

export interface ReroutingImpact {
    routeId: string;
    routeDescription: string;
    affectedBatchCount: number;
    affectedOrderCount: number;
    hasAlternativeRoute: boolean;
    alternativeRouteDescription: string | null;
    additionalHours: number | null;
    affectedBatches: AffectedBatchSummary[];
}

export interface AffectedBatchSummary {
    batchId: string;
    batchCode: string;
    status: string;
    orderCount: number;
    currentLocation: string;
    destination: string;
    canReroute: boolean;
}

export interface DisruptionResponse {
    id: string;
    routeId: string;
    routeDescription: string;
    disruptionType: DisruptionType;
    reason: string | null;
    startTime: string;
    expectedEndTime: string | null;
    actualEndTime: string | null;
    isActive: boolean;
    affectedBatchCount: number;
    affectedOrderCount: number;
    createdBy: string;
    createdAt: string;
}

// API functions
export interface CreateTransferRouteRequest {
    routeType: RouteType;
    fromHubId: string;
    toHubId: string;
    distanceKm?: number;
    transitHours?: number;
    priority?: number;
    isActive?: boolean;
    provinceWarehouseId?: string;
}

export async function createRoute(request: CreateTransferRouteRequest): Promise<TransferRoute> {
    const response = await api.post('/routes', request);
    return response.data;
}

export async function getAllRoutes(): Promise<TransferRoute[]> {
    const response = await api.get('/routes');
    return response.data;
}

export async function getRouteById(routeId: string): Promise<TransferRoute> {
    const response = await api.get(`/routes/${routeId}`);
    return response.data;
}

export async function previewDisableImpact(routeId: string): Promise<ReroutingImpact> {
    const response = await api.get(`/routes/${routeId}/impact`);
    return response.data;
}

export async function disableRoute(routeId: string, request: DisableRouteRequest): Promise<DisruptionResponse> {
    const response = await api.post(`/routes/${routeId}/disable`, request);
    return response.data;
}

export async function enableRoute(routeId: string): Promise<TransferRoute> {
    const response = await api.post(`/routes/${routeId}/enable`);
    return response.data;
}

export async function getActiveDisruptions(): Promise<DisruptionResponse[]> {
    const response = await api.get('/routes/disruptions');
    return response.data;
}

export async function getDisruptionHistory(routeId: string): Promise<DisruptionResponse[]> {
    const response = await api.get(`/routes/${routeId}/disruptions/history`);
    return response.data;
}

// Helper to get disruption type label
export function getDisruptionTypeLabel(type: DisruptionType): string {
    const labels: Record<DisruptionType, string> = {
        'ROAD_BLOCKED': 'Đường bị chặn',
        'POLICY_CHANGE': 'Thay đổi chính sách',
        'EMERGENCY': 'Khẩn cấp',
        'MAINTENANCE': 'Bảo trì',
        'OTHER': 'Khác',
    };
    return labels[type] || type;
}
