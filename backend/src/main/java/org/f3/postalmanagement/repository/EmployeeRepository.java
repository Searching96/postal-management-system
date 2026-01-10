package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Employee;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
}
