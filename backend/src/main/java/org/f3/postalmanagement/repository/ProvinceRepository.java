package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.Province;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProvinceRepository extends JpaRepository<Province, String> {

    List<Province> findByAdministrativeRegion_Id(Integer regionId);
}
