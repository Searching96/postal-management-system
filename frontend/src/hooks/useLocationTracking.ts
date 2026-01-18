import { useState, useEffect, useCallback, useRef } from 'react';
import { updateShipperLocation } from '../services/trackingService';

interface LocationState {
    latitude: number;
    longitude: number;
    accuracy: number | null;
    heading: number | null;
    speed: number | null;
    timestamp: Date;
}

interface UseLocationTrackingOptions {
    updateInterval?: number; // ms between server updates
    enableHighAccuracy?: boolean;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
    const { updateInterval = 10000, enableHighAccuracy = true } = options;

    const [isTracking, setIsTracking] = useState(false);
    const [location, setLocation] = useState<LocationState | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [permissionDenied, setPermissionDenied] = useState(false);

    const watchIdRef = useRef<number | null>(null);
    const lastUpdateRef = useRef<number>(0);

    const sendLocationToServer = useCallback(async (position: GeolocationPosition) => {
        const now = Date.now();
        // Only send to server every updateInterval
        if (now - lastUpdateRef.current < updateInterval) return;

        lastUpdateRef.current = now;

        try {
            await updateShipperLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading ?? undefined,
                speed: position.coords.speed ? position.coords.speed * 3.6 : undefined // m/s to km/h
            });
        } catch (err) {
            console.error('Failed to update location:', err);
        }
    }, [updateInterval]);

    const handlePositionUpdate = useCallback((position: GeolocationPosition) => {
        const newLocation: LocationState = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading,
            speed: position.coords.speed ? position.coords.speed * 3.6 : null, // m/s to km/h
            timestamp: new Date(position.timestamp)
        };

        setLocation(newLocation);
        setError(null);
        sendLocationToServer(position);
    }, [sendLocationToServer]);

    const handlePositionError = useCallback((error: GeolocationPositionError) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                setError('Cần cấp quyền truy cập vị trí');
                setPermissionDenied(true);
                break;
            case error.POSITION_UNAVAILABLE:
                setError('Không thể xác định vị trí');
                break;
            case error.TIMEOUT:
                setError('Hết thời gian xác định vị trí');
                break;
        }
    }, []);

    const startTracking = useCallback(() => {
        if (!navigator.geolocation) {
            setError('Trình duyệt không hỗ trợ định vị');
            return;
        }

        setIsTracking(true);
        setError(null);
        setPermissionDenied(false);

        watchIdRef.current = navigator.geolocation.watchPosition(
            handlePositionUpdate,
            handlePositionError,
            {
                enableHighAccuracy,
                timeout: 15000,
                maximumAge: 5000
            }
        );
    }, [handlePositionUpdate, handlePositionError, enableHighAccuracy]);

    const stopTracking = useCallback(() => {
        if (watchIdRef.current !== null) {
            navigator.geolocation.clearWatch(watchIdRef.current);
            watchIdRef.current = null;
        }
        setIsTracking(false);
    }, []);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (watchIdRef.current !== null) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return {
        isTracking,
        location,
        error,
        permissionDenied,
        startTracking,
        stopTracking
    };
}
