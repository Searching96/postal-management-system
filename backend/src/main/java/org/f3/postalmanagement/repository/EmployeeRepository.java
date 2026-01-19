package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByAccount(Account account);

    List<Employee> findByOfficeId(UUID officeId);

    @Query("SELECT e FROM Employee e WHERE e.office.id = :officeId AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.account.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.fullName ASC")
    Page<Employee> findByOfficeIdWithSearch(@Param("officeId") UUID officeId, 
                                             @Param("search") String search, 
                                             Pageable pageable);

    boolean existsByOfficeIdAndId(UUID officeId, UUID employeeId);

    @Query("SELECT e FROM Employee e WHERE e.office.region.id = :regionId AND e.account.role = :role AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.account.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.fullName ASC")
    Page<Employee> findByRegionIdAndRoleWithSearch(@Param("regionId") Integer regionId, 
                                                    @Param("role") Role role,
                                                    @Param("search") String search, 
                                                    Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.office.ward.province.code = :provinceCode " +
           "AND e.account.role = :role " +
           "AND e.office.officeType IN :officeTypes " +
           "AND (:search IS NULL OR :search = '' " +
           "OR LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(e.account.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
       "ORDER BY e.fullName ASC")
Page<Employee> findByProvinceCodeAndRoleAndOfficeTypesWithSearch(
       @Param("provinceCode") String provinceCode,
       @Param("role") Role role,
       @Param("officeTypes") List<OfficeType> officeTypes,
       @Param("search") String search,
       Pageable pageable
);

    @Query("SELECT e FROM Employee e WHERE e.office.id = :officeId AND e.account.role = :role AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.account.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.fullName ASC")
    Page<Employee> findByOfficeIdAndRoleWithSearch(@Param("officeId") UUID officeId, 
                                                    @Param("role") Role role,
                                                    @Param("search") String search, 
                                                    Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE e.office.ward.province.code = :provinceCode AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(e.fullName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(e.account.email) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY e.fullName ASC")
    Page<Employee> findByProvinceCodeWithSearch(@Param("provinceCode") String provinceCode,
                                                @Param("search") String search,
                                                Pageable pageable);
    @Query("SELECT e FROM Employee e WHERE LOWER(e.phoneNumber) LIKE LOWER(CONCAT('%', :phone, '%'))")
    Page<Employee> findByPhoneNumberContaining(@Param("phone") String phone, Pageable pageable);
}
