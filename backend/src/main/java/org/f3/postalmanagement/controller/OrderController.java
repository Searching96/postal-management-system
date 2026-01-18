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
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.order.AssignShipperRequest;
import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateCommentRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
import org.f3.postalmanagement.dto.request.order.CustomerCreateOrderRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.order.CommentResponse;
import org.f3.postalmanagement.dto.response.order.OrderResponse;
import org.f3.postalmanagement.dto.response.order.PriceCalculationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.CustomUserDetails;
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

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Order Management", description = "APIs for managing parcel orders at post offices")
public class OrderController {

    private final IOrderService orderService;

    // ==================== PRICE CALCULATION ====================

    @PostMapping("/calculate-price")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN', 'CUSTOMER')")
    @Operation(
            summary = "Calculate shipping price",
            description = "Preview shipping cost and SLA before creating an order. Shows all available service options. " +
                    "Staff can omit originOfficeId (uses their office). Customers must provide originOfficeId. " +
                    "MONTHLY customers get 10% discount, ANNUALLY customers get 20% discount.",
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

    @GetMapping("/test-endpoint")
    public ResponseEntity<String> testEndpoint() {
        log.info("=== TEST ENDPOINT REACHED ===");
        return ResponseEntity.ok("Test endpoint works!");
    }

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

    // ==================== CUSTOMER ONLINE ORDER ====================

    @PostMapping("/customer/pickup")
    @PreAuthorize("hasRole('CUSTOMER')")
    @Operation(
            summary = "Create pickup order",
            description = "Registered customer creates a pickup order online. Customer selects the origin office. " +
                    "Staff at the selected office will be notified to assign a shipper for package pickup. " +
                    "Subscription discounts are automatically applied (MONTHLY: 10%, ANNUALLY: 20%).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Pickup order created successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data")
    })
    public ResponseEntity<OrderResponse> createCustomerPickupOrder(
            @Valid @RequestBody CustomerCreateOrderRequest request,
            @AuthenticationPrincipal Account currentAccount
    ) {
        OrderResponse response = orderService.createCustomerPickupOrder(request, currentAccount);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ==================== STAFF - PICKUP ORDER MANAGEMENT ====================

    @GetMapping("/pending-pickups")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Get pending pickup orders",
            description = "List orders awaiting shipper assignment for pickup. These are orders created by customers online.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Pending orders retrieved",
                    content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    public ResponseEntity<PageResponse<OrderResponse>> getPendingPickupOrders(
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.ASC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount
    ) {
        PageResponse<OrderResponse> response = orderService.getPendingPickupOrders(pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/assign-shipper")
    @PreAuthorize("hasAnyRole('PO_STAFF', 'PO_WARD_MANAGER', 'PO_PROVINCE_ADMIN')")
    @Operation(
            summary = "Assign shipper to pickup order",
            description = "Staff assigns a shipper to go to customer's location and pickup the package. " +
                    "The shipper will receive a real-time notification.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Shipper assigned successfully",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request or order not in correct status"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions")
    })
    public ResponseEntity<OrderResponse> assignShipperToPickup(
            @Valid @RequestBody AssignShipperRequest request,
            @AuthenticationPrincipal Account currentAccount
    ) {
        OrderResponse response = orderService.assignShipperToPickup(request, currentAccount);
        return ResponseEntity.ok(response);
    }

    // ==================== SHIPPER ENDPOINTS ====================

    @GetMapping("/shipper/assigned")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(
            summary = "Get shipper's assigned pickup orders",
            description = "Shipper views their assigned orders that need to be picked up from customers.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Assigned orders retrieved",
                    content = @Content(schema = @Schema(implementation = PageResponse.class)))
    })
    public ResponseEntity<PageResponse<OrderResponse>> getShipperAssignedOrders(
            @ParameterObject
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable,
            @AuthenticationPrincipal Account currentAccount
    ) {
        PageResponse<OrderResponse> response = orderService.getShipperAssignedOrders(pageable, currentAccount);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{orderId}/pickup")
    @PreAuthorize("hasRole('SHIPPER')")
    @Operation(
            summary = "Mark order as picked up",
            description = "Shipper confirms they have picked up the package from the customer's location.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Order marked as picked up",
                    content = @Content(schema = @Schema(implementation = OrderResponse.class))),
            @ApiResponse(responseCode = "400", description = "Order not in correct status"),
            @ApiResponse(responseCode = "403", description = "Not assigned to this order")
    })
    public ResponseEntity<OrderResponse> markOrderPickedUp(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @AuthenticationPrincipal Account currentAccount
    ) {
        OrderResponse response = orderService.markOrderPickedUp(orderId, currentAccount);
        return ResponseEntity.ok(response);
    }

    // ==================== COMMENT ====================

    @PostMapping("/{orderId}/comment")
    // @PreAuthorize("hasRole('CUSTOMER')") // Temporarily disabled for debugging
    @Operation(
            summary = "Add or update comment on order",
            description = "Add or update the comment for an order (each order has only one comment). " +
                    "Both sender and receiver customers can comment on the order. " +
                    "If a comment already exists, only the original creator can update it. " +
                    "Only one of the two parties (sender or receiver) can create the comment.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comment created or updated successfully",
                    content = @Content(schema = @Schema(implementation = CommentResponse.class))),
            @ApiResponse(responseCode = "400", description = "Invalid request data"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions - only sender/receiver can comment, or only creator can update"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<?> addOrUpdateComment(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @RequestBody(required = false) CreateCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            Account currentAccount = userDetails != null ? userDetails.getAccount() : null;
            
            log.info("=== CONTROLLER REACHED ===");
            log.info("Order ID: {}", orderId);
            log.info("Request body: {}", request);
            log.info("User details: {}", userDetails != null ? userDetails.getUsername() : "null");
            log.info("Current account: {}", currentAccount != null ? currentAccount.getUsername() : "null");
            log.info("========================");
            
            if (request == null) {
                return ResponseEntity.badRequest().body("Request body is required");
            }
            
            CommentResponse response = orderService.addOrUpdateComment(orderId, request, currentAccount);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating/updating comment for order {}: {}", orderId, e.getMessage(), e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{orderId}/comment")
    // @PreAuthorize("hasRole('CUSTOMER')") // Temporarily disabled for debugging
    @Operation(
            summary = "Get order comment",
            description = "Retrieve the comment for an order. " +
                    "Both sender and receiver customers can view the comment on their order.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Comment retrieved successfully"),
            @ApiResponse(responseCode = "204", description = "No comment exists for this order"),
            @ApiResponse(responseCode = "403", description = "Insufficient permissions"),
            @ApiResponse(responseCode = "404", description = "Order not found")
    })
    public ResponseEntity<CommentResponse> getOrderComment(
            @Parameter(description = "Order ID") @PathVariable UUID orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        Account currentAccount = userDetails != null ? userDetails.getAccount() : null;
        CommentResponse response = orderService.getOrderComment(orderId, currentAccount);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }
}
