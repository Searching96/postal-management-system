// mockData.ts
import { ConsolidationRoute, RouteLevel } from '../models/consolidationRoute';

const createLinkedSequence = (routeId: string, codes: string[], isDisconnected: boolean = false) => {
    // FIX: Only prepend Warehouse if it's a standard connected loop
    // If disconnected (standalone), just use the codes provided
    const allNodes = isDisconnected ? codes : ['warehouse-01', ...codes];

    return allNodes.map((code, index) => {
        // DEFAULT: Point to next node
        let nextId: string | null = index === allNodes.length - 1 ? allNodes[0] : allNodes[index + 1];

        // SPECIAL CASE: If disconnected, the last node points to NOTHING (null)
        if (isDisconnected && index === allNodes.length - 1) {
            nextId = null;
        }

        return {
            id: `stop-${routeId}-${code}`,
            officeId: code,
            officeCode: code,
            officeName: code === 'warehouse-01' ? 'Hanoi Central Warehouse' : `Office ${code}`,
            nextDestinationId: nextId,
            isPickUp: code !== 'warehouse-01',
            stopOrder: index
        };
    });
};

const DEFAULT_ROUTES_CONFIG = [
    {
        id: 'vong-1',
        name: 'Vòng 1 - Tây Bắc',
        color: '#22c55e',
        codes: ['00091', '00619', '00622', '00199', '00226']
    },
    {
        id: 'vong-2',
        name: 'Vòng 2 - Nam',
        color: '#3b82f6',
        codes: ['00229', '00364', '00664', '00340', '00283']
    },
    {
        id: 'vong-3',
        name: 'Vòng 3 - Đông',
        color: '#ef4444',
        codes: ['00577', '00565', '00541', '00127', '00118']
    },
    {
        id: 'vong-4',
        name: 'Node Lẻ - Long Biên',
        color: '#a855f7', // Purple
        codes: ['00145'],
        isDisconnected: true // This will now prevent the Warehouse connection
    }
];

export const generateMockRoutes = (): ConsolidationRoute[] => {
    return DEFAULT_ROUTES_CONFIG.map(config => ({
        id: config.id,
        name: config.name,
        color: config.color,
        routeLevel: RouteLevel.WARD,
        status: { isActive: true, lastConsolidationAt: new Date().toISOString() },
        capacity: { maxWeightKg: 1000, maxOrders: 200, currentWeightKg: 0, currentOrders: 0 },
        destinationWarehouse: { id: 'warehouse-01', code: 'WH_HANOI_01', name: 'Hanoi Central Warehouse' },
        routeStops: createLinkedSequence(config.id, config.codes, (config as any).isDisconnected),
    } as any));
};