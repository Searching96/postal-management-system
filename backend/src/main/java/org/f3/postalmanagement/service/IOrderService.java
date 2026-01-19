package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.order.AssignShipperRequest;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateCommentRequest;
import org.f3.postalmanagement.dto.request.order.AssignDeliveryRequest;
import org.f3.postalmanagement.dto.request.order.ReceiveIncomingRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
import org.f3.postalmanagement.dto.request.order.CustomerCreateOrderRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.order.CommentResponse;
import org.f3.postalmanagement.dto.response.order.OrderResponse;
import org.f3.postalmanagement.dto.response.order.GroupOrderResponse;
import org.f3.postalmanagement.dto.response.order.PriceCalculationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

/**
 * Service for managing shipping orders.
 */
public interface IOrderService {

    /**
     * Calculate shipping price and SLA before creating an order.
     * Staff can use this to show customer the price options.
     *
     * @param request the price calculation request
     * @param currentAccount the account of the staff making the request
     * @return price calculation with all service options
     */
    PriceCalculationResponse calculatePrice(CalculatePriceRequest request, Account currentAccount);

    /**
     * Create a new order at post office.
     * Supports both walk-in customers and registered customers.
     *
     * @param request the order creation request
     * @param currentAccount the account of the staff making the request
     * @return the created order with tracking number
     */
    OrderResponse createOrder(CreateOrderRequest request, Account currentAccount);

    /**
     * Get order details by ID.
     *
     * @param orderId the order ID
     * @param currentAccount the account of the user making the request
     * @return the order details
     */
    OrderResponse getOrderById(UUID orderId, Account currentAccount);

    /**
     * Get order details by tracking number (public tracking).
     *
     * @param trackingNumber the tracking number
     * @return the order details with tracking history
     */
    OrderResponse getOrderByTrackingNumber(String trackingNumber);

    /**
     * Get orders at the current staff's office with pagination and search.
     *
     * @param search optional search term
     * @param pageable pagination parameters
     * @param currentAccount the account of the staff making the request
     * @return paginated order list
     */
    PageResponse<OrderResponse> getOrdersByOffice(String search, OrderStatus status, Pageable pageable, Account currentAccount);

    /**
     * Get orders by sender phone number.
     *
     * @param senderPhone the sender's phone number
     * @param pageable pagination parameters
     * @return paginated order list
     */
    PageResponse<OrderResponse> getOrdersBySenderPhone(String senderPhone, Pageable pageable);

    /**
     * Get orders by registered customer ID.
     *
     * @param customerId the customer ID
     * @param pageable pagination parameters
     * @param currentAccount the account of the user making the request
     * @return paginated order list
     */
    PageResponse<OrderResponse> getOrdersByCustomerId(UUID customerId, Pageable pageable, Account currentAccount);

    // ==================== CUSTOMER ONLINE ORDER ====================

    /**
     * Create a pickup order by a registered customer online.
     * Customer selects the origin office for pickup.
     *
     * @param request the customer order request
     * @param currentAccount the customer's account
     * @return the created order with tracking number
     */
    OrderResponse createCustomerPickupOrder(CustomerCreateOrderRequest request, Account currentAccount);

    /**
     * Get pending pickup orders at an office (orders awaiting shipper assignment).
     *
     * @param pageable pagination parameters
     * @param currentAccount the staff's account
     * @return paginated list of pending pickup orders
     */
    PageResponse<OrderResponse> getPendingPickupOrders(Pageable pageable, Account currentAccount);

    // ==================== SHIPPER ASSIGNMENT ====================

    /**
     * Assign a shipper to pick up an order from customer's location.
     * The shipper will receive a notification.
     *
     * @param request the assignment request
     * @param currentAccount the staff's account
     * @return the updated order
     */
    OrderResponse assignShipperToPickup(AssignShipperRequest request, Account currentAccount);

    /**
     * Get orders assigned to a shipper for pickup.
     *
     * @param search optional search term (tracking number, sender name, phone, address)
     * @param pageable pagination parameters
     * @param currentAccount the shipper's account
     * @return paginated list of assigned orders
     */
    PageResponse<OrderResponse> getShipperAssignedOrders(String search, Pageable pageable, Account currentAccount);

    /**
     * Mark an order as picked up by shipper.
     *
     * @param orderId the order ID
     * @param currentAccount the shipper's account
     * @return the updated order
     */
    OrderResponse markOrderPickedUp(UUID orderId, Account currentAccount);

    // ==================== COMMENT ====================

    /**
     * Add or update the comment for an order.
     * If a comment already exists, it will be updated.
     * Staff can add both internal and public comments.
     * Customers can only add public comments.
     *
     * @param orderId the order ID
     * @param request the comment request
     * @param currentAccount the account of the user making the request
     * @return the created or updated comment
     */
    CommentResponse addOrUpdateComment(UUID orderId, CreateCommentRequest request, Account currentAccount);

    /**
     * Get the comment for an order.
     * Customers only see public comments.
     * Staff can see all comments including internal.
     *
     * @param orderId the order ID
     * @param currentAccount the account of the user making the request
     * @return the comment, or null if no comment exists or not accessible
     */
    CommentResponse getOrderComment(UUID orderId, Account currentAccount);
  
    /**
     * Get orders assigned to a shipper for delivery (last mile).
     *
     * @param search optional search term (tracking number, receiver name, phone, address)
     * @param pageable pagination parameters
     * @param currentAccount the shipper's account
     * @return paginated list of assigned orders for delivery
     */
    PageResponse<OrderResponse> getShipperDeliveryOrders(String search, Pageable pageable, Account currentAccount);

    /**
     * Accept a walk-in order or pickup order at the office.
     *
     * @param orderId the order ID
     * @param currentAccount the staff's account
     * @return the updated order
     */
    OrderResponse acceptOrder(UUID orderId, Account currentAccount);

    /**
     * Assign multiple orders to a shipper for delivery from the destination office.
     *
     * @param request the assignment request
     * @param currentAccount the staff's account
     * @return summary of the operation
     */
    GroupOrderResponse assignOrdersToShipper(AssignDeliveryRequest request, Account currentAccount);

    /**
     * Mark orders as received at the current office.
     * Moves orders from IN_TRANSIT_TO_OFFICE to AT_DESTINATION_OFFICE.
     *
     * @param request the receive request
     * @param currentAccount the staff's account
     * @return summary of the operation
     */
    GroupOrderResponse receiveOrders(ReceiveIncomingRequest request, Account currentAccount);
  
    /**
     * Mark an order as delivered by shipper.
     *
     * @param orderId the order ID
     * @param currentAccount the shipper's account
     * @return the updated order
     */
    OrderResponse markOrderDelivered(UUID orderId, Account currentAccount);

    /**
     * Mark an order as delivery failed by shipper.
     *
     * @param orderId the order ID
     * @param note reason for failure
     * @param currentAccount the shipper's account
     * @return the updated order
     */
    OrderResponse markOrderDeliveryFailed(UUID orderId, String note, Account currentAccount);
}
