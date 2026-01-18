package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.tracking.LocationUpdateRequest;
import org.f3.postalmanagement.dto.response.tracking.ShipperLocationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.tracking.ShipperLocation;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.exception.BadRequestException;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OrderRepository;
import org.f3.postalmanagement.repository.ShipperLocationRepository;
import org.f3.postalmanagement.service.ITrackingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class TrackingServiceImpl implements ITrackingService {

    private final ShipperLocationRepository locationRepository;
    private final EmployeeRepository employeeRepository;
    private final OrderRepository orderRepository;

    @Override
    @Transactional
    public void updateLocation(LocationUpdateRequest request, Account currentAccount) {
        Employee shipper = employeeRepository.findByAccount(currentAccount)
                .orElseThrow(() -> new NotFoundException("Shipper not found"));

        ShipperLocation location = locationRepository.findByShipperId(shipper.getId())
                .orElseGet(() -> {
                    ShipperLocation newLocation = new ShipperLocation();
                    newLocation.setShipper(shipper);
                    return newLocation;
                });

        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setAccuracy(request.getAccuracy());
        location.setHeading(request.getHeading());
        location.setSpeed(request.getSpeed());
        location.setTimestamp(LocalDateTime.now());
        location.setIsActive(true);

        locationRepository.save(location);
        log.debug("Updated location for shipper {}: {}, {}", 
            shipper.getId(), request.getLatitude(), request.getLongitude());
    }

    @Override
    @Transactional(readOnly = true)
    public ShipperLocationResponse getShipperLocation(UUID shipperId) {
        ShipperLocation location = locationRepository.findByShipperId(shipperId)
                .orElseThrow(() -> new NotFoundException("Shipper location not found"));
        return mapToResponse(location);
    }

    @Override
    @Transactional(readOnly = true)
    public ShipperLocationResponse getShipperLocationForOrder(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Only allow tracking when order is OUT_FOR_DELIVERY
        if (order.getStatus() != OrderStatus.OUT_FOR_DELIVERY) {
            throw new BadRequestException("Order is not currently out for delivery");
        }

        if (order.getAssignedShipper() == null) {
            throw new BadRequestException("No shipper assigned to this order");
        }

        ShipperLocation location = locationRepository.findByShipperId(order.getAssignedShipper().getId())
                .orElseThrow(() -> new NotFoundException("Shipper location not available"));

        return mapToResponse(location);
    }

    @Override
    @Transactional
    public void startDeliverySession(UUID orderId, Account currentAccount) {
        Employee shipper = employeeRepository.findByAccount(currentAccount)
                .orElseThrow(() -> new NotFoundException("Shipper not found"));

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Verify shipper is assigned to this order
        if (order.getAssignedShipper() == null || 
            !order.getAssignedShipper().getId().equals(shipper.getId())) {
            throw new ForbiddenException("You are not assigned to this order");
        }

        // Update order status
        order.setStatus(OrderStatus.OUT_FOR_DELIVERY);
        orderRepository.save(order);

        // Update shipper location record with active order
        ShipperLocation location = locationRepository.findByShipperId(shipper.getId())
                .orElseGet(() -> {
                    ShipperLocation newLocation = new ShipperLocation();
                    newLocation.setShipper(shipper);
                    newLocation.setTimestamp(LocalDateTime.now());
                    return newLocation;
                });

        // Add order to active orders list
        String activeOrders = location.getActiveOrderIds();
        if (activeOrders == null || activeOrders.isEmpty()) {
            activeOrders = orderId.toString();
        } else if (!activeOrders.contains(orderId.toString())) {
            activeOrders = activeOrders + "," + orderId.toString();
        }
        location.setActiveOrderIds(activeOrders);
        location.setIsActive(true);
        locationRepository.save(location);

        log.info("Shipper {} started delivery for order {}", shipper.getId(), orderId);
    }

    @Override
    @Transactional
    public void endDeliverySession(UUID orderId, Account currentAccount) {
        Employee shipper = employeeRepository.findByAccount(currentAccount)
                .orElseThrow(() -> new NotFoundException("Shipper not found"));

        ShipperLocation location = locationRepository.findByShipperId(shipper.getId())
                .orElse(null);

        if (location != null && location.getActiveOrderIds() != null) {
            // Remove order from active list
            List<String> orderIds = Arrays.stream(location.getActiveOrderIds().split(","))
                    .filter(id -> !id.equals(orderId.toString()))
                    .collect(Collectors.toList());

            if (orderIds.isEmpty()) {
                location.setActiveOrderIds(null);
                location.setIsActive(false);
            } else {
                location.setActiveOrderIds(String.join(",", orderIds));
            }
            locationRepository.save(location);
        }

        log.info("Shipper {} ended delivery for order {}", shipper.getId(), orderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShipperLocationResponse> getActiveShippers() {
        LocalDateTime since = LocalDateTime.now().minusMinutes(30);
        return locationRepository.findActiveShippers(since).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ShipperLocationResponse mapToResponse(ShipperLocation location) {
        Employee shipper = location.getShipper();
        return ShipperLocationResponse.builder()
                .shipperId(shipper.getId())
                .shipperName(shipper.getFullName())
                .shipperPhone(shipper.getPhoneNumber())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .accuracy(location.getAccuracy())
                .heading(location.getHeading())
                .speed(location.getSpeed())
                .timestamp(location.getTimestamp())
                .isActive(location.getIsActive())
                .build();
    }
}
