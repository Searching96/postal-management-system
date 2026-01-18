import api from '../lib/axios';

export interface LocationUpdate {
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
}

export interface ShipperLocation {
    shipperId: string;
    shipperName: string;
    shipperPhone: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    timestamp: string;
    isActive: boolean;
}

// Update shipper's location
export async function updateShipperLocation(location: LocationUpdate): Promise<void> {
    await api.post('/tracking/location', location);
}

// Get shipper location for order (customer tracking)
export async function getShipperLocationForOrder(orderId: string): Promise<ShipperLocation> {
    const response = await api.get(`/tracking/order/${orderId}`);
    return response.data;
}

// Start delivery session
export async function startDelivery(orderId: string): Promise<void> {
    await api.post(`/tracking/start/${orderId}`);
}

// End delivery session
export async function endDelivery(orderId: string): Promise<void> {
    await api.post(`/tracking/end/${orderId}`);
}

// Get active shippers (admin)
export async function getActiveShippers(): Promise<ShipperLocation[]> {
    const response = await api.get('/tracking/active');
    return response.data;
}

/**
 * Open Google Maps with directions to destination
 * Works on both mobile (opens app) and desktop (opens web)
 */
export function openGoogleMapsDirections(
    destinationAddress: string,
    originLat?: number,
    originLng?: number
): void {
    let url: string;

    if (originLat && originLng) {
        // With current location as origin
        url = `https://www.google.com/maps/dir/${originLat},${originLng}/${encodeURIComponent(destinationAddress)}`;
    } else {
        // Let Google Maps use user's current location
        url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destinationAddress)}`;
    }

    window.open(url, '_blank');
}

/**
 * Open Google Maps to show a specific location
 */
export function openGoogleMapsLocation(lat: number, lng: number): void {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    window.open(url, '_blank');
}

/**
 * Calculate distance between two coordinates (in km)
 */
export function calculateDistance(
    lat1: number, lng1: number,
    lat2: number, lng2: number
): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
