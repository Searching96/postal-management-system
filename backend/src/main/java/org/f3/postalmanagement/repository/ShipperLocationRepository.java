package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.tracking.ShipperLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

public interface ShipperLocationRepository extends JpaRepository<ShipperLocation, UUID> {

    /**
     * Find current location for a shipper
     */
    Optional<ShipperLocation> findByShipperId(UUID shipperId);

    /**
     * Check if shipper has active location
     */
    boolean existsByShipperIdAndIsActiveTrue(UUID shipperId);

    /**
     * Find active shippers (for admin dashboard)
     */
    @Query("SELECT sl FROM ShipperLocation sl WHERE sl.isActive = true AND sl.timestamp > :since")
    java.util.List<ShipperLocation> findActiveShippers(@Param("since") LocalDateTime since);

    /**
     * Cleanup old inactive locations
     */
    @Modifying
    @Query("DELETE FROM ShipperLocation sl WHERE sl.isActive = false AND sl.timestamp < :before")
    void deleteInactiveOlderThan(@Param("before") LocalDateTime before);

    /**
     * Find shipper location by order ID (searches in activeOrderIds)
     */
    @Query("SELECT sl FROM ShipperLocation sl WHERE sl.isActive = true AND sl.activeOrderIds LIKE %:orderId%")
    Optional<ShipperLocation> findByActiveOrderId(@Param("orderId") String orderId);
}
