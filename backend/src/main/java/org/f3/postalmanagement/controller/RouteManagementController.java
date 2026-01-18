package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.route.DisableRouteRequest;
import org.f3.postalmanagement.dto.response.route.DisruptionResponse;
import org.f3.postalmanagement.dto.response.route.ReroutingImpactResponse;
import org.f3.postalmanagement.dto.response.route.TransferRouteResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.service.IReroutingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for managing transfer routes and handling disruptions.
 */
@RestController
@RequestMapping("/api/routes")
@RequiredArgsConstructor
@Tag(name = "Route Management", description = "APIs for managing transfer routes and disruptions")
public class RouteManagementController {

    private final IReroutingService reroutingService;

    @GetMapping
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Get all transfer routes", description = "Returns all hub-to-hub transfer routes with their current status")
    public ResponseEntity<List<TransferRouteResponse>> getAllRoutes() {
        return ResponseEntity.ok(reroutingService.getAllRoutes());
    }

    @GetMapping("/{routeId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Get route by ID", description = "Returns details of a specific transfer route")
    public ResponseEntity<TransferRouteResponse> getRouteById(@PathVariable UUID routeId) {
        return ResponseEntity.ok(reroutingService.getRouteById(routeId));
    }

    @GetMapping("/{routeId}/impact")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Preview disable impact", description = "Shows affected batches and orders if route is disabled")
    public ResponseEntity<ReroutingImpactResponse> previewDisableImpact(@PathVariable UUID routeId) {
        return ResponseEntity.ok(reroutingService.previewDisableImpact(routeId));
    }

    @PostMapping("/{routeId}/disable")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Disable a route", description = "Disables a route due to disruption and triggers rerouting for affected packages")
    public ResponseEntity<DisruptionResponse> disableRoute(
            @PathVariable UUID routeId,
            @Valid @RequestBody DisableRouteRequest request,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {
        return ResponseEntity.ok(reroutingService.disableRoute(routeId, request, currentAccount));
    }

    @PostMapping("/{routeId}/enable")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Re-enable a route", description = "Re-activates a previously disabled route")
    public ResponseEntity<TransferRouteResponse> enableRoute(
            @PathVariable UUID routeId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {
        return ResponseEntity.ok(reroutingService.enableRoute(routeId, currentAccount));
    }

    @GetMapping("/disruptions")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Get active disruptions", description = "Returns all currently active route disruptions")
    public ResponseEntity<List<DisruptionResponse>> getActiveDisruptions() {
        return ResponseEntity.ok(reroutingService.getActiveDisruptions());
    }

    @GetMapping("/{routeId}/disruptions/history")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN')")
    @Operation(summary = "Get disruption history", description = "Returns disruption history for a specific route")
    public ResponseEntity<List<DisruptionResponse>> getDisruptionHistory(@PathVariable UUID routeId) {
        return ResponseEntity.ok(reroutingService.getDisruptionHistory(routeId));
    }
}
