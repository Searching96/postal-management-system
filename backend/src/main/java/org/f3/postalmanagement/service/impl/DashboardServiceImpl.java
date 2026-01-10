package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.user.RegisterSystemAdminRequest;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.service.IDashboardService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class DashboardServiceImpl implements IDashboardService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void registerNewAdmin(RegisterSystemAdminRequest request) {
        validateRequest(request);

        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());
        account.setRole(Role.SYSTEM_ADMIN);
        account.setActive(true);
        accountRepository.save(account);

        log.info("Admin registered successfully: {}", request.getUsername());
    }

    private void validateRequest(RegisterSystemAdminRequest request) {
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            log.error("Username already exists: {}", request.getUsername());
            throw new IllegalArgumentException("Username already exists");
        }

        if (accountRepository.findByEmail(request.getEmail()).isPresent()) {
            log.error("Email already exists: {}", request.getEmail());
            throw new IllegalArgumentException("Email already exists");
        }
    }
}
