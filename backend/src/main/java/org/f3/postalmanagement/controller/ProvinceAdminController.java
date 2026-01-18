package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateProvinceAdminRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.province.CreateWardManagerRequest;
import org.f3.postalmanagement.dto.request.office.AssignWardsRequest;
import org.f3.postalmanagement.dto.request.office.CreateWardOfficeRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.dto.response.office.WardOfficePairResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IProvinceAdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/province-admin")
@RequiredArgsConstructor
@Tag(name = "Province Admin Management", description = "API for Province Admins (PO_PROVINCE_ADMIN, WH_PROVINCE_ADMIN) to manage employees and ward office pairs.")
@SecurityRequirement(name = "bearerAuth")
public class ProvinceAdminController {

    private final IProvinceAdminService provinceAdminService;

    @PostMapping("/employees/province-admin")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create a new Province Admin",
            description = "Create a new Province Admin with the same role as the current user. " +
                    "PO_PROVINCE_ADMIN creates PO_PROVINCE_ADMIN (for PROVINCE_POST). " +
                    "WH_PROVINCE_ADMIN creates WH_PROVINCE_ADMIN (for PROVINCE_WAREHOUSE). " +
                    "The office must be within the admin's province."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createProvinceAdmin(
            @Valid @RequestBody CreateProvinceAdminRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.createProvinceAdmin(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Province Admin created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/employees/ward-manager")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create a new Ward Manager",
            description = "Create a new Ward Manager. " +
                    "PO_PROVINCE_ADMIN creates PO_WARD_MANAGER (for WARD_POST). " +
                    "WH_PROVINCE_ADMIN creates WH_WARD_MANAGER (for WARD_WAREHOUSE). " +
                    "The office must be within the admin's province."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createWardManager(
            @Valid @RequestBody CreateWardManagerRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.createWardManager(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Ward Manager created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/employees/staff")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create a new Staff",
            description = "Create a new Staff. " +
                    "PO_PROVINCE_ADMIN creates PO_STAFF (for PROVINCE_POST or WARD_POST). " +
                    "WH_PROVINCE_ADMIN creates WH_STAFF (for PROVINCE_WAREHOUSE or WARD_WAREHOUSE). " +
                    "The office must be within the admin's province."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createStaff(
            @Valid @RequestBody CreateStaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.createStaff(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/ward-offices")
    @PreAuthorize("hasRole('PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create a new ward office pair",
            description = "Create a new WARD_WAREHOUSE and WARD_POST together as a pair. " +
                    "Only PO_PROVINCE_ADMIN can create ward offices (WH_PROVINCE_ADMIN cannot). " +
                    "The offices are created without ward assignment initially. " +
                    "Use the assign-wards endpoint to assign wards to the office pair."
    )
    public ResponseEntity<ApiResponse<WardOfficePairResponse>> createWardOfficePair(
            @Valid @RequestBody CreateWardOfficeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WardOfficePairResponse response = provinceAdminService.createWardOfficePair(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<WardOfficePairResponse>builder()
                        .success(true)
                        .message("Ward office pair created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/ward-offices/assign-wards")
    @PreAuthorize("hasRole('PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Assign wards to a ward office pair",
            description = "Assign wards to a WARD_WAREHOUSE and WARD_POST pair. " +
                    "Both offices will serve the same wards. " +
                    "Only PO_PROVINCE_ADMIN can assign wards."
    )
    public ResponseEntity<ApiResponse<WardOfficePairResponse>> assignWardsToOfficePair(
            @Valid @RequestBody AssignWardsRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WardOfficePairResponse response = provinceAdminService.assignWardsToOfficePair(request, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<WardOfficePairResponse>builder()
                        .success(true)
                        .message("Wards assigned to office pair successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/ward-offices")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get all ward office pairs",
            description = "Get all ward office pairs (WARD_WAREHOUSE + WARD_POST) under the admin's jurisdiction. " +
                    "Province admins see only offices in their province."
    )
    public ResponseEntity<ApiResponse<List<WardOfficePairResponse>>> getWardOfficePairs(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<WardOfficePairResponse> offices = provinceAdminService.getWardOfficePairs(userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<List<WardOfficePairResponse>>builder()
                        .success(true)
                        .message("Ward office pairs retrieved successfully")
                        .data(offices)
                        .build()
        );
    }

    @GetMapping("/ward-offices/{officePairId}")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get ward office pair by office pair ID",
            description = "Get a specific ward office pair by the office pair ID"
    )
    public ResponseEntity<ApiResponse<WardOfficePairResponse>> getWardOfficePairById(
            @PathVariable UUID officePairId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        WardOfficePairResponse response = provinceAdminService.getWardOfficePairById(officePairId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<WardOfficePairResponse>builder()
                        .success(true)
                        .message("Ward office pair retrieved successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/wards/assignment-status")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get ward assignment status",
            description = "Get all wards in the province with their office assignment status. " +
                    "Shows which wards are already assigned to ward office pairs. Supports search and pagination."
    )
    public ResponseEntity<ApiResponse<PageResponse<IProvinceAdminService.WardAssignmentInfo>>> getWardAssignmentStatus(
            @RequestParam(required = false) String provinceCode,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "all") String status,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PageRequest pageable = PageRequest.of(page, size);
        PageResponse<IProvinceAdminService.WardAssignmentInfo> wardInfo =
                provinceAdminService.getAvailableWardsForAssignment(userDetails.getAccount(), provinceCode, search, status, pageable);

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<IProvinceAdminService.WardAssignmentInfo>>builder()
                        .success(true)
                        .message("Ward assignment status retrieved successfully")
                        .data(wardInfo)
                        .build()
        );
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get all staff in the admin's office",
            description = "Get all staff members in the same office as the Province Admin with pagination and optional search."
    )
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> getStaffByOffice(
            @Parameter(description = "Search term for name, phone, or email")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<EmployeeResponse> response = provinceAdminService.getStaffByOffice(search, pageable, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<EmployeeResponse>>builder()
                        .success(true)
                        .message("Staff fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get a staff member by ID",
            description = "Get a specific staff member in the same office as the Province Admin."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> getStaffById(
            @PathVariable UUID staffId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.getStaffById(staffId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Update a staff member",
            description = "Update a staff member in the same office as the Province Admin."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateStaff(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateStaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.updateStaff(staffId, request, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Delete a staff member",
            description = "Soft delete a staff member in the same office as the Province Admin."
    )
    public ResponseEntity<ApiResponse<Void>> deleteStaff(
            @PathVariable UUID staffId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        provinceAdminService.deleteStaff(staffId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Staff deleted successfully")
                        .build()
        );
    }

    @GetMapping("/offices/ward")
    @PreAuthorize("hasAnyRole('PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get all ward offices in the province",
            description = "Get all WARD_WAREHOUSE and WARD_POST offices in the Province Admin's province with pagination and optional search."
    )
    public ResponseEntity<ApiResponse<PageResponse<OfficeResponse>>> getWardOfficesByProvince(
            @Parameter(description = "Search term for office name or email")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<OfficeResponse> response = provinceAdminService.getWardOfficesByProvince(search, pageable, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<OfficeResponse>>builder()
                        .success(true)
                        .message("Ward offices fetched successfully")
                        .data(response)
                        .build()
        );
    }
}
