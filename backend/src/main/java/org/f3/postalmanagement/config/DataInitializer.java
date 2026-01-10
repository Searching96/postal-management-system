package org.f3.postalmanagement.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        initSystemAdmin();
    }

    private void initSystemAdmin() {
        if (accountRepository.existsByRole(Role.SYSTEM_ADMIN)) {
            log.debug("Exist super admin account.");
        } else {
            Account account = new Account();
            account.setUsername("0000000000");
            account.setPassword(passwordEncoder.encode("123456"));
            account.setRole(Role.SYSTEM_ADMIN);
            account.setEmail("sadmin@f3postal.com");
            account.setActive(true);
            accountRepository.save(account);
            log.info("Created super admin account.");
        }
    }
}
