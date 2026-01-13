package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.CreateWardEmployeeRequest;
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

import java.util.Set;

@Service
@Slf4j
@RequiredArgsConstructor
public class WardManagerServiceImpl implements IWardManagerService {

    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse createEmployee(CreateWardEmployeeRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();
        Role targetRole = request.getRole();

        // Validate that only WARD_MANAGERs can use this service
        if (currentRole != Role.WH_WARD_MANAGER && currentRole != Role.PO_WARD_MANAGER) {
            log.error("Only WARD_MANAGERs can use this service. Current role: {}", currentRole);
            throw new AccessDeniedException("Only Ward Managers can create employees through this service");
        }

        // Validate role permissions
        validateRolePermission(currentRole, targetRole);

        // Get current employee's office (ward managers always work in an office)
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user: {}", currentAccount.getUsername());
                    return new IllegalArgumentException("Employee record not found for current user");
                });

        Office currentOffice = currentEmployee.getOffice();
        if (currentOffice == null) {
            log.error("Ward manager has no assigned office: {}", currentAccount.getUsername());
            throw new IllegalArgumentException("Ward manager has no assigned office");
        }

        // Validate office type matches role
        validateOfficeTypeForRole(targetRole, currentOffice.getOfficeType());

        // Check if username (phone number) already exists
        if (accountRepository.existsByUsername(request.getPhoneNumber())) {
            log.error("Phone number already registered: {}", request.getPhoneNumber());
            throw new IllegalArgumentException("Phone number already registered: " + request.getPhoneNumber());
        }

        // Check if email already exists
        if (accountRepository.existsByEmail(request.getEmail())) {
            log.error("Email already registered: {}", request.getEmail());
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        // Create account
        Account newAccount = new Account();
        newAccount.setUsername(request.getPhoneNumber());
        newAccount.setPassword(passwordEncoder.encode(request.getPassword()));
        newAccount.setEmail(request.getEmail());
        newAccount.setRole(targetRole);
        newAccount.setActive(true);
        Account savedAccount = accountRepository.save(newAccount);

        // Create employee in the same office as the ward manager
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setOffice(currentOffice);
        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Created new employee {} with role {} for office {} by Ward Manager {}",
                request.getPhoneNumber(), targetRole, currentOffice.getOfficeName(), currentAccount.getUsername());

        return EmployeeResponse.builder()
                .employeeId(savedEmployee.getId())
                .fullName(savedEmployee.getFullName())
                .phoneNumber(savedEmployee.getPhoneNumber())
                .email(savedAccount.getEmail())
                .role(savedAccount.getRole().name())
                .officeName(currentOffice.getOfficeName())
                .build();
    }

    /**
     * Validate that the current role can create the target role.
     * 
     * PO_WARD_MANAGER can create: PO_WARD_MANAGER, PO_STAFF (same office only)
     * WH_WARD_MANAGER can create: WH_WARD_MANAGER, WH_STAFF (same office only)
     */
    private void validateRolePermission(Role currentRole, Role targetRole) {
        Set<Role> allowedRolesForPOWardManager = Set.of(Role.PO_WARD_MANAGER, Role.PO_STAFF);
        Set<Role> allowedRolesForWHWardManager = Set.of(Role.WH_WARD_MANAGER, Role.WH_STAFF);

        if (currentRole == Role.PO_WARD_MANAGER) {
            if (!allowedRolesForPOWardManager.contains(targetRole)) {
                log.error("PO_WARD_MANAGER cannot create role: {}", targetRole);
                throw new AccessDeniedException("PO_WARD_MANAGER can only create PO_WARD_MANAGER or PO_STAFF");
            }
        } else if (currentRole == Role.WH_WARD_MANAGER) {
            if (!allowedRolesForWHWardManager.contains(targetRole)) {
                log.error("WH_WARD_MANAGER cannot create role: {}", targetRole);
                throw new AccessDeniedException("WH_WARD_MANAGER can only create WH_WARD_MANAGER or WH_STAFF");
            }
        }
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
