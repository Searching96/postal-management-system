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
import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.order.OrderResponse;
import org.f3.postalmanagement.dto.response.order.PriceCalculationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.service.IOrderService;
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

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Tag(name = "Order Management", description = "APIs for managing parcel orders at post offices")
public class OrderController {

    private final IOrderService orderService;

    // ==================== PRICE CALCULATION ====================

    @PostMapping("/calculate-price")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Calculate shipping price",
            description = "Preview shipping cost and SLA before creating an order. Shows all available service options.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Price calculated successfully",
                    content = @Content(schema = @Schema(implementation = PriceCalculationResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<PriceCalculationResponse> calculatePrice(
            @Valid @RequestBody CalculatePriceRequest request,
            @AuthenticationPrincipal Account currentAccount
    ) {
        PriceCalculationResponse response = orderService.calculatePrice(request, currentAccount);
        return ResponseEntity.ok(response);
    }

    // ==================== ORDER CREATION ====================

    @PostMapping
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Create new order",
            description = "Create a new parcel order for a walk-in customer or registered customer at the post office. " +
                    "Returns tracking number for the customer to track their package.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Order created successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody CreateOrderRequest request,
            @AuthenticationPrincipal Account currentAccount
    ) {
        OrderResponse response = orderService.createOrder(request, currentAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== ORDER RETRIEVAL ====================

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'WH_STAFF', 'SHIPPER', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER', " +
            "'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'HUB_ADMIN', 'SYSTEM_ADMIN', 'CUSTOMER')")
    @Operation(
            summary = "Get order by ID",
            description = "Retrieve detailed order information including tracking history",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<OrderResponse> getOrderById(
            @Parameter(description = "Order ID (UUID)") @PathVariable UUID orderId,
            @AuthenticationPrincipal Account currentAccount
    ) {
        OrderResponse response = orderService.getOrderById(orderId, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/track/{trackingNumber}")
    @Operation(
            summary = "Track order by tracking number",
            description = "Public endpoint to track package status by tracking number. No authentication required."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order found",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "404", description = "Order not found with tracking number")
    })
    public ResponseEntity<OrderResponse> trackOrder(
            @Parameter(description = "Tracking number (e.g., VN123456789VN)") @PathVariable String trackingNumber
    ) {
        OrderResponse response = orderService.getOrderByTrackingNumber(trackingNumber);
        return ResponseEntity.ok(response);
    }

    // ==================== ORDER LISTING ====================

    @GetMapping
    @PreAuthorize("hasAnyRole('PO_STAFF', 'WH_STAFF', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER', " +
            "'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'HUB_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(
            summary = "List orders at current office",
            description = "List all orders created at the staff's current office with optional search",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders retrieved successfully",
                    content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    public ResponseEntity<PageResponse<OrderResponse>> getOrdersByOffice(
            @Parameter(description = "Search by tracking number, sender/receiver name or phone")
            @RequestParam(required = false) String search,
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount
    ) {
        PageResponse<OrderResponse> response = orderService.getOrdersByOffice(search, pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/by-phone/{phone}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'WH_STAFF', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER', " +
            "'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'HUB_ADMIN', 'SYSTEM_ADMIN')")
    @Operation(
            summary = "Get orders by sender phone number",
            description = "Find orders by sender's phone number. Useful when customer inquires about their orders.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders found",
                    content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    public ResponseEntity<PageResponse<OrderResponse>> getOrdersBySenderPhone(
            @Parameter(description = "Sender's phone number") @PathVariable String phone,
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        PageResponse<OrderResponse> response = orderService.getOrdersBySenderPhone(phone, pageable);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/customer/{customerId}")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'WH_STAFF', 'PO_WARD_MANAGER', 'WH_WARD_MANAGER', " +
            "'PO_PROVINCE_ADMIN', 'WH_PROVINCE_ADMIN', 'HUB_ADMIN', 'SYSTEM_ADMIN', 'CUSTOMER')")
    @Operation(
            summary = "Get orders by customer ID",
            description = "Find all orders for a registered customer. Customers can only view their own orders.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Orders found",
                    content = @Content(schema = @Schema(implementation = PageResponse.class))),
            @ApiResponse(responseCode = "403", description = "Customer can only view their own orders")
    })
    public ResponseEntity<PageResponse<OrderResponse>> getOrdersByCustomerId(
            @Parameter(description = "Customer ID (UUID)") @PathVariable UUID customerId,
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount
    ) {
        PageResponse<OrderResponse> response = orderService.getOrdersByCustomerId(customerId, pageable, currentAccount);
        return ResponseEntity.ok(response);
    }
}
