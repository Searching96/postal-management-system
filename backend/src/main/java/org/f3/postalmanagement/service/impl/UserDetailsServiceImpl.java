package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.exception.AccountNotFoundException;
import org.f3.postalmanagement.repository.AccountRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final AccountRepository accountRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws AccountNotFoundException {
        Account account = accountRepository.findByUsername(username)
                .orElseThrow(() -> {
                    log.error("User not found: {}", username);
                    return new AccountNotFoundException("User not found: " + username);
                });

        return new CustomUserDetails(account);
    }

    public CustomUserDetails loadUserById(UUID id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with id: {}", id);
                    return new AccountNotFoundException("User not found with id: " + id);
                });

        return new CustomUserDetails(account);
    }
}
