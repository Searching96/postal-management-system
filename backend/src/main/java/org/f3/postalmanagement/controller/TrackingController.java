package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.tracking.LocationUpdateRequest;
import org.f3.postalmanagement.dto.response.tracking.ShipperLocationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.service.ITrackingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Controller for real-time shipper location tracking.
 */
@RestController
@RequestMapping("/api/tracking")
@RequiredArgsConstructor
@Tag(name = "Tracking", description = "Real-time shipper location tracking APIs")
public class TrackingController {

    private final ITrackingService trackingService;

    @PostMapping("/location")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(summary = "Update shipper location", description = "Shipper sends GPS coordinates")
    public ResponseEntity<Void> updateLocation(
            @Valid @RequestBody LocationUpdateRequest request,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {
        trackingService.updateLocation(request, currentAccount);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/shipper/{shipperId}")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'PO_WARD_MANAGER')")
    @Operation(summary = "Get shipper location", description = "Get current location of a specific shipper")
    public ResponseEntity<ShipperLocationResponse> getShipperLocation(@PathVariable UUID shipperId) {
        return ResponseEntity.ok(trackingService.getShipperLocation(shipperId));
    }

    @GetMapping("/order/{orderId}")
    @Operation(summary = "Get shipper location for order", description = "Public: customers can track delivery")
    public ResponseEntity<ShipperLocationResponse> getShipperLocationForOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(trackingService.getShipperLocationForOrder(orderId));
    }

    @PostMapping("/start/{orderId}")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(summary = "Start delivery", description = "Set order to OUT_FOR_DELIVERY and start tracking")
    public ResponseEntity<Void> startDelivery(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {
        trackingService.startDeliverySession(orderId, currentAccount);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/end/{orderId}")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(summary = "End delivery session", description = "Stop tracking for this order")
    public ResponseEntity<Void> endDelivery(
            @PathVariable UUID orderId,
            @AuthenticationPrincipal(expression = "account") Account currentAccount) {
        trackingService.endDeliverySession(orderId, currentAccount);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/active")
    @PreAuthorize("hasAnyRole('SYSTEM_ADMIN', 'HUB_ADMIN', 'WH_PROVINCE_ADMIN', 'WH_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'PO_WARD_MANAGER')")
    @Operation(summary = "Get active shippers", description = "Get all shippers currently on delivery")
    public ResponseEntity<List<ShipperLocationResponse>> getActiveShippers() {
        return ResponseEntity.ok(trackingService.getActiveShippers());
    }
}
