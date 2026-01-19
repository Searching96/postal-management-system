package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.CreateShipperRequest;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.service.IShipperService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class ShipperServiceImpl implements IShipperService {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final OfficeRepository officeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse createShipper(CreateShipperRequest request, Account currentAccount) {
        validateWarehouseRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);

        // Validate the target office exists and is a warehouse
        Office targetOffice = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new IllegalArgumentException("Office not found with ID: " + request.getOfficeId()));

        // Validate office is a warehouse or post office type
        if (targetOffice.getOfficeType() != OfficeType.PROVINCE_WAREHOUSE && 
            targetOffice.getOfficeType() != OfficeType.WARD_WAREHOUSE &&
            targetOffice.getOfficeType() != OfficeType.PROVINCE_POST &&
            targetOffice.getOfficeType() != OfficeType.WARD_POST) {
            throw new IllegalArgumentException("Shippers can only be assigned to warehouse or post office units");
        }

        // Validate access based on role
        validateOfficeAccess(currentAccount.getRole(), currentEmployee, targetOffice);

        // Check if username (phone number) already exists
        if (accountRepository.existsByUsername(request.getPhoneNumber())) {
            throw new IllegalArgumentException("Phone number already registered: " + request.getPhoneNumber());
        }

        // Check if email already exists
        if (accountRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered: " + request.getEmail());
        }

        // Create account
        Account newAccount = new Account();
        newAccount.setUsername(request.getPhoneNumber());
        newAccount.setPassword(passwordEncoder.encode(request.getPassword()));
        newAccount.setEmail(request.getEmail());
        newAccount.setRole(Role.SHIPPER);
        newAccount.setActive(true);
        Account savedAccount = accountRepository.save(newAccount);

        // Create employee
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setOffice(targetOffice);
        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Created shipper {} for office {} by {}", 
                request.getPhoneNumber(), targetOffice.getOfficeName(), currentAccount.getUsername());

        return mapToEmployeeResponse(savedEmployee);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EmployeeResponse> getShippers(String search, Pageable pageable, Account currentAccount) {
        validateWarehouseRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Role role = currentAccount.getRole();

        Page<Employee> shipperPage;

        if (role == Role.HUB_ADMIN) {
            // HUB_ADMIN: Get all shippers in the region
            Integer regionId = currentEmployee.getOffice().getRegion().getId();
            shipperPage = employeeRepository.findByRegionIdAndRoleWithSearch(
                    regionId, Role.SHIPPER, search, pageable);
            log.info("Fetched page {} of shippers for region {} (total: {})", 
                    pageable.getPageNumber(), regionId, shipperPage.getTotalElements());
        } else if (role == Role.WH_PROVINCE_ADMIN || role == Role.PO_PROVINCE_ADMIN) {
            // WH_PROVINCE_ADMIN or PO_PROVINCE_ADMIN: Get all shippers in the province's warehouses and post offices
            String provinceCode = currentEmployee.getOffice().getProvince().getCode();
            List<OfficeType> allOfficeTypes = List.of(
                OfficeType.PROVINCE_WAREHOUSE, OfficeType.WARD_WAREHOUSE,
                OfficeType.PROVINCE_POST, OfficeType.WARD_POST
            );
            shipperPage = employeeRepository.findByProvinceCodeAndRoleAndOfficeTypesWithSearch(
                    provinceCode, Role.SHIPPER, allOfficeTypes, search, pageable);
            log.info("Fetched page {} of shippers for province {} (total: {})", 
                    pageable.getPageNumber(), provinceCode, shipperPage.getTotalElements());
        } else if (role == Role.WH_WARD_MANAGER || role == Role.PO_WARD_MANAGER || role == Role.PO_STAFF) {
            // Ward Manager or Staff: Get all shippers in their own office
            UUID officeId = currentEmployee.getOffice().getId();
            shipperPage = employeeRepository.findByOfficeIdAndRoleWithSearch(
                    officeId, Role.SHIPPER, search, pageable);
            log.info("Fetched page {} of shippers for office {} (total: {})", 
                    pageable.getPageNumber(), officeId, shipperPage.getTotalElements());
        } else {
            throw new AccessDeniedException("Unauthorized to view shippers for this scope");
        }

        Page<EmployeeResponse> responsePage = shipperPage.map(this::mapToEmployeeResponse);
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public EmployeeResponse getShipperById(UUID shipperId, Account currentAccount) {
        validateWarehouseRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);

        Employee shipper = employeeRepository.findById(shipperId)
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found with ID: " + shipperId));

        // Validate the employee is actually a shipper
        if (shipper.getAccount().getRole() != Role.SHIPPER) {
            throw new IllegalArgumentException("Employee is not a shipper");
        }

        // Validate access based on role
        validateShipperAccess(currentAccount.getRole(), currentEmployee, shipper, "view");

        return mapToEmployeeResponse(shipper);
    }

    @Override
    @Transactional
    public EmployeeResponse updateShipper(UUID shipperId, UpdateStaffRequest request, Account currentAccount) {
        validateWarehouseRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);

        Employee shipper = employeeRepository.findById(shipperId)
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found with ID: " + shipperId));

        // Validate the employee is actually a shipper
        if (shipper.getAccount().getRole() != Role.SHIPPER) {
            throw new IllegalArgumentException("Employee is not a shipper");
        }

        // Validate access based on role
        validateShipperAccess(currentAccount.getRole(), currentEmployee, shipper, "update");

        // Update fields if provided
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            shipper.setFullName(request.getFullName());
        }

        if (request.getPhoneNumber() != null && !request.getPhoneNumber().isBlank()) {
            if (!shipper.getPhoneNumber().equals(request.getPhoneNumber()) 
                    && accountRepository.existsByUsername(request.getPhoneNumber())) {
                throw new IllegalArgumentException("Phone number already registered: " + request.getPhoneNumber());
            }
            shipper.setPhoneNumber(request.getPhoneNumber());
            shipper.getAccount().setUsername(request.getPhoneNumber());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            if (!shipper.getAccount().getEmail().equals(request.getEmail()) 
                    && accountRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("Email already registered: " + request.getEmail());
            }
            shipper.getAccount().setEmail(request.getEmail());
        }

        if (request.getActive() != null) {
            shipper.getAccount().setActive(request.getActive());
        }

        Employee savedShipper = employeeRepository.save(shipper);
        log.info("Updated shipper {} by {}", shipperId, currentAccount.getUsername());

        return mapToEmployeeResponse(savedShipper);
    }

    @Override
    @Transactional
    public void deleteShipper(UUID shipperId, Account currentAccount) {
        validateWarehouseRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);

        Employee shipper = employeeRepository.findById(shipperId)
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found with ID: " + shipperId));

        // Validate the employee is actually a shipper
        if (shipper.getAccount().getRole() != Role.SHIPPER) {
            throw new IllegalArgumentException("Employee is not a shipper");
        }

        // Validate access based on role
        validateShipperAccess(currentAccount.getRole(), currentEmployee, shipper, "delete");

        // Soft delete
        employeeRepository.delete(shipper);
        shipper.getAccount().setActive(false);
        accountRepository.save(shipper.getAccount());

        log.info("Deleted shipper {} by {}", shipperId, currentAccount.getUsername());
    }

    private void validateWarehouseRole(Account currentAccount) {
        Role role = currentAccount.getRole();
        if (role != Role.HUB_ADMIN && role != Role.WH_PROVINCE_ADMIN && role != Role.WH_WARD_MANAGER &&
            role != Role.PO_PROVINCE_ADMIN && role != Role.PO_WARD_MANAGER && role != Role.PO_STAFF &&
            role != Role.WH_STAFF) {
            throw new AccessDeniedException("Only authorized office staff can manage shippers");
        }
    }

    private void validateOfficeAccess(Role role, Employee currentEmployee, Office targetOffice) {
        if (role == Role.HUB_ADMIN) {
            // HUB_ADMIN: Target office must be in the same region
            if (!targetOffice.getRegion().getId().equals(currentEmployee.getOffice().getRegion().getId())) {
                throw new AccessDeniedException("You can only create shippers for offices in your region");
            }
        } else if (role == Role.WH_PROVINCE_ADMIN) {
            // WH_PROVINCE_ADMIN: Target office must be in the same province
            if (!targetOffice.getProvince().getCode().equals(currentEmployee.getOffice().getProvince().getCode())) {
                throw new AccessDeniedException("You can only create shippers for offices in your province");
            }
        } else if (role == Role.WH_WARD_MANAGER || role == Role.PO_WARD_MANAGER) {
            // Ward Manager: Target office must be the same as current office
            if (!targetOffice.getId().equals(currentEmployee.getOffice().getId())) {
                throw new AccessDeniedException("You can only create shippers for your own office");
            }
        } else if (role == Role.WH_PROVINCE_ADMIN || role == Role.PO_PROVINCE_ADMIN) {
             // Province Admin: Target office must be in the same province
            if (!targetOffice.getProvince().getCode().equals(currentEmployee.getOffice().getProvince().getCode())) {
                throw new AccessDeniedException("You can only create shippers for offices in your province");
            }
        }
    }

    private void validateShipperAccess(Role role, Employee currentEmployee, Employee shipper, String action) {
        if (role == Role.HUB_ADMIN) {
            // HUB_ADMIN: Shipper must be in the same region
            if (!shipper.getOffice().getRegion().getId().equals(currentEmployee.getOffice().getRegion().getId())) {
                throw new AccessDeniedException("You can only " + action + " shippers in your region");
            }
        } else if (role == Role.WH_PROVINCE_ADMIN) {
            // WH_PROVINCE_ADMIN: Shipper must be in the same province
            if (!shipper.getOffice().getProvince().getCode().equals(currentEmployee.getOffice().getProvince().getCode())) {
                throw new AccessDeniedException("You can only " + action + " shippers in your province");
            }
        } else if (role == Role.WH_WARD_MANAGER || role == Role.PO_WARD_MANAGER || role == Role.PO_STAFF) {
            // Office-level: Shipper must be in the same office
            if (!shipper.getOffice().getId().equals(currentEmployee.getOffice().getId())) {
                throw new AccessDeniedException("You can only " + action + " shippers in your office");
            }
        } else if (role == Role.WH_PROVINCE_ADMIN || role == Role.PO_PROVINCE_ADMIN) {
            // Province Admin: Shipper must be in the same province
            if (!shipper.getOffice().getProvince().getCode().equals(currentEmployee.getOffice().getProvince().getCode())) {
                throw new AccessDeniedException("You can only " + action + " shippers in your province");
            }
        }
    }

    private Employee getCurrentEmployee(Account currentAccount) {
        return employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee record not found for current user"));
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
