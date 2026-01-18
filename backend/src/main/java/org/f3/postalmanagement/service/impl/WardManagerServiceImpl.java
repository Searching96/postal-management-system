package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardManagerEmployeeRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.service.IWardManagerService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

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

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getStaffByOffice(String search, Pageable pageable, Account currentAccount) {
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        Page<Employee> employeePage = employeeRepository.findByOfficeIdWithSearch(
                currentOffice.getId(), search, pageable);

        Page<EmployeeResponse> responsePage = employeePage.map(this::mapToEmployeeResponse);
        log.info("Fetched page {} of staff for office {} with search '{}' (total: {})", 
                pageable.getPageNumber(), currentOffice.getOfficeName(), search, employeePage.getTotalElements());

        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getStaffById(UUID staffId, Account currentAccount) {
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        Employee staff = employeeRepository.findById(staffId)
                .orElseThrow(() -> {
                    log.error("Staff not found with ID: {}", staffId);
                    return new IllegalArgumentException("Staff not found with ID: " + staffId);
                });

        // Verify the staff is in the same office
        if (!staff.getOffice().getId().equals(currentOffice.getId())) {
            log.error("Staff {} is not in the same office as the manager", staffId);
            throw new AccessDeniedException("You can only view staff in your own office");
        }

        return mapToEmployeeResponse(staff);
    }

    @Override
    @Transactional
    public EmployeeResponse updateStaff(UUID staffId, UpdateStaffRequest request, Account currentAccount) {
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        Employee staff = employeeRepository.findById(staffId)
                .orElseThrow(() -> {
                    log.error("Staff not found with ID: {}", staffId);
                    return new IllegalArgumentException("Staff not found with ID: " + staffId);
                });

        // Verify the staff is in the same office
        if (!staff.getOffice().getId().equals(currentOffice.getId())) {
            log.error("Staff {} is not in the same office as the manager", staffId);
            throw new AccessDeniedException("You can only update staff in your own office");
        }

        // Update fields if provided
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            staff.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            // Check if the new phone number is already taken by another account
            if (!staff.getPhoneNumber().equals(request.getPhoneNumber()) 
                    && accountRepository.existsByUsername(request.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already registered: " + request.getPhoneNumber());
            }
            staff.setPhoneNumber(request.getPhoneNumber());
            staff.getAccount().setUsername(request.getPhoneNumber());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            // Check if the new email is already taken by another account
            if (!staff.getAccount().getEmail().equals(request.getEmail()) 
                    && accountRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already registered: " + request.getEmail());
            }
            staff.getAccount().setEmail(request.getEmail());
        }

        if (request.getActive() != null) {
            staff.getAccount().setActive(request.getActive());
        }

        Employee savedStaff = employeeRepository.save(staff);
        log.info("Updated staff {} by manager {}", staffId, currentAccount.getUsername());

        return mapToEmployeeResponse(savedStaff);
    }

    @Override
    @Transactional
    public void deleteStaff(UUID staffId, Account currentAccount) {
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office currentOffice = currentEmployee.getOffice();

        Employee staff = employeeRepository.findById(staffId)
                .orElseThrow(() -> {
                    log.error("Staff not found with ID: {}", staffId);
                    return new IllegalArgumentException("Staff not found with ID: " + staffId);
                });

        // Verify the staff is in the same office
        if (!staff.getOffice().getId().equals(currentOffice.getId())) {
            log.error("Staff {} is not in the same office as the manager", staffId);
            throw new AccessDeniedException("You can only delete staff in your own office");
        }

        // Prevent self-deletion
        if (staff.getId().equals(currentEmployee.getId())) {
            throw new IllegalArgumentException("You cannot delete your own account");
        }

        // Soft delete - the @SQLDelete annotation handles this
        employeeRepository.delete(staff);
        // Also deactivate the account
        staff.getAccount().setActive(false);
        accountRepository.save(staff.getAccount());

        log.info("Deleted staff {} by manager {}", staffId, currentAccount.getUsername());
    }

    private EmployeeResponse mapToEmployeeResponse(Employee employee) {
        return EmployeeResponse.builder()
                .employeeId(employee.getId())
                .fullName(employee.getFullName())
                .phoneNumber(employee.getPhoneNumber())
                .email(employee.getAccount().getEmail())
                .role(employee.getAccount().getRole().name())
                .officeName(employee.getOffice().getOfficeName())
                .build();
    }

    private <T> PageResponse<T> mapToPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }
}
