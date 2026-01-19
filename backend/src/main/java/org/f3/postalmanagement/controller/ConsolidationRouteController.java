package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.consolidation.CreateConsolidationRouteRequest;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationRouteResponse;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationStatusResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.service.IConsolidationRouteService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for managing consolidation routes (WARD → PROVINCE).
 */
@RestController
@RequestMapping("/api/consolidation-routes")
@RequiredArgsConstructor
@Tag(name = "Consolidation Routes", description = "APIs for managing ward-to-province consolidation routes")
public class ConsolidationRouteController {

    private final IConsolidationRouteService consolidationRouteService;

    // ==================== ROUTE MANAGEMENT ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(summary = "Get all consolidation routes", description = "List all consolidation routes")
    public ResponseEntity<List<ConsolidationRouteResponse>> getAllRoutes() {
        List<ConsolidationRouteResponse> routes = consolidationRouteService.getAllConsolidationRoutes();
        return ResponseEntity.ok(routes);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Create consolidation route", description = "Create a new ward-to-province consolidation route")
    public ResponseEntity<ConsolidationRouteResponse> createRoute(
            @Valid @RequestBody CreateConsolidationRouteRequest request,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationRouteResponse response = consolidationRouteService.createConsolidationRoute(request, currentAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/province/{provinceCode}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(summary = "Get routes by province", description = "List all consolidation routes for a province")
    public ResponseEntity<List<ConsolidationRouteResponse>> getRoutesByProvince(
            @PathVariable String provinceCode,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        List<ConsolidationRouteResponse> routes = consolidationRouteService.getRoutesByProvince(provinceCode, currentAccount);
        return ResponseEntity.ok(routes);
    }

    @GetMapping("/{routeId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(summary = "Get route details", description = "Get detailed information about a consolidation route")
    public ResponseEntity<ConsolidationRouteResponse> getRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationRouteResponse route = consolidationRouteService.getRouteById(routeId, currentAccount);
        return ResponseEntity.ok(route);
    }

    @PutMapping("/{routeId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Update route", description = "Update consolidation route configuration")
    public ResponseEntity<ConsolidationRouteResponse> updateRoute(
            @PathVariable UUID routeId,
            @Valid @RequestBody CreateConsolidationRouteRequest request,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationRouteResponse response = consolidationRouteService.updateRoute(routeId, request, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{routeId}/activate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Activate route", description = "Activate a consolidation route")
    public ResponseEntity<ConsolidationRouteResponse> activateRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationRouteResponse response = consolidationRouteService.setRouteActive(routeId, true, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{routeId}/deactivate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Deactivate route", description = "Deactivate a consolidation route")
    public ResponseEntity<ConsolidationRouteResponse> deactivateRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationRouteResponse response = consolidationRouteService.setRouteActive(routeId, false, currentAccount);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{routeId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Delete route", description = "Delete a consolidation route")
    public ResponseEntity<Void> deleteRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        consolidationRouteService.deleteRoute(routeId, currentAccount);
        return ResponseEntity.noContent().build();
    }

    // ==================== STATUS & MONITORING ====================

    @GetMapping("/{routeId}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER')")
    @Operation(summary = "Get route status", description = "Get current consolidation status of a route")
    public ResponseEntity<ConsolidationStatusResponse> getRouteStatus(
            @PathVariable UUID routeId) {

        ConsolidationStatusResponse status = consolidationRouteService.getRouteStatus(routeId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/province/{provinceCode}/status")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Get province status", description = "Get aggregated consolidation status for a province")
    public ResponseEntity<ConsolidationStatusResponse> getProvinceStatus(
            @PathVariable String provinceCode) {

        ConsolidationStatusResponse status = consolidationRouteService.getProvinceConsolidationStatus(provinceCode);
        return ResponseEntity.ok(status);
    }

    // ==================== CONSOLIDATION OPERATIONS ====================

    @PostMapping("/{routeId}/consolidate")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Consolidate route", description = "Trigger consolidation: move pending orders to province warehouse")
    public ResponseEntity<ConsolidationStatusResponse> consolidateRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {

        ConsolidationStatusResponse status = consolidationRouteService.consolidateRoute(routeId, currentAccount);
        return ResponseEntity.ok(status);
    }

    @PostMapping("/province/{provinceCode}/consolidate-ready")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN')")
    @Operation(summary = "Consolidate ready routes", description = "Consolidate all ready-to-consolidate routes in a province")
    public ResponseEntity<String> consolidateReadyRoutes(
            @PathVariable String provinceCode) {

        int consolidated = consolidationRouteService.consolidateReadyRoutesByProvince(provinceCode);
        return ResponseEntity.ok("Consolidated " + consolidated + " routes");
    }

    @PostMapping("/consolidate-all-ready")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN')")
    @Operation(summary = "Consolidate all ready routes", description = "System admin: consolidate all ready routes")
    public ResponseEntity<String> consolidateAllReady() {

        int consolidated = consolidationRouteService.consolidateAllReadyRoutes();
        return ResponseEntity.ok("Consolidated " + consolidated + " routes");
    }
}
