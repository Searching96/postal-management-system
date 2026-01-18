package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.tracking.LocationUpdateRequest;
import org.f3.postalmanagement.dto.response.tracking.ShipperLocationResponse;
import org.f3.postalmanagement.entity.actor.Account;

import java.util.List;
import java.util.UUID;

/**
 * Service for real-time shipper location tracking.
 */
public interface ITrackingService {

    /**
     * Update shipper's current GPS location.
     */
    void updateLocation(LocationUpdateRequest request, Account currentAccount);

    /**
     * Get current location for a specific shipper.
     */
    ShipperLocationResponse getShipperLocation(UUID shipperId);

    /**
     * Get shipper location for a specific order (for customers tracking delivery).
     */
    ShipperLocationResponse getShipperLocationForOrder(UUID orderId);

    /**
     * Start delivery session - sets order to OUT_FOR_DELIVERY and begins tracking.
     */
    void startDeliverySession(UUID orderId, Account currentAccount);

    /**
     * End delivery session - stops tracking for completed/failed orders.
     */
    void endDeliverySession(UUID orderId, Account currentAccount);

    /**
     * Get all active shippers (for admin monitoring).
     */
    List<ShipperLocationResponse> getActiveShippers();
}
