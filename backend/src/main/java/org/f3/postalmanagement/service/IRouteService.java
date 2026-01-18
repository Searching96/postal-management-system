package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.response.route.RouteResponse;
import org.f3.postalmanagement.entity.unit.Office;

import java.util.List;
import java.util.UUID;

/**
 * Service for calculating package transfer routes through the postal network.
 */
public interface IRouteService {

    /**
     * Calculate the full transfer route for a package.
     * Route follows: Ward → Province Warehouse → Hub (origin) → [Intermediate Hubs] → Hub (destination) → Province Warehouse → Ward
     *
     * @param originOfficeId The source office ID (ward or province level)
     * @param destinationWardCode The destination ward code
     * @return RouteResponse containing ordered list of stops
     */
    RouteResponse calculatePackageRoute(UUID originOfficeId, String destinationWardCode);

    /**
     * Get the hub-to-hub path between two regions using BFS.
     *
     * @param fromRegionId Source region ID
     * @param toRegionId Destination region ID
     * @return Ordered list of hubs in the path
     */
    List<Office> getHubPath(Integer fromRegionId, Integer toRegionId);

    /**
     * Calculate estimated transit time for a route in hours.
     *
     * @param originOfficeId Source office ID
     * @param destinationWardCode Destination ward code
     * @return Estimated hours for the entire journey
     */
    int calculateEstimatedTransitHours(UUID originOfficeId, String destinationWardCode);
}
