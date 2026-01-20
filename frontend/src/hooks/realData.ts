import { ConsolidationRoute, RouteLevel } from '../models/consolidationRoute';

// Helper to create a linked list sequence INCLUDING the Warehouse
const createLinkedSequence = (routeId: string, codes: string[]) => {
    // 1. Add Warehouse at the start of the codes list
    // This allows the Warehouse to have a 'nextDestinationId' (the first ward)
    const allNodes = ['warehouse-01', ...codes];

    return allNodes.map((code, index) => {
        // Point to next node in the array
        // If last node, point back to the first (Warehouse) to close the loop
        const nextId = index === allNodes.length - 1 ? allNodes[0] : allNodes[index + 1];

        return {
            id: `stop-${routeId}-${code}`,
            officeId: code,
            officeCode: code, // 'warehouse-01' or '00123'
            officeName: code === 'warehouse-01' ? 'Hanoi Central Warehouse' : `Office ${code}`,
            nextDestinationId: nextId,
            isPickUp: code !== 'warehouse-01', // Warehouse is not a pickup point
            stopOrder: index
        };
    });
};

const DEFAULT_ROUTES_CONFIG = [
    {
        id: 'vong-1',
        name: 'Vòng 1 - Tây Bắc',
        color: '#3b82f6',
        codes: ['00103', '00091', '00611', '00619', '00622', '00634', '00199', '00226']
    },
    {
        id: 'vong-2',
        name: 'Vòng 2 - Nam',
        color: '#3b82f6',
        codes: ['00229', '00364', '00664', '00679', '00340', '00283']
    },
    {
        id: 'vong-3',
        name: 'Vòng 3 - Đông',
        color: '#3b82f6',
        // REMOVED '00145' from here
        codes: ['00577', '00565', '00541', '00127', '00118']
    },
    {
        // NEW STANDALONE ROUTE
        id: 'vong-4',
        name: 'Vòng 4 - Long Biên (Standalone)',
        color: '#3b82f6', // Purple to stand out
        codes: ['00145'] // Only Long Biên
    }
];

export const generateMockRoutes = (): ConsolidationRoute[] => {
    return DEFAULT_ROUTES_CONFIG.map(config => ({
        id: config.id,
        name: config.name,
        color: config.color,
        routeLevel: RouteLevel.WARD,
        status: { isActive: true, lastConsolidationAt: new Date().toISOString() },
        capacity: {
            maxWeightKg: 1000,
            maxOrders: 200,
            currentWeightKg: Math.floor(Math.random() * 500),
            currentOrders: Math.floor(Math.random() * 100),
        },
        destinationWarehouse: {
            id: 'warehouse-01',
            code: 'WH_HANOI_01',
            name: 'Hanoi Central Warehouse',
        },
        // Now includes the Warehouse as a node
        routeStops: createLinkedSequence(config.id, config.codes),
    } as any));
};