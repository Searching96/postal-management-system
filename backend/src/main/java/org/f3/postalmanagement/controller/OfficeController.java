package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.office.OfficeStatusUpdateRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.office.OfficeResponse;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.service.IOfficeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/offices")
@RequiredArgsConstructor
@Tag(name = "Office API", description = "Operations related to offices")
public class OfficeController {

    private final IOfficeService officeService;

    @Operation(summary = "Search offices for public")
    @GetMapping
    public ResponseEntity<PageResponse<OfficeResponse>> searchOffices(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OfficeResponse> result = officeService.searchOffices(search, type, pageable);
        return ResponseEntity.ok(PageResponse.of(result));
    }

    @Operation(summary = "Get office details")
    @GetMapping("/{id}")
    public ResponseEntity<OfficeResponse> getOfficeDetails(@PathVariable UUID id) {
        return ResponseEntity.ok(officeService.getOfficeDetails(id));
    }

    @Operation(summary = "Update office status (Manager only)")
    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    public ResponseEntity<OfficeResponse> updateOfficeStatus(
            @PathVariable UUID id,
            @RequestBody @Valid OfficeStatusUpdateRequest request) {
        return ResponseEntity.ok(officeService.updateOfficeStatus(id, request));
    }
}
