package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface WardRepository extends JpaRepository<Ward, String> {

    List<Ward> findByProvince_Code(String provinceCode);
}
