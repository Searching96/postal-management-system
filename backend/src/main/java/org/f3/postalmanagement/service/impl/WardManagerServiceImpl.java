package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardManagerEmployeeRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardStaffRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.service.IWardManagerService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
@RequiredArgsConstructor
public class WardManagerServiceImpl implements IWardManagerService {

    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse createStaff(CreateWardStaffRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();

        // Determine target role based on current role
        Role targetRole = determineStaffRole(currentRole);

        // Get current employee's office
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        // Validate office type matches role
        validateOfficeTypeForRole(targetRole, currentOffice.getOfficeType());

        return createEmployeeInternal(
                request.getFullName(),
                request.getPhoneNumber(),
                request.getPassword(),
                request.getEmail(),
                targetRole,
                currentOffice,
                currentAccount
        );
    }

    @Override
    @Transactional
    public EmployeeResponse createWardManager(CreateWardManagerEmployeeRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();

        // Validate that only WARD_MANAGERs can use this method
        if (currentRole != Role.WH_WARD_MANAGER && currentRole != Role.PO_WARD_MANAGER) {
            log.error("Only WARD_MANAGERs can create ward managers. Current role: {}", currentRole);
            throw new AccessDeniedException("Only Ward Managers can create other Ward Managers");
        }

        // Target role is the same as current role (WH_WARD_MANAGER creates WH_WARD_MANAGER, etc.)
        Role targetRole = currentRole;

        // Get current employee's office
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        // Validate office type matches role
        validateOfficeTypeForRole(targetRole, currentOffice.getOfficeType());

        return createEmployeeInternal(
                request.getFullName(),
                request.getPhoneNumber(),
                request.getPassword(),
                request.getEmail(),
                targetRole,
                currentOffice,
                currentAccount
        );
    }

    /**
     * Determine the staff role based on the current ward manager's role.
     */
    private Role determineStaffRole(Role currentRole) {
        return switch (currentRole) {
            case PO_WARD_MANAGER -> Role.PO_STAFF;
            case WH_WARD_MANAGER -> Role.WH_STAFF;
            default -> throw new IllegalArgumentException("Cannot determine staff role for: " + currentRole);
        };
    }

    /**
     * Get the current employee record.
     */
    private Employee getCurrentEmployee(Account currentAccount) {
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user: {}", currentAccount.getUsername());
                    return new IllegalArgumentException("Employee record not found for current user");
                });

        if (currentEmployee.getOffice() == null) {
            log.error("Ward manager has no assigned office: {}", currentAccount.getUsername());
            throw new IllegalArgumentException("Ward manager has no assigned office");
        }

        return currentEmployee;
    }

    /**
     * Internal method to create an employee.
     */
    private EmployeeResponse createEmployeeInternal(
            String fullName,
            String phoneNumber,
            String password,
            String email,
            Role targetRole,
            Office targetOffice,
            Account currentAccount
    ) {
        // Check if username (phone number) already exists
        if (accountRepository.existsByUsername(phoneNumber)) {
            log.error("Phone number already registered: {}", phoneNumber);
            throw new IllegalArgumentException("Phone number already registered: " + phoneNumber);
        }

        // Check if email already exists
        if (accountRepository.existsByEmail(email)) {
            log.error("Email already registered: {}", email);
            throw new IllegalArgumentException("Email already registered: " + email);
        }

        // Create account
        Account newAccount = new Account();
        newAccount.setUsername(phoneNumber);
        newAccount.setPassword(passwordEncoder.encode(password));
        newAccount.setEmail(email);
        newAccount.setRole(targetRole);
        newAccount.setActive(true);
        Account savedAccount = accountRepository.save(newAccount);

        // Create employee in the same office as the ward manager
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(fullName);
        employee.setPhoneNumber(phoneNumber);
        employee.setOffice(targetOffice);
        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Created new employee {} with role {} for office {} by Ward Manager {}",
                phoneNumber, targetRole, targetOffice.getOfficeName(), currentAccount.getUsername());

        return EmployeeResponse.builder()
                .employeeId(savedEmployee.getId())
                .fullName(savedEmployee.getFullName())
                .phoneNumber(savedEmployee.getPhoneNumber())
                .email(savedAccount.getEmail())
                .role(savedAccount.getRole().name())
                .officeName(targetOffice.getOfficeName())
                .build();
    }

    /**
     * Validate that the office type matches the role being assigned.
     * 
     * PO_WARD_MANAGER, PO_STAFF -> WARD_POST
     * WH_WARD_MANAGER, WH_STAFF -> WARD_WAREHOUSE
     */
    private void validateOfficeTypeForRole(Role role, OfficeType officeType) {
        boolean isValid = switch (role) {
            case PO_WARD_MANAGER, PO_STAFF -> officeType == OfficeType.WARD_POST;
            case WH_WARD_MANAGER, WH_STAFF -> officeType == OfficeType.WARD_WAREHOUSE;
            default -> false;
        };

        if (!isValid) {
            log.error("Role {} cannot be assigned to office type {}", role, officeType);
            throw new IllegalArgumentException(
                    String.format("Role %s cannot be assigned to office of type %s", role, officeType)
            );
        }
    }
}
