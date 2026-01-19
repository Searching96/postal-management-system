package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OfficeRepository extends JpaRepository<Office, UUID> {

    boolean existsByOfficeType(OfficeType officeType);

    boolean existsByOfficeEmail(String officeEmail);

    java.util.Optional<Office> findByOfficeEmail(String officeEmail);

    Optional<Office> findByOfficeName(String officeName);

    List<Office> findAllByOfficeType(OfficeType officeType);

    List<Office> findAllByOfficeTypeIn(List<OfficeType> officeTypes);

    @Query("SELECT o FROM Office o WHERE o.ward.province.code = :provinceCode AND o.officeType = :officeType")
    List<Office> findAllByProvinceCodeAndOfficeType(@Param("provinceCode") String provinceCode, @Param("officeType") OfficeType officeType);

    @Query("SELECT o FROM Office o WHERE o.ward.province.code = :provinceCode AND o.officeType IN :officeTypes")
    List<Office> findAllByProvinceCodeAndOfficeTypeIn(@Param("provinceCode") String provinceCode, @Param("officeTypes") List<OfficeType> officeTypes);

    @Query("SELECT o FROM Office o WHERE o.region.id = :regionId AND o.officeType IN :officeTypes ORDER BY o.officeName ASC")
    List<Office> findAllByRegionIdAndOfficeTypeIn(@Param("regionId") Integer regionId, @Param("officeTypes") List<OfficeType> officeTypes);

    @Query("SELECT o FROM Office o WHERE o.region.id = :regionId AND o.officeType IN :officeTypes AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.officeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.officeEmail) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.officeName ASC")
    Page<Office> findByRegionIdAndOfficeTypeInWithSearch(@Param("regionId") Integer regionId, 
                                                          @Param("officeTypes") List<OfficeType> officeTypes,
                                                          @Param("search") String search,
                                                          Pageable pageable);

    @Query("SELECT o FROM Office o WHERE o.ward.province.code = :provinceCode AND o.officeType IN :officeTypes AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.officeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.officeEmail) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.officeName ASC")
    Page<Office> findByProvinceCodeAndOfficeTypeInWithSearch(@Param("provinceCode") String provinceCode, 
                                                              @Param("officeTypes") List<OfficeType> officeTypes,
                                                              @Param("search") String search,
                                                              Pageable pageable);

    @Query("SELECT o FROM Office o WHERE o.ward.province.code = :provinceCode AND o.officeType = :officeType")
    List<Office> findByProvinceCodeAndOfficeType(@Param("provinceCode") String provinceCode, @Param("officeType") OfficeType officeType);

    @Query("SELECT o FROM Office o WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.officeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.officeAddressLine1) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.officeName ASC")
    Page<Office> searchOffices(@Param("search") String search, Pageable pageable);

    @Query("SELECT o FROM Office o WHERE o.officeType IN :officeTypes AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(o.officeName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(o.officeEmail) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.officeName ASC")
    Page<Office> findAllByOfficeTypeInWithSearch(@Param("officeTypes") List<OfficeType> officeTypes,
                                                 @Param("search") String search,
                                                 Pageable pageable);
}
