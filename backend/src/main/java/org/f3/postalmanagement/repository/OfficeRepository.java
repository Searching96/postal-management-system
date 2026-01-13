package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface OfficeRepository extends JpaRepository<Office, UUID> {

    boolean existsByOfficeType(OfficeType officeType);

    boolean existsByOfficeEmail(String officeEmail);

    List<Office> findAllByOfficeType(OfficeType officeType);

    List<Office> findAllByOfficeTypeIn(List<OfficeType> officeTypes);

    @Query("SELECT o FROM Office o WHERE o.province.code = :provinceCode AND o.officeType = :officeType")
    List<Office> findAllByProvinceCodeAndOfficeType(@Param("provinceCode") String provinceCode, @Param("officeType") OfficeType officeType);

    @Query("SELECT o FROM Office o WHERE o.province.code = :provinceCode AND o.officeType IN :officeTypes")
    List<Office> findAllByProvinceCodeAndOfficeTypeIn(@Param("provinceCode") String provinceCode, @Param("officeTypes") List<OfficeType> officeTypes);
}
