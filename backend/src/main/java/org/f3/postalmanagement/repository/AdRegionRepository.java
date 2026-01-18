package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.AdministrativeRegion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdRegionRepository extends JpaRepository<AdministrativeRegion, Integer> {
}
