package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.employee.province.CreateProvinceAdminRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateWardManagerRequest;
import org.f3.postalmanagement.dto.request.office.AssignWardsRequest;
import org.f3.postalmanagement.dto.request.office.CreateWardOfficeRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.WardOfficePairResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.OfficePair;
import org.f3.postalmanagement.entity.unit.WardOfficeAssignment;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.repository.AccountRepository;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.OfficePairRepository;
import org.f3.postalmanagement.repository.WardOfficeAssignmentRepository;
import org.f3.postalmanagement.repository.WardRepository;
import org.f3.postalmanagement.service.IProvinceAdminService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@Service
@Slf4j
@RequiredArgsConstructor
public class ProvinceAdminServiceImpl implements IProvinceAdminService {

    private final OfficeRepository officeRepository;
    private final OfficePairRepository officePairRepository;
    private final WardOfficeAssignmentRepository wardOfficeAssignmentRepository;
    private final EmployeeRepository employeeRepository;
    private final AccountRepository accountRepository;
    private final WardRepository wardRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public EmployeeResponse createProvinceAdmin(CreateProvinceAdminRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();
        
        // Determine the target role based on current user's role
        Role targetRole = determineProvinceAdminRole(currentRole);

        // Get current employee's office - new province admin will be created in the same office
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user: {}", currentAccount.getUsername());
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office targetOffice = currentEmployee.getOffice();

        if (targetOffice == null) {
            log.error("Current user has no assigned office: {}", currentAccount.getUsername());
            throw new IllegalArgumentException("Current user has no assigned office");
        }

        // Validate office type matches role
        validateOfficeTypeForProvinceAdmin(targetRole, targetOffice.getOfficeType());

        return createEmployeeInternal(request.getFullName(), request.getPhoneNumber(), request.getPassword(),
                request.getEmail(), targetRole, targetOffice, currentAccount);
    }

    @Override
    @Transactional
    public EmployeeResponse createWardManager(CreateWardManagerRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();
        
        // Determine the target role based on current user's role
        Role targetRole = determineWardManagerRole(currentRole);

        // Get target office
        Office targetOffice = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> {
                    log.error("Office not found with ID: {}", request.getOfficeId());
                    return new IllegalArgumentException("Office not found with ID: " + request.getOfficeId());
                });

        // Validate office type matches role
        validateOfficeTypeForWardManager(targetRole, targetOffice.getOfficeType());

        // Validate province access
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user: {}", currentAccount.getUsername());
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();
        validateProvinceAccess(currentOffice, targetOffice);

        return createEmployeeInternal(request.getFullName(), request.getPhoneNumber(), request.getPassword(),
                request.getEmail(), targetRole, targetOffice, currentAccount);
    }

    @Override
    @Transactional
    public EmployeeResponse createStaff(CreateStaffRequest request, Account currentAccount) {
        Role currentRole = currentAccount.getRole();
        
        // Determine the target role based on current user's role
        Role targetRole = determineStaffRole(currentRole);

        // Get target office
        Office targetOffice = officeRepository.findById(request.getOfficeId())
                .orElseThrow(() -> {
                    log.error("Office not found with ID: {}", request.getOfficeId());
                    return new IllegalArgumentException("Office not found with ID: " + request.getOfficeId());
                });

        // Validate office type matches role
        validateOfficeTypeForStaff(targetRole, targetOffice.getOfficeType());

        // Validate province access
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user: {}", currentAccount.getUsername());
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();
        validateProvinceAccess(currentOffice, targetOffice);

        return createEmployeeInternal(request.getFullName(), request.getPhoneNumber(), request.getPassword(),
                request.getEmail(), targetRole, targetOffice, currentAccount);
    }

    /**
     * Common method to create an employee.
     */
    private EmployeeResponse createEmployeeInternal(String fullName, String phoneNumber, String password,
                                                     String email, Role targetRole, Office targetOffice,
                                                     Account currentAccount) {
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

        // Create employee
        Employee employee = new Employee();
        employee.setAccount(savedAccount);
        employee.setFullName(fullName);
        employee.setPhoneNumber(phoneNumber);
        employee.setOffice(targetOffice);
        Employee savedEmployee = employeeRepository.save(employee);

        log.info("Created new employee {} with role {} for office {} by {}",
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
     * Determine Province Admin role based on current user's role.
     */
    private Role determineProvinceAdminRole(Role currentRole) {
        return switch (currentRole) {
            case PO_PROVINCE_ADMIN -> Role.PO_PROVINCE_ADMIN;
            case WH_PROVINCE_ADMIN -> Role.WH_PROVINCE_ADMIN;
            default -> {
                log.error("User with role {} is not authorized to create province admins", currentRole);
                throw new AccessDeniedException("You are not authorized to create province admins");
            }
        };
    }

    /**
     * Determine Ward Manager role based on current user's role.
     */
    private Role determineWardManagerRole(Role currentRole) {
        return switch (currentRole) {
            case PO_PROVINCE_ADMIN -> Role.PO_WARD_MANAGER;
            case WH_PROVINCE_ADMIN -> Role.WH_WARD_MANAGER;
            default -> {
                log.error("User with role {} is not authorized to create ward managers", currentRole);
                throw new AccessDeniedException("You are not authorized to create ward managers");
            }
        };
    }

    /**
     * Determine Staff role based on current user's role.
     */
    private Role determineStaffRole(Role currentRole) {
        return switch (currentRole) {
            case PO_PROVINCE_ADMIN -> Role.PO_STAFF;
            case WH_PROVINCE_ADMIN -> Role.WH_STAFF;
            default -> {
                log.error("User with role {} is not authorized to create staff", currentRole);
                throw new AccessDeniedException("You are not authorized to create staff");
            }
        };
    }

    /**
     * Validate office type for Province Admin role.
     */
    private void validateOfficeTypeForProvinceAdmin(Role role, OfficeType officeType) {
        boolean isValid = switch (role) {
            case PO_PROVINCE_ADMIN -> officeType == OfficeType.PROVINCE_POST;
            case WH_PROVINCE_ADMIN -> officeType == OfficeType.PROVINCE_WAREHOUSE;
            default -> false;
        };

        if (!isValid) {
            log.error("Role {} cannot be assigned to office type {}", role, officeType);
            throw new IllegalArgumentException(
                    String.format("Province Admin role %s cannot be assigned to office of type %s", role, officeType)
            );
        }
    }

    /**
     * Validate office type for Ward Manager role.
     */
    private void validateOfficeTypeForWardManager(Role role, OfficeType officeType) {
        boolean isValid = switch (role) {
            case PO_WARD_MANAGER -> officeType == OfficeType.WARD_POST;
            case WH_WARD_MANAGER -> officeType == OfficeType.WARD_WAREHOUSE;
            default -> false;
        };

        if (!isValid) {
            log.error("Role {} cannot be assigned to office type {}", role, officeType);
            throw new IllegalArgumentException(
                    String.format("Ward Manager role %s cannot be assigned to office of type %s", role, officeType)
            );
        }
    }

    /**
     * Validate office type for Staff role.
     */
    private void validateOfficeTypeForStaff(Role role, OfficeType officeType) {
        boolean isValid = switch (role) {
            case PO_STAFF -> officeType == OfficeType.PROVINCE_POST || officeType == OfficeType.WARD_POST;
            case WH_STAFF -> officeType == OfficeType.PROVINCE_WAREHOUSE || officeType == OfficeType.WARD_WAREHOUSE;
            default -> false;
        };

        if (!isValid) {
            log.error("Role {} cannot be assigned to office type {}", role, officeType);
            throw new IllegalArgumentException(
                    String.format("Staff role %s cannot be assigned to office of type %s", role, officeType)
            );
        }
    }

    @Override
    @Transactional
    public WardOfficePairResponse createWardOfficePair(CreateWardOfficeRequest request, Account currentAccount) {
        // Province admin - get province from their office
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user");
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();

        if (currentOffice.getProvince() == null) {
            log.error("Current user's office is not associated with a province");
            throw new IllegalArgumentException("Current user's office is not associated with a province");
        }

        String provinceCode;
        if (request.getProvinceCode() != null && !request.getProvinceCode().isBlank()) {
            // Validate that the provided province matches their office's province
            if (!currentOffice.getProvince().getCode().equals(request.getProvinceCode())) {
                log.error("Provided province code does not match current user's office province");
                throw new AccessDeniedException("You can only create offices within your province");
            }
            provinceCode = request.getProvinceCode();
        } else {
            // Use their office's province
            provinceCode = currentOffice.getProvince().getCode();
        }

        // Find the parent PROVINCE_WAREHOUSE in the province
        Office parentWarehouse = officeRepository.findAllByProvinceCodeAndOfficeType(provinceCode, OfficeType.PROVINCE_WAREHOUSE)
                .stream()
                .findFirst()
                .orElseThrow(() -> {
                    log.error("No PROVINCE_WAREHOUSE found in province: " + provinceCode);
                    return new IllegalArgumentException("No PROVINCE_WAREHOUSE found in province: " + provinceCode);
                });

        // Find the parent PROVINCE_POST in the province
        Office parentPostOffice = officeRepository.findAllByProvinceCodeAndOfficeType(provinceCode, OfficeType.PROVINCE_POST)
                .stream()
                .findFirst()
                .orElseThrow(() -> {
                    log.error("No PROVINCE_POST found in province: " + provinceCode);
                    return new IllegalArgumentException("No PROVINCE_POST found in province: " + provinceCode);
                });

        // Check email uniqueness
        if (officeRepository.existsByOfficeEmail(request.getWarehouseEmail())) {
            log.error("Warehouse email already exists: {}", request.getWarehouseEmail());
            throw new IllegalArgumentException("Warehouse email already exists: " + request.getWarehouseEmail());
        }
        if (officeRepository.existsByOfficeEmail(request.getPostOfficeEmail())) {
            log.error("Post office email already exists: {}", request.getPostOfficeEmail());
            throw new IllegalArgumentException("Post office email already exists: " + request.getPostOfficeEmail());
        }

        // Create Ward Warehouse (without ward assignment initially)
        Office wardWarehouse = new Office();
        wardWarehouse.setOfficeName(request.getWarehouseName());
        wardWarehouse.setOfficeEmail(request.getWarehouseEmail());
        wardWarehouse.setOfficePhoneNumber(request.getWarehousePhoneNumber());
        wardWarehouse.setOfficeAddress(request.getWarehouseAddress());
        wardWarehouse.setOfficeType(OfficeType.WARD_WAREHOUSE);
        wardWarehouse.setProvince(parentWarehouse.getProvince());
        wardWarehouse.setRegion(parentWarehouse.getRegion());
        wardWarehouse.setParent(parentWarehouse);
        wardWarehouse.setCapacity(request.getWarehouseCapacity());

        // Create Ward Post Office (without ward assignment initially)
        Office wardPostOffice = new Office();
        wardPostOffice.setOfficeName(request.getPostOfficeName());
        wardPostOffice.setOfficeEmail(request.getPostOfficeEmail());
        wardPostOffice.setOfficePhoneNumber(request.getPostOfficePhoneNumber());
        wardPostOffice.setOfficeAddress(request.getPostOfficeAddress());
        wardPostOffice.setOfficeType(OfficeType.WARD_POST);
        wardPostOffice.setProvince(parentPostOffice.getProvince());
        wardPostOffice.setRegion(parentPostOffice.getRegion());
        wardPostOffice.setParent(parentPostOffice);

        // Save both offices
        Office savedWarehouse = officeRepository.save(wardWarehouse);
        Office savedPostOffice = officeRepository.save(wardPostOffice);

        // Create OfficePair to link warehouse and post office
        OfficePair officePair = new OfficePair();
        officePair.setWhOffice(savedWarehouse);
        officePair.setPoOffice(savedPostOffice);
        OfficePair savedOfficePair = officePairRepository.save(officePair);

        log.info("Created ward office pair - Warehouse: {}, Post Office: {}, PairId: {} by user: {}",
                savedWarehouse.getOfficeName(), savedPostOffice.getOfficeName(), savedOfficePair.getId(), currentAccount.getUsername());

        return mapToWardOfficePairResponse(savedOfficePair, new ArrayList<>());
    }

    @Override
    @Transactional
    public WardOfficePairResponse assignWardsToOfficePair(AssignWardsRequest request, Account currentAccount) {
        // Get the office pair
        OfficePair officePair = officePairRepository.findById(request.getOfficePairId())
                .orElseThrow(() -> {
                    log.error("Office pair not found with ID: {}", request.getOfficePairId());
                    return new IllegalArgumentException("Office pair not found with ID: " + request.getOfficePairId());
                });

        Office wardWarehouse = officePair.getWhOffice();
        Office wardPostOffice = officePair.getPoOffice();

        if (wardWarehouse.getOfficeType() != OfficeType.WARD_WAREHOUSE) {
            log.error("Warehouse office is not a WARD_WAREHOUSE");
            throw new IllegalArgumentException("Warehouse office is not a WARD_WAREHOUSE");
        }

        if (wardPostOffice.getOfficeType() != OfficeType.WARD_POST) {
            log.error("Post office is not a WARD_POST");
            throw new IllegalArgumentException("Post office is not a WARD_POST");
        }

        // Validate province access
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user");
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();
        validateProvinceAccess(currentOffice, wardWarehouse);

        // Validate and collect wards to assign
        List<Ward> wardsToAssign = new ArrayList<>();
        for (String wardCode : request.getWardCodes()) {
            Ward ward = wardRepository.findById(wardCode)
                    .orElseThrow(() -> {
                        log.error("Ward not found with code: {}", wardCode);
                        return new IllegalArgumentException("Ward not found with code: " + wardCode);
                    });

            // Validate ward belongs to the same province
            if (!ward.getProvince().getCode().equals(wardWarehouse.getProvince().getCode())) {
                log.error("Ward {} does not belong to the office's province", wardCode);
                throw new IllegalArgumentException("Ward " + wardCode + " does not belong to the office's province");
            }

            // Check if ward is already assigned to another office pair
            if (wardOfficeAssignmentRepository.existsByWardCode(wardCode)) {
                // Check if it's assigned to this pair (updating) or another pair
                if (!wardOfficeAssignmentRepository.existsByWardCodeAndOfficePairId(wardCode, officePair.getId())) {
                    log.error("Ward {} is already assigned to another office pair", wardCode);
                    throw new IllegalArgumentException("Ward " + wardCode + " is already assigned to another office pair");
                }
            }

            wardsToAssign.add(ward);
        }

        // Get existing assignments for this office pair
        List<WardOfficeAssignment> existingAssignments = wardOfficeAssignmentRepository.findByOfficePairId(officePair.getId());
        List<String> existingWardCodes = existingAssignments.stream()
                .map(a -> a.getWard().getCode())
                .toList();

        // Create new assignments for wards not already assigned
        for (Ward ward : wardsToAssign) {
            if (!existingWardCodes.contains(ward.getCode())) {
                WardOfficeAssignment assignment = new WardOfficeAssignment();
                assignment.setWard(ward);
                assignment.setOfficePair(officePair);
                wardOfficeAssignmentRepository.save(assignment);
            }
        }

        // Soft delete assignments for wards no longer in the list
        List<String> newWardCodes = wardsToAssign.stream().map(Ward::getCode).toList();
        for (WardOfficeAssignment existing : existingAssignments) {
            if (!newWardCodes.contains(existing.getWard().getCode())) {
                wardOfficeAssignmentRepository.delete(existing); // Triggers soft delete via @SQLDelete
            }
        }

        log.info("Assigned {} ward(s) to office pair {} - Warehouse: {}, Post Office: {} by user: {}",
                wardsToAssign.size(), officePair.getId(), wardWarehouse.getOfficeName(), wardPostOffice.getOfficeName(), currentAccount.getUsername());

        return mapToWardOfficePairResponse(officePair, wardsToAssign);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardOfficePairResponse> getWardOfficePairs(Account currentAccount) {
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user");
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();

        if (currentOffice.getProvince() == null) {
            log.error("Current user's office is not associated with a province");
            throw new IllegalArgumentException("Current user's office is not associated with a province");
        }

        String provinceCode = currentOffice.getProvince().getCode();
        List<OfficePair> officePairs = officePairRepository.findAllWardOfficePairsByProvinceCode(provinceCode);

        return officePairs.stream()
                .map(officePair -> {
                    List<WardOfficeAssignment> assignments = wardOfficeAssignmentRepository.findByOfficePairId(officePair.getId());
                    List<Ward> assignedWards = assignments.stream()
                            .map(WardOfficeAssignment::getWard)
                            .collect(toList());
                    return mapToWardOfficePairResponse(officePair, assignedWards);
                })
                .collect(toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WardOfficePairResponse getWardOfficePairById(UUID officePairId, Account currentAccount) {
        OfficePair officePair = officePairRepository.findById(officePairId)
                .orElseThrow(() -> {
                    log.error("Office pair not found with ID: {}", officePairId);
                    return new IllegalArgumentException("Office pair not found with ID: " + officePairId);
                });

        Office warehouse = officePair.getWhOffice();

        if (warehouse.getOfficeType() != OfficeType.WARD_WAREHOUSE) {
            log.error("Office pair does not contain a WARD_WAREHOUSE");
            throw new IllegalArgumentException("Office pair does not contain a WARD_WAREHOUSE");
        }

        // Validate province access
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user");
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();
        validateProvinceAccess(currentOffice, warehouse);

        List<WardOfficeAssignment> assignments = wardOfficeAssignmentRepository.findByOfficePairId(officePair.getId());
        List<Ward> assignedWards = assignments.stream()
                .map(WardOfficeAssignment::getWard)
                .collect(toList());

        return mapToWardOfficePairResponse(officePair, assignedWards);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WardAssignmentInfo> getAvailableWardsForAssignment(Account currentAccount, String provinceCode) {
        Employee currentEmployee = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> {
                    log.error("Employee record not found for current user");
                    return new IllegalArgumentException("Employee record not found for current user");
                });
        Office currentOffice = currentEmployee.getOffice();

        if (currentOffice.getProvince() == null) {
            log.error("Current user's office is not associated with a province");
            throw new IllegalArgumentException("Current user's office is not associated with a province");
        }

        String targetProvinceCode = currentOffice.getProvince().getCode();

        // Optional: validate provinceCode parameter matches user's province if provided
        if (provinceCode != null && !provinceCode.isBlank() && !provinceCode.equals(targetProvinceCode)) {
            log.error("Province code mismatch: provided {} but user belongs to {}", provinceCode, targetProvinceCode);
            throw new IllegalArgumentException("You can only view wards in your province");
        }

        // Get all wards in the province
        List<Ward> wards = wardRepository.findByProvince_Code(targetProvinceCode);

        // Get all ward office pairs in the province
//        List<OfficePair> officePairs = officePairRepository.findAllWardOfficePairsByProvinceCode(targetProvinceCode);

        // Get all ward assignments in the province
        List<WardOfficeAssignment> allAssignments = wardOfficeAssignmentRepository.findAllByProvinceCode(targetProvinceCode);

        return wards.stream()
                .map(ward -> {
                    // Find assignment for this ward
                    WardOfficeAssignment assignment = allAssignments.stream()
                            .filter(a -> a.getWard().getCode().equals(ward.getCode()))
                            .findFirst()
                            .orElse(null);

                    OfficePair assignedPair = assignment != null ? assignment.getOfficePair() : null;

                    return new WardAssignmentInfo(
                            ward.getCode(),
                            ward.getName(),
                            assignment != null,
                            assignedPair != null ? assignedPair.getWhOffice().getId() : null,
                            assignedPair != null ? assignedPair.getPoOffice().getId() : null
                    );
                })
                .collect(toList());
    }

    private void validateProvinceAccess(Office currentOffice, Office targetOffice) {
        if (currentOffice.getProvince() == null || targetOffice.getProvince() == null) {
            log.error("Province information not available for validation");
            throw new AccessDeniedException("Province information not available for validation");
        }

        if (!currentOffice.getProvince().getCode().equals(targetOffice.getProvince().getCode())) {
            log.error("You can only manage offices within your province");
            throw new AccessDeniedException("You can only manage offices within your province");
        }
    }

    private WardOfficePairResponse mapToWardOfficePairResponse(OfficePair officePair, List<Ward> assignedWards) {
        Office warehouse = officePair.getWhOffice();
        Office postOffice = officePair.getPoOffice();

        WardOfficePairResponse.OfficeInfo warehouseInfo = WardOfficePairResponse.OfficeInfo.builder()
                .officeId(warehouse.getId())
                .officeName(warehouse.getOfficeName())
                .officeEmail(warehouse.getOfficeEmail())
                .officePhoneNumber(warehouse.getOfficePhoneNumber())
                .officeAddress(warehouse.getOfficeAddress())
                .officeType(warehouse.getOfficeType().name())
                .parentOfficeId(warehouse.getParent() != null ? warehouse.getParent().getId() : null)
                .parentOfficeName(warehouse.getParent() != null ? warehouse.getParent().getOfficeName() : null)
                .build();

        WardOfficePairResponse.OfficeInfo postOfficeInfo = null;
        if (postOffice != null) {
            postOfficeInfo = WardOfficePairResponse.OfficeInfo.builder()
                    .officeId(postOffice.getId())
                    .officeName(postOffice.getOfficeName())
                    .officeEmail(postOffice.getOfficeEmail())
                    .officePhoneNumber(postOffice.getOfficePhoneNumber())
                    .officeAddress(postOffice.getOfficeAddress())
                    .officeType(postOffice.getOfficeType().name())
                    .parentOfficeId(postOffice.getParent() != null ? postOffice.getParent().getId() : null)
                    .parentOfficeName(postOffice.getParent() != null ? postOffice.getParent().getOfficeName() : null)
                    .build();
        }

        List<WardOfficePairResponse.WardInfo> wardInfoList = assignedWards.stream()
                .map(ward -> WardOfficePairResponse.WardInfo.builder()
                        .wardCode(ward.getCode())
                        .wardName(ward.getName())
                        .build())
                .collect(toList());

        return WardOfficePairResponse.builder()
                .officePairId(officePair.getId())
                .warehouse(warehouseInfo)
                .postOffice(postOfficeInfo)
                .provinceCode(warehouse.getProvince() != null ? warehouse.getProvince().getCode() : null)
                .provinceName(warehouse.getProvince() != null ? warehouse.getProvince().getName() : null)
                .regionName(warehouse.getRegion() != null ? warehouse.getRegion().getName() : null)
                .assignedWards(wardInfoList)
                .createdAt(officePair.getCreatedAt())
                .build();
    }
}
