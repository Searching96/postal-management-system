package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.enums.BatchStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BatchPackageRepository extends JpaRepository<BatchPackage, UUID> {

    /**
     * Find batch by batch code
     */
    Optional<BatchPackage> findByBatchCode(String batchCode);

    /**
     * Check if batch code exists
     */
    boolean existsByBatchCode(String batchCode);

    /**
     * Find open batches for a specific route (origin -> destination)
     * These are batches that can accept more orders
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.originOffice.id = :originOfficeId AND " +
           "b.destinationOffice.id = :destinationOfficeId AND " +
           "b.status IN :statuses " +
           "ORDER BY b.currentOrderCount DESC")
    List<BatchPackage> findOpenBatchesForRoute(@Param("originOfficeId") UUID originOfficeId,
                                                @Param("destinationOfficeId") UUID destinationOfficeId,
                                                @Param("statuses") List<BatchStatus> statuses);

    /**
     * Find the best batch for an order (one with most orders already, that can still fit this order)
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.originOffice.id = :originOfficeId AND " +
           "b.destinationOffice.id = :destinationOfficeId AND " +
           "b.status IN ('OPEN', 'PROCESSING') AND " +
           "(b.maxOrderCount IS NULL OR b.currentOrderCount < b.maxOrderCount) AND " +
           "b.currentWeightKg + :orderWeight <= b.maxWeightKg " +
           "ORDER BY b.currentOrderCount DESC, b.createdAt ASC")
    List<BatchPackage> findBestBatchForOrder(@Param("originOfficeId") UUID originOfficeId,
                                              @Param("destinationOfficeId") UUID destinationOfficeId,
                                              @Param("orderWeight") java.math.BigDecimal orderWeight);

    /**
     * Find batches by origin office
     */
    @Query("SELECT b FROM BatchPackage b WHERE b.originOffice.id = :officeId " +
           "ORDER BY b.createdAt DESC")
    Page<BatchPackage> findByOriginOfficeId(@Param("officeId") UUID officeId, Pageable pageable);

    /**
     * Find batches by destination office
     */
    @Query("SELECT b FROM BatchPackage b WHERE b.destinationOffice.id = :officeId " +
           "ORDER BY b.createdAt DESC")
    Page<BatchPackage> findByDestinationOfficeId(@Param("officeId") UUID officeId, Pageable pageable);

    /**
     * Find batches by status at a specific office (origin)
     */
    @Query("SELECT b FROM BatchPackage b WHERE b.originOffice.id = :officeId AND b.status = :status " +
           "ORDER BY b.createdAt DESC")
    Page<BatchPackage> findByOriginOfficeIdAndStatus(@Param("officeId") UUID officeId,
                                                      @Param("status") BatchStatus status,
                                                      Pageable pageable);

    /**
     * Find batches ready to be sealed (have enough orders or exceeded time limit)
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.originOffice.id = :officeId AND " +
           "b.status = 'OPEN' AND " +
           "(b.currentOrderCount >= :minOrderCount OR " +
           "b.currentWeightKg >= b.maxWeightKg * :fillThreshold) " +
           "ORDER BY b.currentOrderCount DESC")
    List<BatchPackage> findBatchesReadyToSeal(@Param("officeId") UUID officeId,
                                               @Param("minOrderCount") int minOrderCount,
                                               @Param("fillThreshold") double fillThreshold);

    /**
     * Count batches by status at an office
     */
    long countByOriginOfficeIdAndStatus(UUID officeId, BatchStatus status);

    /**
     * Find all open batches at an office
     */
    @Query("SELECT b FROM BatchPackage b WHERE b.originOffice.id = :officeId AND b.status = 'OPEN' " +
           "ORDER BY b.destinationOffice.officeName ASC")
    List<BatchPackage> findOpenBatchesByOriginOffice(@Param("officeId") UUID officeId);

    /**
     * Get destinations with pending orders for batching
     */
    @Query("SELECT DISTINCT o.destinationOffice FROM Order o WHERE " +
           "o.originOffice.id = :officeId AND " +
           "o.batchPackage IS NULL AND " +
           "o.status IN ('AT_ORIGIN_OFFICE', 'SORTED_AT_ORIGIN') " +
           "ORDER BY o.destinationOffice.officeName")
    List<org.f3.postalmanagement.entity.unit.Office> findDestinationsWithUnbatchedOrders(@Param("officeId") UUID officeId);

    /**
     * Find batches in transit that originate from or are destined to a specific hub.
     * Used for calculating rerouting impact.
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.status = 'IN_TRANSIT' AND " +
           "(b.originOffice.id = :hubId OR b.destinationOffice.id = :hubId)")
    List<BatchPackage> findInTransitBatchesInvolvingHub(@Param("hubId") UUID hubId);

    /**
     * Find sealed or in-transit batches between specific hubs.
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.status IN ('SEALED', 'IN_TRANSIT') AND " +
           "b.originOffice.id = :fromHubId AND b.destinationOffice.id = :toHubId")
    List<BatchPackage> findActiveBatchesBetweenHubs(@Param("fromHubId") UUID fromHubId,
                                                    @Param("toHubId") UUID toHubId);

    /**
     * Find open batches created before a specific time (for auto-sealing).
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.status = 'OPEN' AND b.createdAt < :threshold " +
           "ORDER BY b.createdAt ASC")
    List<BatchPackage> findByStatusAndCreatedAtBefore(@Param("status") BatchStatus status,
                                                      @Param("threshold") LocalDateTime threshold);

    /**
     * Simplified version that only takes threshold (status is OPEN).
     */
    @Query("SELECT b FROM BatchPackage b WHERE " +
           "b.status = 'OPEN' AND b.createdAt < :threshold " +
           "ORDER BY b.createdAt ASC")
    List<BatchPackage> findOpenBatchesOlderThan(@Param("threshold") LocalDateTime threshold);
}
