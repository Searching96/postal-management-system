package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.employee.CreateShipperRequest;
import org.f3.postalmanagement.dto.request.employee.UpdateStaffRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.ApiResponse;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
import org.f3.postalmanagement.service.IShipperService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/shippers")
@RequiredArgsConstructor
@Tag(name = "Shipper Management", description = "API for managing shippers (HUB_ADMIN, WH_PROVINCE_ADMIN, WH_WARD_MANAGER)")
@SecurityRequirement(name = "bearerAuth")
public class ShipperController {

    private final IShipperService shipperService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Create a new shipper",
            description = "Create a new shipper for a warehouse. HUB_ADMIN can create for any warehouse in their region, " +
                    "WH_PROVINCE_ADMIN for warehouses in their province, WH_WARD_MANAGER for their own office only."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> createShipper(
            @Valid @RequestBody CreateShipperRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = shipperService.createShipper(request, userDetails.getAccount());

        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Shipper created successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Get all shippers",
            description = "Get all shippers within the user's jurisdiction with pagination and optional search. " +
                    "HUB_ADMIN sees shippers in their region, WH_PROVINCE_ADMIN in their province, WH_WARD_MANAGER in their office."
    )
    public ResponseEntity<ApiResponse<PageResponse<EmployeeResponse>>> getShippers(
            @Parameter(description = "Search term for name, phone, or email")
            @RequestParam(required = false) String search,
            @Parameter(description = "Page number (0-indexed)", example = "0")
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Number of items per page", example = "10")
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Pageable pageable = PageRequest.of(page, size);
        PageResponse<EmployeeResponse> response = shipperService.getShippers(search, pageable, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<PageResponse<EmployeeResponse>>builder()
                        .success(true)
                        .message("Shippers fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @GetMapping("/{shipperId}")
    @PreAuthorize("hasAnyRole('HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Get a shipper by ID",
            description = "Get a specific shipper within the user's jurisdiction."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> getShipperById(
            @PathVariable UUID shipperId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = shipperService.getShipperById(shipperId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Shipper fetched successfully")
                        .data(response)
                        .build()
        );
    }

    @PutMapping("/{shipperId}")
    @PreAuthorize("hasAnyRole('HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Update a shipper",
            description = "Update a shipper within the user's jurisdiction."
    )
    public ResponseEntity<ApiResponse<EmployeeResponse>> updateShipper(
            @PathVariable UUID shipperId,
            @Valid @RequestBody UpdateStaffRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        EmployeeResponse response = shipperService.updateShipper(shipperId, request, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<EmployeeResponse>builder()
                        .success(true)
                        .message("Shipper updated successfully")
                        .data(response)
                        .build()
        );
    }

    @DeleteMapping("/{shipperId}")
    @PreAuthorize("hasAnyRole('HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER')")
    @Operation(
            summary = "Delete a shipper",
            description = "Soft delete a shipper within the user's jurisdiction."
    )
    public ResponseEntity<ApiResponse<Void>> deleteShipper(
            @PathVariable UUID shipperId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        shipperService.deleteShipper(shipperId, userDetails.getAccount());

        return ResponseEntity.ok(
                ApiResponse.<Void>builder()
                        .success(true)
                        .message("Shipper deleted successfully")
                        .build()
        );
    }
}
