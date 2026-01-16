package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {

    Optional<Customer> findByAccount(Account account);
    
    Optional<Customer> findByAccountId(UUID accountId);
    
    Optional<Customer> findByPhoneNumber(String phoneNumber);
}
