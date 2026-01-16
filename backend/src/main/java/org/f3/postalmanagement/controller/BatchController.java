package org.f3.postalmanagement.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.f3.postalmanagement.dto.request.batch.AddOrdersToBatchRequest;
import org.f3.postalmanagement.dto.request.batch.AutoBatchRequest;
import org.f3.postalmanagement.dto.request.batch.CreateBatchRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.batch.AutoBatchResultResponse;
import org.f3.postalmanagement.dto.response.batch.BatchPackageResponse;
import org.f3.postalmanagement.dto.response.batch.BatchableDestinationsResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.enums.BatchStatus;
import org.f3.postalmanagement.service.IBatchService;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for batch package management.
 * 
 * Provides endpoints for consolidating orders into batches,
 * managing batch lifecycle, and tracking batch shipments.
 */
@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@Tag(name = "Batch Management", description = "APIs for consolidating and managing batch packages")
public class BatchController {

    private final IBatchService batchService;

    // ==================== BATCH CREATION ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Create a new batch",
            description = "Create a new batch package for a specific destination. Orders can then be added to this batch.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Batch created successfully",
                    content = @Content(schema = @Schema(implementation = BatchPackageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<BatchPackageResponse> createBatch(
            @Valid @RequestBody CreateBatchRequest request,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.createBatch(request, currentAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/auto-batch")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Auto-batch orders",
            description = "Automatically group orders by destination and consolidate into optimized batches. " +
                    "Uses First Fit Decreasing algorithm to maximize orders per batch while respecting weight limits.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Auto-batching completed",
                    content = @Content(schema = @Schema(implementation = AutoBatchResultResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<AutoBatchResultResponse> autoBatchOrders(
            @Valid @RequestBody AutoBatchRequest request,
            @AuthenticationPrincipal Account currentAccount) {
        AutoBatchResultResponse response = batchService.autoBatchOrders(request, currentAccount);
        return ResponseEntity.ok(response);
    }

    // ==================== BATCH OPERATIONS ====================

    @PostMapping("/add-orders")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Add orders to a batch",
            description = "Manually add one or more orders to an existing batch. Orders must have the same destination as the batch.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders added successfully",
                    content = @Content(schema = @Schema(implementation = BatchPackageResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or orders don't match batch"),
            @ApiResponse(responseCode = "404", description = "Batch or orders not found")
    })
    public ResponseEntity<BatchPackageResponse> addOrdersToBatch(
            @Valid @RequestBody AddOrdersToBatchRequest request,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.addOrdersToBatch(request, currentAccount);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{batchId}/orders/{orderId}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Remove order from batch",
            description = "Remove a specific order from a batch. Only works for OPEN or PROCESSING batches.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order removed successfully"),
            @ApiResponse(responseCode = "400", description = "Cannot remove from sealed/in-transit batch"),
            @ApiResponse(responseCode = "404", description = "Batch or order not found")
    })
    public ResponseEntity<BatchPackageResponse> removeOrderFromBatch(
            @PathVariable UUID batchId,
            @PathVariable UUID orderId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.removeOrderFromBatch(batchId, orderId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{batchId}/seal")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Seal a batch",
            description = "Seal a batch to prevent further order additions. Batch is ready for transit after sealing.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch sealed successfully"),
            @ApiResponse(responseCode = "400", description = "Cannot seal empty batch or already sealed"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> sealBatch(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.sealBatch(batchId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{batchId}/dispatch")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Dispatch batch for transit",
            description = "Mark a sealed batch as in transit to its destination.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch dispatched successfully"),
            @ApiResponse(responseCode = "400", description = "Batch must be sealed before dispatch"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> dispatchBatch(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.markBatchInTransit(batchId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{batchId}/arrive")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Mark batch as arrived",
            description = "Mark a batch as arrived at the destination office. Only destination office staff can do this.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch marked as arrived"),
            @ApiResponse(responseCode = "400", description = "Batch must be in transit"),
            @ApiResponse(responseCode = "403", description = "Only destination office can mark arrival"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> markBatchArrived(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.markBatchArrived(batchId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{batchId}/distribute")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Distribute batch orders",
            description = "Unpack a batch and distribute its orders for individual processing. " +
                    "Orders are released from the batch and ready for last-mile delivery.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch distributed successfully"),
            @ApiResponse(responseCode = "400", description = "Batch must be arrived before distribution"),
            @ApiResponse(responseCode = "403", description = "Only destination office can distribute"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> distributeBatch(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.distributeBatch(batchId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{batchId}/cancel")
    @PreAuthorize("hasAnyRole('PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Cancel a batch",
            description = "Cancel a batch and release all orders back to unbatched state. " +
                    "Cannot cancel batches that are in transit or already delivered.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch cancelled successfully"),
            @ApiResponse(responseCode = "400", description = "Cannot cancel in-transit or delivered batch"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> cancelBatch(
            @PathVariable UUID batchId,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.cancelBatch(batchId, currentAccount);
        return ResponseEntity.ok(response);
    }

    // ==================== BATCH QUERIES ====================

    @GetMapping("/{batchId}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get batch by ID",
            description = "Get detailed information about a specific batch, optionally including the list of orders.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch details retrieved"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> getBatchById(
            @PathVariable UUID batchId,
            @Parameter(description = "Include list of orders in batch")
            @RequestParam(defaultValue = "false") boolean includeOrders,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.getBatchById(batchId, includeOrders, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{batchCode}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get batch by code",
            description = "Get batch details using the batch code.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch details retrieved"),
            @ApiResponse(responseCode = "404", description = "Batch not found")
    })
    public ResponseEntity<BatchPackageResponse> getBatchByCode(
            @PathVariable String batchCode,
            @Parameter(description = "Include list of orders in batch")
            @RequestParam(defaultValue = "false") boolean includeOrders,
            @AuthenticationPrincipal Account currentAccount) {
        BatchPackageResponse response = batchService.getBatchByCode(batchCode, includeOrders, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get batches at current office",
            description = "Get all batches originating from the current staff's office, with optional status filter.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Batch list retrieved")
    })
    public ResponseEntity<PageResponse<BatchPackageResponse>> getBatches(
            @Parameter(description = "Filter by batch status")
            @RequestParam(required = false) BatchStatus status,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount) {
        PageResponse<BatchPackageResponse> response = batchService.getBatchesByOriginOffice(status, pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/incoming")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get incoming batches",
            description = "Get batches that are being sent to the current staff's office (destination).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Incoming batch list retrieved")
    })
    public ResponseEntity<PageResponse<BatchPackageResponse>> getIncomingBatches(
            @Parameter(description = "Filter by batch status")
            @RequestParam(required = false) BatchStatus status,
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount) {
        PageResponse<BatchPackageResponse> response = batchService.getIncomingBatches(status, pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/open")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get open batches",
            description = "Get batches that are still open and can accept more orders.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Open batch list retrieved")
    })
    public ResponseEntity<PageResponse<BatchPackageResponse>> getOpenBatches(
            @ParameterObject
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount) {
        PageResponse<BatchPackageResponse> response = batchService.getOpenBatches(pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/destinations")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'HUB_ADMIN')")
    @Operation(
            summary = "Get batchable destinations",
            description = "Get list of destinations with unbatched orders, useful for planning batch creation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Destinations list retrieved",
                    content = @Content(schema = @Schema(implementation = BatchableDestinationsResponse.class)))
    })
    public ResponseEntity<BatchableDestinationsResponse> getDestinationsWithUnbatchedOrders(
            @AuthenticationPrincipal Account currentAccount) {
        BatchableDestinationsResponse response = batchService.getDestinationsWithUnbatchedOrders(currentAccount);
        return ResponseEntity.ok(response);
    }
}
