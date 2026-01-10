package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.auth.RegisterSystemAdminRequest;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.service.IDashboardService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Tag(name = "Dashboard", description = "Dashboard API for system admin")
@PreAuthorize( "hasRole('ROLE_SYSTEM_ADMIN')")
public class DashboardController {

    private final IDashboardService dashboardService;

    @PostMapping("/register-admin")
    @Operation(summary = "Register new admin", description = "Register new system admin account (just for system admin)")
    public ResponseEntity<?> registerNewAdmin(@Valid @RequestBody RegisterSystemAdminRequest request) {
        dashboardService.registerNewAdmin(request);
        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                    .success(true)
                    .message("New system admin registered successfully")
                    .build()
        );
    }
}
