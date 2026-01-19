package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.RouteDisruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface RouteDisruptionRepository extends JpaRepository<RouteDisruption, UUID> {

    /**
     * Find all active disruptions.
     */
    List<RouteDisruption> findAllByIsActiveTrue();

    /**
     * Find disruptions for a specific route.
     */
    List<RouteDisruption> findByTransferRouteIdOrderByStartTimeDesc(UUID transferRouteId);

    /**
     * Find active disruption for a route (should be at most one).
     */
    @Query("SELECT d FROM RouteDisruption d WHERE d.transferRoute.id = :routeId AND d.isActive = true")
    RouteDisruption findActiveByRouteId(@Param("routeId") UUID routeId);

    /**
     * Count active disruptions.
     */
    long countByIsActiveTrue();
}
