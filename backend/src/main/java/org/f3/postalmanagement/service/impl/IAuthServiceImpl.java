package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.auth.CustomerRegisterRequest;
import org.f3.postalmanagement.dto.response.auth.AuthResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.jwt.JwtUtil;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.CustomerRepository;
import org.f3.postalmanagement.service.IAuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@Slf4j
@RequiredArgsConstructor
public class IAuthServiceImpl implements IAuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final AccountRepository accountRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public AuthResponse login(String username, String password) {
        log.info("Login attempt for username: {}", username);

        Optional<Account> account = accountRepository.findByUsername(username);

        if (account.isEmpty()) {
            log.error("Username not found: {}", username);
            throw new BadCredentialsException("Invalid username or password.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        String token = jwtUtil.generateToken(userDetails);

        log.info("Login successful for username: {}", username);
        return AuthResponse.builder()
                .token(token)
                .build();
    }

    @Override
    @Transactional
    public void register(CustomerRegisterRequest request) {
        log.info("Register new customer with username: {}", request.getUsername());

        // Check if username already exists
        if (accountRepository.findByUsername(request.getUsername()).isPresent()) {
            log.error("Username already exists with phone number: {}", request.getUsername());
            throw new IllegalArgumentException("Username already exists as phone number already exists");
        }

        // Create account
        Account account = new Account();
        account.setUsername(request.getUsername());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setEmail(request.getEmail());
        account.setRole(Role.CUSTOMER);
        account.setActive(true);
        account = accountRepository.save(account);

        // Create customer
        Customer customer = new Customer();
        customer.setAccount(account);
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getUsername()); // Phone number is the username
        customer.setAddress(request.getAddress());
        customerRepository.save(customer);

        log.info("Customer registered successfully: {}", request.getUsername());
    }
}
