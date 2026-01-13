package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.CreateProvinceEmployeeRequest;
import org.f3.postalmanagement.dto.request.office.AssignWardsRequest;
import org.f3.postalmanagement.dto.request.office.CreateWardOfficeRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.WardOfficePairResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IProvinceAdminService;
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

    @PostMapping("/employees")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create a new employee",
            description = "Create a new employee with specific role. " +
                    "PO_PROVINCE_ADMIN can create: PO_PROVINCE_ADMIN (for PROVINCE_POST) or PO_WARD_MANAGER (for WARD_POST). " +
                    "WH_PROVINCE_ADMIN can create: WH_PROVINCE_ADMIN (for PROVINCE_WAREHOUSE) or WH_WARD_MANAGER (for WARD_WAREHOUSE). " +
                    "The office must be within the admin's province."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody CreateProvinceEmployeeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = provinceAdminService.createEmployee(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Employee created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/ward-offices")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get all ward office pairs",
            description = "Get all ward office pairs (WARD_WAREHOUSE + WARD_POST) under the admin's jurisdiction. " +
                    "Province admins see only offices in their province. SYSTEM_ADMIN sees all."
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
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
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
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get ward assignment status",
            description = "Get all wards in the province with their office assignment status. " +
                    "Shows which wards are already assigned to ward office pairs. " +
                    "SYSTEM_ADMIN must provide provinceCode parameter."
    )
    public ResponseEntity<ApiResponse<List<IProvinceAdminService.WardAssignmentInfo>>> getWardAssignmentStatus(
            @RequestParam(required = false) String provinceCode,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<IProvinceAdminService.WardAssignmentInfo> wardInfo =
                provinceAdminService.getAvailableWardsForAssignment(userDetails.getAccount(), provinceCode);

        return ResponseEntity.ok(
                ApiResponse.<List<IProvinceAdminService.WardAssignmentInfo>>builder()
                        .success(true)
                        .message("Ward assignment status retrieved successfully")
                        .data(wardInfo)
                        .build()
        );
    }
}
