package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.administrative.Ward;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WardRepository extends JpaRepository<Ward, String> {

    List<Ward> findByProvince_Code(String provinceCode);

    Page<Ward> findByProvince_CodeOrderByNameAsc(String provinceCode, Pageable pageable);

    @Query("SELECT w FROM Ward w " +
           "LEFT JOIN WardOfficeAssignment a ON a.ward = w AND a.deletedAt IS NULL " +
           "WHERE w.province.code = :provinceCode " +
           "AND (:search IS NULL OR LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "                     OR LOWER(w.code) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:status = 'all' " +
           "     OR (:status = 'assigned' AND a.id IS NOT NULL) " +
           "     OR (:status = 'unassigned' AND a.id IS NULL)) " +
           "GROUP BY w")
       Page<Ward> searchByProvinceCodeAndNameOrCodeAndStatus(
              @Param("provinceCode") String provinceCode,
              @Param("search") String search,
              @Param("status") String status,
              Pageable pageable
              );

    @Query("SELECT w FROM Ward w " +
           "WHERE w.province.code = :provinceCode " +
           "AND (:search IS NULL OR LOWER(w.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "                     OR LOWER(w.code) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ward> searchByProvinceCodeAndNameOrCode(
            @Param("provinceCode") String provinceCode,
            @Param("search") String search,
            Pageable pageable
    );
}