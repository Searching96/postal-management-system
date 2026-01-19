import api from '../lib/axios';
import {
    ConsolidationRoute,
    ConsolidationStatusResponse,
    CreateConsolidationRouteRequest,
    RerouteTarget,
    TemporaryReroute,
} from '../models/consolidationRoute';

export async function getAllConsolidationRoutes(): Promise<ConsolidationRoute[]> {
    const response = await api.get('/consolidation-routes');
    return response.data;
}

// Get consolidation routes by province
export async function getConsolidationRoutesByProvince(provinceCode: string): Promise<ConsolidationRoute[]> {
    const response = await api.get(`/consolidation-routes/province/${provinceCode}`);
    return response.data;
}

// Get single consolidation route
export async function getConsolidationRouteById(routeId: string): Promise<ConsolidationRoute> {
    const response = await api.get(`/consolidation-routes/${routeId}`);
    return response.data;
}

// Create new consolidation route
export async function createConsolidationRoute(
    request: CreateConsolidationRouteRequest
): Promise<ConsolidationRoute> {
    const response = await api.post('/consolidation-routes', request);
    return response.data;
}

// Update consolidation route
export async function updateConsolidationRoute(
    routeId: string,
    request: CreateConsolidationRouteRequest
): Promise<ConsolidationRoute> {
    const response = await api.put(`/consolidation-routes/${routeId}`, request);
    return response.data;
}

// Activate route
export async function activateConsolidationRoute(routeId: string): Promise<ConsolidationRoute> {
    const response = await api.post(`/consolidation-routes/${routeId}/activate`);
    return response.data;
}

// Deactivate route (can specify temporary rerouting)
export async function deactivateConsolidationRoute(
    routeId: string,
    tempReroute?: TemporaryReroute
): Promise<ConsolidationRoute> {
    const payload = tempReroute ? { tempReroute } : {};
    const response = await api.post(`/consolidation-routes/${routeId}/deactivate`, payload);
    return response.data;
}

// Delete consolidation route
export async function deleteConsolidationRoute(routeId: string): Promise<void> {
    await api.delete(`/consolidation-routes/${routeId}`);
}

// Get route status
export async function getConsolidationRouteStatus(routeId: string): Promise<ConsolidationStatusResponse> {
    const response = await api.get(`/consolidation-routes/${routeId}/status`);
    return response.data;
}

// Get province consolidation status
export async function getProvinceConsolidationStatus(
    provinceCode: string
): Promise<ConsolidationStatusResponse> {
    const response = await api.get(`/consolidation-routes/province/${provinceCode}/status`);
    return response.data;
}

// Get rerouting targets (same level or upper level routes)
export async function getRerouteTargets(routeId: string): Promise<RerouteTarget[]> {
    const response = await api.get(`/consolidation-routes/${routeId}/reroute-targets`);
    return response.data;
}

// Consolidate single route
export async function consolidateRoute(routeId: string): Promise<ConsolidationStatusResponse> {
    const response = await api.post(`/consolidation-routes/${routeId}/consolidate`);
    return response.data;
}

// Consolidate ready routes by province
export async function consolidateReadyRoutesByProvince(
    provinceCode: string
): Promise<{ message: string; count: number }> {
    const response = await api.post(`/consolidation-routes/province/${provinceCode}/consolidate-ready`);
    return response.data;
}

// Manual trigger consolidate all ready routes (SYSTEM_ADMIN only)
export async function consolidateAllReadyRoutes(): Promise<{ message: string; count: number }> {
    const response = await api.post('/consolidation-routes/consolidate-all-ready');
    return response.data;
}
