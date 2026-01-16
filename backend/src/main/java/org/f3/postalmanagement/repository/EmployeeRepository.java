package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByAccount(Account account);

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
}
