package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.AdministrativeUnit;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdUnitRepository extends JpaRepository<AdministrativeUnit, Integer> {
}
