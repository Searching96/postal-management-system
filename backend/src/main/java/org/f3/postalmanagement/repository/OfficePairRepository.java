package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.OfficePair;
import org.f3.postalmanagement.enums.OfficeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfficePairRepository extends JpaRepository<OfficePair, UUID> {

    /**
     * Find office pair by warehouse office
     */
    Optional<OfficePair> findByWhOffice(Office whOffice);

    /**
     * Find office pair by post office
     */
    Optional<OfficePair> findByPoOffice(Office poOffice);

    /**
     * Find office pair by warehouse office ID
     */
    @Query("SELECT op FROM OfficePair op WHERE op.whOffice.id = :officeId")
    Optional<OfficePair> findByWhOfficeId(@Param("officeId") UUID officeId);

    /**
     * Find office pair by post office ID
     */
    @Query("SELECT op FROM OfficePair op WHERE op.poOffice.id = :officeId")
    Optional<OfficePair> findByPoOfficeId(@Param("officeId") UUID officeId);

    /**
     * Find all office pairs in a specific province
     */
    @Query("SELECT op FROM OfficePair op WHERE op.whOffice.ward.province.code = :provinceCode")
    List<OfficePair> findAllByProvinceCode(@Param("provinceCode") String provinceCode);

    /**
     * Find all office pairs by office type of warehouse
     */
    @Query("SELECT op FROM OfficePair op WHERE op.whOffice.officeType = :officeType")
    List<OfficePair> findAllByWhOfficeType(@Param("officeType") OfficeType officeType);

    /**
     * Find all ward-level office pairs (WARD_WAREHOUSE + WARD_POST)
     */
    @Query("SELECT op FROM OfficePair op WHERE op.whOffice.officeType = 'WARD_WAREHOUSE'")
    List<OfficePair> findAllWardOfficePairs();

    /**
     * Find all ward-level office pairs in a specific province
     */
    @Query("SELECT op FROM OfficePair op WHERE op.whOffice.officeType = 'WARD_WAREHOUSE' AND op.whOffice.ward.province.code = :provinceCode")
    List<OfficePair> findAllWardOfficePairsByProvinceCode(@Param("provinceCode") String provinceCode);
}
