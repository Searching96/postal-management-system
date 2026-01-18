package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.OfficePair;
import org.f3.postalmanagement.entity.unit.WardOfficeAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WardOfficeAssignmentRepository extends JpaRepository<WardOfficeAssignment, UUID> {

    /**
     * Find all ward assignments for a specific office pair
     */
    List<WardOfficeAssignment> findByOfficePair(OfficePair officePair);

    /**
     * Find all ward assignments for a specific office pair by ID
     */
    @Query("SELECT wa FROM WardOfficeAssignment wa WHERE wa.officePair.id = :officePairId AND wa.deletedAt IS NULL")
    List<WardOfficeAssignment> findByOfficePairId(@Param("officePairId") UUID officePairId);

    /**
     * Find assignment by ward code
     */
    @Query("SELECT wa FROM WardOfficeAssignment wa WHERE wa.ward.code = :wardCode AND wa.deletedAt IS NULL")
    Optional<WardOfficeAssignment> findByWardCode(@Param("wardCode") String wardCode);

    /**
     * Check if ward is already assigned to any office pair
     */
    @Query("SELECT CASE WHEN COUNT(wa) > 0 THEN true ELSE false END FROM WardOfficeAssignment wa WHERE wa.ward.code = :wardCode AND wa.deletedAt IS NULL")
    boolean existsByWardCode(@Param("wardCode") String wardCode);

    /**
     * Check if ward is assigned to a specific office pair
     */
    @Query("SELECT CASE WHEN COUNT(wa) > 0 THEN true ELSE false END FROM WardOfficeAssignment wa WHERE wa.ward.code = :wardCode AND wa.officePair.id = :officePairId AND wa.deletedAt IS NULL")
    boolean existsByWardCodeAndOfficePairId(@Param("wardCode") String wardCode, @Param("officePairId") UUID officePairId);

    /**
     * Find all assignments in a specific province
     */
    @Query("SELECT wa FROM WardOfficeAssignment wa WHERE wa.ward.province.code = :provinceCode AND wa.deletedAt IS NULL")
    List<WardOfficeAssignment> findAllByProvinceCode(@Param("provinceCode") String provinceCode);

    /**
     * Delete all assignments for an office pair (soft delete via update)
     */
    @Query("UPDATE WardOfficeAssignment wa SET wa.deletedAt = CURRENT_TIMESTAMP WHERE wa.officePair.id = :officePairId")
    void softDeleteByOfficePairId(@Param("officePairId") UUID officePairId);

    /**
     * Delete assignments for office pair that are not in the given ward codes list
     */
    @Query("UPDATE WardOfficeAssignment wa SET wa.deletedAt = CURRENT_TIMESTAMP WHERE wa.officePair.id = :officePairId AND wa.ward.code NOT IN :wardCodes")
    void softDeleteByOfficePairIdAndWardCodeNotIn(@Param("officePairId") UUID officePairId, @Param("wardCodes") List<String> wardCodes);
}
