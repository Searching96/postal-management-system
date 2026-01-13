package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.CreateWardEmployeeRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IWardManagerService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ward-manager")
@RequiredArgsConstructor
@Tag(name = "Ward Manager Management", description = "API for Ward Managers (PO_WARD_MANAGER, WH_WARD_MANAGER) to manage employees in their office.")
@SecurityRequirement(name = "bearerAuth")
public class WardManagerController {

    private final IWardManagerService wardManagerService;

    @PostMapping("/employees")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Create a new employee in the same office",
            description = "Create a new employee with specific role in the Ward Manager's office. " +
                    "PO_WARD_MANAGER can create: PO_WARD_MANAGER or PO_STAFF (in the same WARD_POST). " +
                    "WH_WARD_MANAGER can create: WH_WARD_MANAGER or WH_STAFF (in the same WARD_WAREHOUSE). " +
                    "The employee will be assigned to the same office as the Ward Manager."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(
            @Valid @RequestBody CreateWardEmployeeRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = wardManagerService.createEmployee(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Employee created successfully")
                        .data(response)
                        .build()
        );
    }
}
