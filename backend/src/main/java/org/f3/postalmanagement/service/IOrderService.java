package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.order.AssignShipperRequest;
import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
import org.f3.postalmanagement.dto.request.order.CustomerCreateOrderRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.order.OrderResponse;
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
    PageResponse<OrderResponse> getOrdersByOffice(String search, Pageable pageable, Account currentAccount);

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
     * Calculate shipping price for customer's online order.
     * Uses customer's pickup ward as origin for distance calculation.
     *
     * @param request the price calculation request
     * @param pickupWardCode the ward code where pickup will happen
     * @return price calculation with all service options
     */
    PriceCalculationResponse calculatePriceForCustomer(CalculatePriceRequest request, String pickupWardCode);

    /**
     * Create a pickup order by a registered customer online.
     * Staff at the nearest office will be notified to assign a shipper.
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
     * @param pageable pagination parameters
     * @param currentAccount the shipper's account
     * @return paginated list of assigned orders
     */
    PageResponse<OrderResponse> getShipperAssignedOrders(Pageable pageable, Account currentAccount);

    /**
     * Mark an order as picked up by shipper.
     *
     * @param orderId the order ID
     * @param currentAccount the shipper's account
     * @return the updated order
     */
    OrderResponse markOrderPickedUp(UUID orderId, Account currentAccount);
}
