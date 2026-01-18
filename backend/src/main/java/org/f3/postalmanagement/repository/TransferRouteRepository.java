package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TransferRouteRepository extends JpaRepository<TransferRoute, UUID> {

    /**
     * Find all active transfer routes.
     */
    List<TransferRoute> findAllByIsActiveTrue();

    /**
     * Find a specific route between two hubs.
     */
    Optional<TransferRoute> findByFromHubIdAndToHubId(UUID fromHubId, UUID toHubId);

    /**
     * Check if a route exists between two hubs.
     */
    boolean existsByFromHubIdAndToHubId(UUID fromHubId, UUID toHubId);

    /**
     * Find all routes connected to a specific hub.
     */
    @Query("SELECT tr FROM TransferRoute tr WHERE (tr.fromHub.id = :hubId OR tr.toHub.id = :hubId) AND tr.isActive = true")
    List<TransferRoute> findAllConnectedRoutes(@Param("hubId") UUID hubId);

    /**
     * Find all outgoing routes from a hub (for BFS traversal).
     */
    @Query("SELECT tr FROM TransferRoute tr WHERE tr.fromHub.id = :hubId AND tr.isActive = true ORDER BY tr.priority ASC")
    List<TransferRoute> findOutgoingRoutes(@Param("hubId") UUID hubId);

    /**
     * Find routes by region IDs.
     */
    @Query("SELECT tr FROM TransferRoute tr WHERE tr.fromHub.region.id = :fromRegionId AND tr.toHub.region.id = :toRegionId AND tr.isActive = true")
    Optional<TransferRoute> findByRegionIds(@Param("fromRegionId") Integer fromRegionId, @Param("toRegionId") Integer toRegionId);
}
