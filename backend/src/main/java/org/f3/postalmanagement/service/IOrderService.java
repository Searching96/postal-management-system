package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
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
}
