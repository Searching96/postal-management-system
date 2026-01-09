package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
}
