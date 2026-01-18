package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardManagerEmployeeRequest;
import org.f3.postalmanagement.dto.request.employee.ward.CreateWardStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IWardManagerService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ward-manager")
@RequiredArgsConstructor
@Tag(name = "Ward Manager Management", description = "API for Ward Managers (PO_WARD_MANAGER, WH_WARD_MANAGER) to manage employees in their office.")
@SecurityRequirement(name = "bearerAuth")
public class WardManagerController {

    private final IWardManagerService wardManagerService;

    @GetMapping("/employees")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Get all staff in the manager's office",
            description = "Get all staff members in the same office as the Ward Manager with pagination and optional search."
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
        PageResponse<EmployeeResponse> response = wardManagerService.getStaffByOffice(search, pageable, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<EmployeeResponse>>builder()
                        .success(true)
                        .message("Staff fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Get a staff member by ID",
            description = "Get a specific staff member in the same office as the Ward Manager."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> getStaffById(
            @PathVariable UUID staffId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = wardManagerService.getStaffById(staffId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Update a staff member",
            description = "Update a staff member in the same office as the Ward Manager."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateStaff(
            @PathVariable UUID staffId,
            @Valid @RequestBody UpdateStaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = wardManagerService.updateStaff(staffId, request, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/employees/{staffId}")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Delete a staff member",
            description = "Soft delete a staff member in the same office as the Ward Manager."
    )
    public ResponseEntity<ApiResponse<Void>> deleteStaff(
            @PathVariable UUID staffId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        wardManagerService.deleteStaff(staffId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Staff deleted successfully")
                        .build()
        );
    }

    @PostMapping("/employees/staff")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Create a new staff in the same office",
            description = "Create a new staff member in the Ward Manager's office. " +
                    "PO_WARD_MANAGER creates PO_STAFF in the same WARD_POST. " +
                    "WH_WARD_MANAGER creates WH_STAFF in the same WARD_WAREHOUSE."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createStaff(
            @Valid @RequestBody CreateWardStaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = wardManagerService.createStaff(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Staff created successfully")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/employees/ward-manager")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Create a new ward manager in the same office",
            description = "Create a new ward manager in the same office. " +
                    "PO_WARD_MANAGER creates PO_WARD_MANAGER in the same WARD_POST. " +
                    "WH_WARD_MANAGER creates WH_WARD_MANAGER in the same WARD_WAREHOUSE."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createWardManager(
            @Valid @RequestBody CreateWardManagerEmployeeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = wardManagerService.createWardManager(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Ward Manager created successfully")
                        .data(response)
                        .build()
        );
    }
}
