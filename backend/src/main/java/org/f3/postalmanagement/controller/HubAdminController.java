package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.hub.RegisterHubAdminRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IHubAdminService;
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
}
