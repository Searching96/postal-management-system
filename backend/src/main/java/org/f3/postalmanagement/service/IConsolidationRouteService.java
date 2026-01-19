package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.consolidation.CreateConsolidationRouteRequest;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationRouteResponse;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationStatusResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.order.Order;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing consolidation routes (WARD → PROVINCE consolidation).
 */
public interface IConsolidationRouteService {

    // ==================== ROUTE MANAGEMENT ====================

    /**
     * Create a new consolidation route for a province.
     * Multiple routes per province supported.
     */
    ConsolidationRouteResponse createConsolidationRoute(
        CreateConsolidationRouteRequest request,
        Account currentAccount);

    /**
     * Get all consolidation routes (across all provinces).
     */
    List<ConsolidationRouteResponse> getAllConsolidationRoutes();

    /**
     * Get all consolidation routes for a province.
     */
    List<ConsolidationRouteResponse> getRoutesByProvince(String provinceCode, Account currentAccount);

    /**
     * Get a specific consolidation route.
     */
    ConsolidationRouteResponse getRouteById(UUID routeId, Account currentAccount);

    /**
     * Update a consolidation route.
     */
    ConsolidationRouteResponse updateRoute(
        UUID routeId,
        CreateConsolidationRouteRequest request,
        Account currentAccount);

    /**
     * Activate/deactivate a consolidation route.
     */
    ConsolidationRouteResponse setRouteActive(UUID routeId, boolean active, Account currentAccount);

    /**
     * Delete a consolidation route.
     * Can only delete if no pending orders.
     */
    void deleteRoute(UUID routeId, Account currentAccount);

    // ==================== ORDER ASSIGNMENT ====================

    /**
     * Assign an order to its consolidation route based on origin ward.
     * This happens automatically at order creation.
     * Returns the assigned route or throws exception if no suitable route.
     */
    void assignOrderToRoute(UUID orderId);

    /**
     * Get all unassigned orders for a province (those without consolidation route).
     */
    List<Order> getUnassignedOrdersByProvince(String provinceCode);

    /**
     * Get all orders waiting in a consolidation route (pending consolidation).
     */
    List<Order> getPendingOrdersForRoute(UUID routeId);

    // ==================== CONSOLIDATION OPERATIONS ====================

    /**
     * Check if a consolidation route is ready to consolidate.
     * Ready if: enough orders OR enough weight OR time threshold exceeded
     */
    boolean isRouteReadyForConsolidation(UUID routeId);

    /**
     * Trigger consolidation: Move all pending orders from consolidation route to province warehouse.
     * Sets consolidatedAt timestamp and updates order status.
     */
    ConsolidationStatusResponse consolidateRoute(UUID routeId, Account currentAccount);

    /**
     * Consolidate all ready routes in a province.
     * Called by scheduled job.
     */
    int consolidateReadyRoutesByProvince(String provinceCode);

    /**
     * Consolidate all ready routes system-wide.
     * Called by scheduled job.
     */
    int consolidateAllReadyRoutes();

    // ==================== STATUS & MONITORING ====================

    /**
     * Get current status of a consolidation route.
     * Shows pending order count, weight, readiness, etc.
     */
    ConsolidationStatusResponse getRouteStatus(UUID routeId);

    /**
     * Get aggregated status for all routes in a province.
     */
    ConsolidationStatusResponse getProvinceConsolidationStatus(String provinceCode);

    /**
     * Assign orders from a specific consolidation route to transfer routes (PROVINCE → HUB).
     * This happens after consolidation at province.
     */
    void assignConsolidatedOrdersToTransferRoute(UUID routeId);
}
