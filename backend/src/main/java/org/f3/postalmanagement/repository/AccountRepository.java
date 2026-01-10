package org.f3.postalmanagement.repository;

import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface AccountRepository extends JpaRepository<Account, UUID> {

    Optional<Account> findByUsername(String username);

    Optional<Account> findByEmail(String email);

    boolean existsByRole(Role role);
}
