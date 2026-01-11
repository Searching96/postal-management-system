package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface OfficeRepository extends JpaRepository<Office, UUID> {

    boolean existsByOfficeType(OfficeType officeType);
    
    List<Office> findAllByOfficeType(OfficeType officeType);
}
