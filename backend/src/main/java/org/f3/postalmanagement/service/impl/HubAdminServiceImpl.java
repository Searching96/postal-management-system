package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.hub.RegisterHubAdminRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.service.IHubAdminService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Slf4j
@RequiredArgsConstructor
public class HubAdminServiceImpl implements IHubAdminService {

    private final AccountRepository accountRepository;
    private final EmployeeRepository employeeRepository;
    private final OfficeRepository officeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse registerHubAdmin(RegisterHubAdminRequest request, Account currentAccount) {
        // Validate the office exists and is a HUB
        Office targetOffice = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> new IllegalArgumentException("Office not found with ID: " + request.getOfficeId()));

        if (targetOffice.getOfficeType() != OfficeType.HUB) {
            throw new IllegalArgumentException("The specified office is not a HUB. Cannot register HUB admin for non-HUB office.");
        }

        // Check authorization based on current user's role
        validateAuthorization(currentAccount, targetOffice);

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
        newAccount.setRole(Role.HUB_ADMIN);
        newAccount.setActive(true);
        Account savedAccount = accountRepository.save(newAccount);

        // Create employee
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(request.getFullName());
        employee.setPhoneNumber(request.getPhoneNumber());
        employee.setOffice(targetOffice);
        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Registered new HUB_ADMIN: {} for office: {}", request.getPhoneNumber(), targetOffice.getOfficeName());

        return EmployeeResponse.builder()
                .employeeId(savedEmployee.getId())
                .fullName(savedEmployee.getFullName())
                .phoneNumber(savedEmployee.getPhoneNumber())
                .email(savedAccount.getEmail())
                .role(savedAccount.getRole().name())
                .officeName(targetOffice.getOfficeName())
                .build();
    }

    private void validateAuthorization(Account currentAccount, Office targetOffice) {
        Role currentRole = currentAccount.getRole();

        // SYSTEM_ADMIN can register HUB admin for any region
        if (currentRole == Role.SYSTEM_ADMIN) {
            log.debug("SYSTEM_ADMIN authorized to register HUB admin for any region");
            return;
        }

        // HUB_ADMIN can only register for their own region
        if (currentRole == Role.HUB_ADMIN) {
            // Get the employee record of the current HUB_ADMIN to find their office/region
            Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Employee record not found for current user"));

            Office currentOffice = currentEmployee.getOffice();
            
            // Check if both offices belong to the same region
            if (!currentOffice.getRegion().getId().equals(targetOffice.getRegion().getId())) {
                log.warn("HUB_ADMIN {} attempted to register admin for different region. Current region: {}, Target region: {}",
                        currentAccount.getUsername(),
                        currentOffice.getRegion().getName(),
                        targetOffice.getRegion().getName());
                throw new AccessDeniedException("You can only register HUB admins for your own region");
            }

            log.debug("HUB_ADMIN authorized to register HUB admin for their own region: {}", currentOffice.getRegion().getName());
            return;
        }

        // Other roles are not authorized
        throw new AccessDeniedException("You are not authorized to register HUB admins");
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OfficeResponse> getProvinceOfficesByRegion(String search, Pageable pageable, Account currentAccount) {
        Page<Office> officePage;
        List<OfficeType> provinceOfficeTypes = List.of(OfficeType.PROVINCE_WAREHOUSE, OfficeType.PROVINCE_POST);

        if (currentAccount.getRole() == Role.SYSTEM_ADMIN) {
            // SYSTEM_ADMIN sees all province offices
            officePage = officeRepository.findAllByOfficeTypeInWithSearch(
                    provinceOfficeTypes, search, pageable);
        } else {
            // HUB_ADMIN sees only offices in their region
            Employee currentEmployee = getCurrentEmployee(currentAccount);
            Integer regionId = currentEmployee.getOffice().getRegion().getId();
            officePage = officeRepository.findByRegionIdAndOfficeTypeInWithSearch(
                    regionId, provinceOfficeTypes, search, pageable);
            
            log.info("Fetched page {} of province offices for region {} with search '{}' (total: {})", 
                    pageable.getPageNumber(), regionId, search, officePage.getTotalElements());
        }

        Page<OfficeResponse> responsePage = officePage.map(this::mapToOfficeResponse);
        return mapToPageResponse(responsePage);
    }

    private Employee getCurrentEmployee(Account currentAccount) {
        return employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee record not found for current user"));
    }

    private OfficeResponse mapToOfficeResponse(Office office) {
        return OfficeResponse.builder()
                .officeId(office.getId())
                .officeName(office.getOfficeName())
                .officeEmail(office.getOfficeEmail())
                .officePhoneNumber(office.getOfficePhoneNumber())
                .officeAddressLine1(office.getOfficeAddressLine1())
                .officeType(office.getOfficeType().name())
                .provinceCode(office.getProvince() != null ? office.getProvince().getCode() : null)
                .provinceName(office.getProvince() != null ? office.getProvince().getName() : null)
                .regionName(office.getRegion() != null ? office.getRegion().getName() : null)
                .parentOfficeId(office.getParent() != null ? office.getParent().getId() : null)
                .parentOfficeName(office.getParent() != null ? office.getParent().getOfficeName() : null)
                .capacity(office.getCapacity())
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
