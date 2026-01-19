package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.route.CreateTransferRouteRequest;
import org.f3.postalmanagement.dto.request.route.DisableRouteRequest;
import org.f3.postalmanagement.dto.response.route.DisruptionResponse;
import org.f3.postalmanagement.dto.response.route.ReroutingImpactResponse;
import org.f3.postalmanagement.dto.response.route.TransferRouteResponse;
import org.f3.postalmanagement.entity.actor.Account;

import java.util.List;
import java.util.UUID;

/**
 * Service for managing route disruptions and rerouting.
 */
public interface IReroutingService {

    /**
     * Create a new transfer route.
     */
    TransferRouteResponse createRoute(CreateTransferRouteRequest request, Account currentAccount);

    /**
     * Get all transfer routes with their current status.
     */
    List<TransferRouteResponse> getAllRoutes();

    /**
     * Get a specific route by ID.
     */
    TransferRouteResponse getRouteById(UUID routeId);

    /**
     * Preview the impact of disabling a route before actually disabling it.
     */
    ReroutingImpactResponse previewDisableImpact(UUID routeId);

    /**
     * Disable a route and trigger rerouting for affected packages.
     */
    DisruptionResponse disableRoute(UUID routeId, DisableRouteRequest request, Account currentAccount);

    /**
     * Re-enable a previously disabled route.
     */
    TransferRouteResponse enableRoute(UUID routeId, Account currentAccount);

    /**
     * Get all active disruptions.
     */
    List<DisruptionResponse> getActiveDisruptions();

    /**
     * Get disruption history for a specific route.
     */
    List<DisruptionResponse> getDisruptionHistory(UUID routeId);
}
