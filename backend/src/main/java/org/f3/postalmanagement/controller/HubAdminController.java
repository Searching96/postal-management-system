package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.hub.RegisterHubAdminRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IHubAdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/hub-admins")
@RequiredArgsConstructor
@Tag(name = "HUB Admin Management", description = "API for managing HUB administrators")
@SecurityRequirement(name = "bearerAuth")
public class HubAdminController {

    private final IHubAdminService hubAdminService;

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Register new HUB admin",
            description = "Register a new HUB admin. SYSTEM_ADMIN can register for any HUB. HUB_ADMIN can only register for their own region."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> registerHubAdmin(
            @Valid @RequestBody RegisterHubAdminRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = hubAdminService.registerHubAdmin(request, userDetails.getAccount());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("HUB admin registered successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/province-offices")
    @PreAuthorize("hasRole('HUB_ADMIN')")
    @Operation(
            summary = "Get all province offices in the region",
            description = "Get all PROVINCE_WAREHOUSE and PROVINCE_POST offices in the HUB admin's region with pagination and optional search."
    )
    public ResponseEntity<ApiResponse<PageResponse<OfficeResponse>>> getProvinceOfficesByRegion(
            @Parameter(description = "Search term for office name or email")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<OfficeResponse> response = hubAdminService.getProvinceOfficesByRegion(search, pageable, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<OfficeResponse>>builder()
                        .success(true)
                        .message("Province offices fetched successfully")
                        .data(response)
                        .build()
        );
    }
}
