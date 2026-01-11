package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.Ward;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WardRepository extends JpaRepository<Ward, String> {
}
