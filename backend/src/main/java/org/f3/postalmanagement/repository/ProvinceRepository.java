package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.Province;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProvinceRepository extends JpaRepository<Province, String> {

    Optional<Province> findByCode(String code);

    List<Province> findByAdministrativeRegion_Id(Integer regionId);

    Page<Province> findAllByOrderByNameAsc(Pageable pageable);

    @Query("SELECT p FROM Province p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.name) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY p.name ASC")
    Page<Province> searchByNameOrCode(@Param("search") String search, Pageable pageable);
}
