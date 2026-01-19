package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.ConsolidationRoute;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository for ConsolidationRoute entities.
 * Handles queries for ward-to-province consolidation routes.
 */
public interface ConsolidationRouteRepository extends JpaRepository<ConsolidationRoute, UUID> {

    /**
     * Find all active consolidation routes for a specific province.
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.province.code = :provinceCode AND cr.isActive = true " +
           "ORDER BY cr.name ASC")
    List<ConsolidationRoute> findActiveRoutesByProvince(@Param("provinceCode") String provinceCode);

    /**
     * Find all consolidation routes (active and inactive) for a province.
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.province.code = :provinceCode " +
           "ORDER BY cr.name ASC")
    List<ConsolidationRoute> findRoutesByProvince(@Param("provinceCode") String provinceCode);

    /**
     * Find consolidation route by name and province.
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.name = :name AND cr.province.code = :provinceCode")
    Optional<ConsolidationRoute> findByNameAndProvince(
        @Param("name") String name,
        @Param("provinceCode") String provinceCode);

    /**
     * Find consolidation route that serves a specific ward.
     * Note: This is a simple check - in production would parse JSON and check.
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.province.code = :provinceCode AND cr.isActive = true")
    Optional<ConsolidationRoute> findRouteForWard(
        @Param("provinceCode") String provinceCode);

    /**
     * Get paginated list of routes for a province.
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.province.code = :provinceCode " +
           "ORDER BY cr.createdAt DESC")
    Page<ConsolidationRoute> findByProvinceCodePaginated(
        @Param("provinceCode") String provinceCode,
        Pageable pageable);

    /**
     * Count active routes in a province.
     */
    @Query("SELECT COUNT(cr) FROM ConsolidationRoute cr " +
           "WHERE cr.province.code = :provinceCode AND cr.isActive = true")
    long countActiveRoutesByProvince(@Param("provinceCode") String provinceCode);

    /**
     * Find routes by destination warehouse (province).
     */
    @Query("SELECT cr FROM ConsolidationRoute cr " +
           "WHERE cr.destinationWarehouse.id = :warehouseId " +
           "ORDER BY cr.name ASC")
    List<ConsolidationRoute> findByDestinationWarehouse(@Param("warehouseId") UUID warehouseId);
}
