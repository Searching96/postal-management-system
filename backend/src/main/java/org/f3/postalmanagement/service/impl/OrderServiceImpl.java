package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.notification.NotificationMessage;
import org.f3.postalmanagement.dto.request.order.AssignShipperRequest;
import org.f3.postalmanagement.dto.request.order.CalculatePriceRequest;
import org.f3.postalmanagement.dto.request.order.CreateOrderRequest;
import org.f3.postalmanagement.dto.request.order.CustomerCreateOrderRequest;
import org.f3.postalmanagement.dto.response.PageResponse;
import org.f3.postalmanagement.dto.response.order.OrderResponse;
import org.f3.postalmanagement.dto.response.order.PriceCalculationResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Customer;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.order.OrderStatusHistory;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.PackageType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.enums.ServiceType;
import org.f3.postalmanagement.repository.*;
import org.f3.postalmanagement.service.INotificationService;
import org.f3.postalmanagement.service.IOrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Service
@Slf4j
@RequiredArgsConstructor
public class OrderServiceImpl implements IOrderService {

    private final OrderRepository orderRepository;
    private final OrderStatusHistoryRepository statusHistoryRepository;
    private final EmployeeRepository employeeRepository;
    private final CustomerRepository customerRepository;
    private final WardRepository wardRepository;
    private final OfficeRepository officeRepository;
    private final INotificationService notificationService;

    // ==================== PRICING CONSTANTS ====================
    // In a real system, these would come from a PriceTable entity
    
    private static final BigDecimal BASE_RATE_EXPRESS = new BigDecimal("150000");
    private static final BigDecimal BASE_RATE_STANDARD = new BigDecimal("55000");
    private static final BigDecimal BASE_RATE_ECONOMY = new BigDecimal("35000");
    
    private static final BigDecimal WEIGHT_RATE_PER_KG = new BigDecimal("5000");
    private static final BigDecimal WEIGHT_THRESHOLD = new BigDecimal("2.0");
    
    private static final BigDecimal INTER_PROVINCE_SURCHARGE = new BigDecimal("15000");
    private static final BigDecimal INTER_REGION_SURCHARGE = new BigDecimal("30000");
    
    private static final BigDecimal FRAGILE_SURCHARGE = new BigDecimal("10000");
    private static final BigDecimal VALUABLE_SURCHARGE = new BigDecimal("20000");
    private static final BigDecimal PERISHABLE_SURCHARGE = new BigDecimal("15000");
    private static final BigDecimal OVERSIZED_SURCHARGE = new BigDecimal("25000");
    
    private static final BigDecimal INSURANCE_RATE = new BigDecimal("0.01"); // 1% of declared value
    
    private static final int EXPRESS_DAYS = 1;
    private static final int STANDARD_DAYS = 3;
    private static final int ECONOMY_DAYS = 5;

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponse calculatePrice(CalculatePriceRequest request, Account currentAccount) {
        validateStaffRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office originOffice = currentEmployee.getOffice();
        
        // Get destination ward
        Ward destinationWard = wardRepository.findById(request.getDestinationWardCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination ward not found: " + request.getDestinationWardCode()));
        
        // Calculate weights
        BigDecimal actualWeight = request.getWeightKg();
        BigDecimal volumetricWeight = calculateVolumetricWeight(request.getLengthCm(), request.getWidthCm(), request.getHeightCm());
        BigDecimal chargeableWeight = actualWeight.max(volumetricWeight != null ? volumetricWeight : BigDecimal.ZERO);
        
        // Determine routing info
        boolean sameProvince = originOffice.getProvince().getCode().equals(destinationWard.getProvince().getCode());
        boolean sameRegion = originOffice.getRegion().getId().equals(destinationWard.getProvince().getAdministrativeRegion().getId());
        
        // Calculate surcharges
        BigDecimal weightSurcharge = calculateWeightSurcharge(chargeableWeight);
        BigDecimal packageTypeSurcharge = calculatePackageTypeSurcharge(request.getPackageType());
        BigDecimal distanceSurcharge = calculateDistanceSurcharge(sameProvince, sameRegion);
        BigDecimal insuranceFee = request.isAddInsurance() && request.getDeclaredValue() != null 
                ? request.getDeclaredValue().multiply(INSURANCE_RATE).setScale(0, RoundingMode.UP)
                : BigDecimal.ZERO;
        
        // Build service options
        List<PriceCalculationResponse.ServiceOption> serviceOptions = new ArrayList<>();
        
        for (ServiceType serviceType : ServiceType.values()) {
            BigDecimal baseRate = getBaseRate(serviceType);
            BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
            BigDecimal totalAmount = shippingFee.add(insuranceFee);
            int deliveryDays = getDeliveryDays(serviceType, sameProvince, sameRegion);
            LocalDateTime estimatedDelivery = calculateEstimatedDeliveryDate(deliveryDays);
            
            serviceOptions.add(PriceCalculationResponse.ServiceOption.builder()
                    .serviceType(serviceType)
                    .serviceName(getServiceName(serviceType))
                    .shippingFee(shippingFee)
                    .totalAmount(totalAmount)
                    .estimatedDeliveryDays(deliveryDays)
                    .estimatedDeliveryDate(estimatedDelivery)
                    .slaDescription(getSlaDescription(serviceType, deliveryDays))
                    .build());
        }
        
        // Get selected service details
        ServiceType selectedService = request.getServiceType();
        BigDecimal baseRate = getBaseRate(selectedService);
        BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
        BigDecimal totalAmount = shippingFee.add(insuranceFee);
        int deliveryDays = getDeliveryDays(selectedService, sameProvince, sameRegion);
        
        return PriceCalculationResponse.builder()
                .actualWeightKg(actualWeight)
                .volumetricWeightKg(volumetricWeight)
                .chargeableWeightKg(chargeableWeight)
                .originProvinceName(originOffice.getProvince().getName())
                .destinationProvinceName(destinationWard.getProvince().getName())
                .destinationWardName(destinationWard.getName())
                .sameProvince(sameProvince)
                .sameRegion(sameRegion)
                .baseShippingFee(baseRate)
                .weightSurcharge(weightSurcharge)
                .packageTypeSurcharge(packageTypeSurcharge)
                .distanceSurcharge(distanceSurcharge)
                .shippingFee(shippingFee)
                .insuranceFee(insuranceFee)
                .totalAmount(totalAmount)
                .serviceType(selectedService)
                .estimatedDeliveryDays(deliveryDays)
                .estimatedDeliveryDate(calculateEstimatedDeliveryDate(deliveryDays))
                .slaDescription(getSlaDescription(selectedService, deliveryDays))
                .availableServices(serviceOptions)
                .build();
    }

    @Override
    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Account currentAccount) {
        validateStaffRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        Office originOffice = currentEmployee.getOffice();
        
        // Validate office is a post office (not warehouse)
        if (originOffice.getOfficeType() != OfficeType.PROVINCE_POST && 
            originOffice.getOfficeType() != OfficeType.WARD_POST) {
            throw new IllegalArgumentException("Orders can only be created at post offices, not warehouses");
        }
        
        // Get destination ward
        Ward destinationWard = wardRepository.findById(request.getDestinationWardCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination ward not found: " + request.getDestinationWardCode()));
        
        // Get sender customer if provided
        Customer senderCustomer = null;
        if (request.getSenderCustomerId() != null) {
            senderCustomer = customerRepository.findById(request.getSenderCustomerId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found: " + request.getSenderCustomerId()));
        }
        
        // Calculate weights
        BigDecimal volumetricWeight = calculateVolumetricWeight(request.getLengthCm(), request.getWidthCm(), request.getHeightCm());
        BigDecimal chargeableWeight = request.getWeightKg().max(volumetricWeight != null ? volumetricWeight : BigDecimal.ZERO);
        
        // Calculate pricing
        boolean sameProvince = originOffice.getProvince().getCode().equals(destinationWard.getProvince().getCode());
        boolean sameRegion = originOffice.getRegion().getId().equals(destinationWard.getProvince().getAdministrativeRegion().getId());
        
        BigDecimal baseRate = getBaseRate(request.getServiceType());
        BigDecimal weightSurcharge = calculateWeightSurcharge(chargeableWeight);
        BigDecimal packageTypeSurcharge = calculatePackageTypeSurcharge(request.getPackageType());
        BigDecimal distanceSurcharge = calculateDistanceSurcharge(sameProvince, sameRegion);
        BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
        
        BigDecimal insuranceFee = BigDecimal.ZERO;
        if (request.isAddInsurance() && request.getDeclaredValue() != null) {
            insuranceFee = request.getDeclaredValue().multiply(INSURANCE_RATE).setScale(0, RoundingMode.UP);
        }
        BigDecimal totalAmount = shippingFee.add(insuranceFee);
        
        int deliveryDays = getDeliveryDays(request.getServiceType(), sameProvince, sameRegion);
        LocalDateTime estimatedDelivery = calculateEstimatedDeliveryDate(deliveryDays);
        
        // Generate tracking number
        String trackingNumber = generateTrackingNumber();
        
        // Create order
        Order order = new Order();
        order.setTrackingNumber(trackingNumber);
        
        // Sender info
        order.setSenderCustomer(senderCustomer);
        order.setSenderName(request.getSenderName());
        order.setSenderPhone(request.getSenderPhone());
        order.setSenderAddress(request.getSenderAddress());
        
        // Receiver info
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverAddress(request.getReceiverAddress());
        order.setDestinationWard(destinationWard);
        
        // Package info
        order.setPackageType(request.getPackageType());
        order.setPackageDescription(request.getPackageDescription());
        order.setWeightKg(request.getWeightKg());
        order.setLengthCm(request.getLengthCm());
        order.setWidthCm(request.getWidthCm());
        order.setHeightCm(request.getHeightCm());
        order.setVolumetricWeightKg(volumetricWeight);
        order.setChargeableWeightKg(chargeableWeight);
        
        // Service & pricing
        order.setServiceType(request.getServiceType());
        order.setShippingFee(shippingFee);
        order.setCodAmount(request.getCodAmount() != null ? request.getCodAmount() : BigDecimal.ZERO);
        order.setDeclaredValue(request.getDeclaredValue());
        order.setInsuranceFee(insuranceFee);
        order.setTotalAmount(totalAmount);
        
        // SLA
        order.setEstimatedDeliveryDate(estimatedDelivery);
        
        // Status & location
        order.setStatus(OrderStatus.CREATED);
        order.setOriginOffice(originOffice);
        order.setCurrentOffice(originOffice);
        order.setCreatedByEmployee(currentEmployee);
        
        // Notes
        order.setDeliveryInstructions(request.getDeliveryInstructions());
        order.setInternalNotes(request.getInternalNotes());
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Create initial status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.CREATED);
        history.setOffice(originOffice);
        history.setEmployee(currentEmployee);
        history.setDescription("Order created at " + originOffice.getOfficeName());
        statusHistoryRepository.save(history);
        
        log.info("Created order {} at office {} by staff {}", 
                trackingNumber, originOffice.getOfficeName(), currentEmployee.getFullName());
        
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(UUID orderId, Account currentAccount) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        // Add status history
        List<OrderStatusHistory> history = statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(orderId);
        
        OrderResponse response = mapToOrderResponse(order);
        response.setStatusHistory(mapToStatusHistoryItems(history));
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingNumber(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new IllegalArgumentException("Order not found with tracking number: " + trackingNumber));
        
        // Add status history
        List<OrderStatusHistory> history = statusHistoryRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        
        OrderResponse response = mapToOrderResponse(order);
        response.setStatusHistory(mapToStatusHistoryItems(history));
        
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrdersByOffice(String search, Pageable pageable, Account currentAccount) {
        validateStaffRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        UUID officeId = currentEmployee.getOffice().getId();
        
        Page<Order> orderPage = orderRepository.findByOriginOfficeIdWithSearch(officeId, search, pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
        
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrdersBySenderPhone(String senderPhone, Pageable pageable) {
        Page<Order> orderPage = orderRepository.findBySenderPhone(senderPhone, pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
        
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getOrdersByCustomerId(UUID customerId, Pageable pageable, Account currentAccount) {
        // Customers can only view their own orders
        if (currentAccount.getRole() == Role.CUSTOMER) {
            Customer customer = customerRepository.findByAccountId(currentAccount.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Customer not found for account"));
            if (!customer.getId().equals(customerId)) {
                throw new AccessDeniedException("You can only view your own orders");
            }
        }
        
        Page<Order> orderPage = orderRepository.findBySenderCustomerId(customerId, pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
        
        return mapToPageResponse(responsePage);
    }

    // ==================== PRIVATE HELPER METHODS ====================

    private void validateStaffRole(Account account) {
        Role role = account.getRole();
        if (role != Role.PO_STAFF && role != Role.PO_WARD_MANAGER && role != Role.PO_PROVINCE_ADMIN) {
            throw new AccessDeniedException("Only post office staff can perform this action");
        }
    }

    private Employee getCurrentEmployee(Account account) {
        return employeeRepository.findById(account.getId())
                .orElseThrow(() -> new IllegalArgumentException("Employee not found for account"));
    }

    private BigDecimal calculateVolumetricWeight(BigDecimal length, BigDecimal width, BigDecimal height) {
        if (length == null || width == null || height == null) {
            return null;
        }
        // Volumetric weight = L x W x H / 5000
        return length.multiply(width).multiply(height)
                .divide(new BigDecimal("5000"), 2, RoundingMode.UP);
    }

    private BigDecimal calculateWeightSurcharge(BigDecimal chargeableWeight) {
        if (chargeableWeight.compareTo(WEIGHT_THRESHOLD) <= 0) {
            return BigDecimal.ZERO;
        }
        // Surcharge for weight above threshold
        return chargeableWeight.subtract(WEIGHT_THRESHOLD).multiply(WEIGHT_RATE_PER_KG)
                .setScale(0, RoundingMode.UP);
    }

    private BigDecimal calculatePackageTypeSurcharge(PackageType packageType) {
        return switch (packageType) {
            case FRAGILE -> FRAGILE_SURCHARGE;
            case VALUABLE -> VALUABLE_SURCHARGE;
            case PERISHABLE -> PERISHABLE_SURCHARGE;
            case OVERSIZED -> OVERSIZED_SURCHARGE;
            default -> BigDecimal.ZERO;
        };
    }

    private BigDecimal calculateDistanceSurcharge(boolean sameProvince, boolean sameRegion) {
        if (sameProvince) {
            return BigDecimal.ZERO;
        } else if (sameRegion) {
            return INTER_PROVINCE_SURCHARGE;
        } else {
            return INTER_REGION_SURCHARGE;
        }
    }

    private BigDecimal getBaseRate(ServiceType serviceType) {
        return switch (serviceType) {
            case EXPRESS -> BASE_RATE_EXPRESS;
            case STANDARD -> BASE_RATE_STANDARD;
            case ECONOMY -> BASE_RATE_ECONOMY;
        };
    }

    private int getDeliveryDays(ServiceType serviceType, boolean sameProvince, boolean sameRegion) {
        int baseDays = switch (serviceType) {
            case EXPRESS -> EXPRESS_DAYS;
            case STANDARD -> STANDARD_DAYS;
            case ECONOMY -> ECONOMY_DAYS;
        };
        
        // Add extra days for inter-province/region
        if (!sameProvince) {
            baseDays += 1;
        }
        if (!sameRegion) {
            baseDays += 1;
        }
        
        return baseDays;
    }

    private LocalDateTime calculateEstimatedDeliveryDate(int businessDays) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime result = now;
        
        int addedDays = 0;
        while (addedDays < businessDays) {
            result = result.plusDays(1);
            // Skip weekends
            if (result.getDayOfWeek() != DayOfWeek.SATURDAY && result.getDayOfWeek() != DayOfWeek.SUNDAY) {
                addedDays++;
            }
        }
        
        // Set to end of business day (6 PM)
        return result.with(LocalTime.of(18, 0));
    }

    private String getServiceName(ServiceType serviceType) {
        return switch (serviceType) {
            case EXPRESS -> "Express Delivery (Hỏa tốc)";
            case STANDARD -> "Standard Delivery (Chuyển phát nhanh)";
            case ECONOMY -> "Economy Delivery (Tiết kiệm)";
        };
    }

    private String getSlaDescription(ServiceType serviceType, int days) {
        return switch (serviceType) {
            case EXPRESS -> days == 1 ? "Next business day" : days + " business days";
            case STANDARD -> days + "-" + (days + 1) + " business days";
            case ECONOMY -> days + "-" + (days + 2) + " business days";
        };
    }

    private String generateTrackingNumber() {
        // Format: VN + 9 digits + VN (e.g., VN123456789VN)
        Random random = new Random();
        String number;
        do {
            int randomNumber = 100000000 + random.nextInt(900000000);
            number = "VN" + randomNumber + "VN";
        } while (orderRepository.existsByTrackingNumber(number));
        
        return number;
    }

    private OrderResponse mapToOrderResponse(Order order) {
        String dimensions = null;
        if (order.getLengthCm() != null && order.getWidthCm() != null && order.getHeightCm() != null) {
            dimensions = order.getLengthCm() + " x " + order.getWidthCm() + " x " + order.getHeightCm() + " cm";
        }
        
        return OrderResponse.builder()
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .senderCustomerId(order.getSenderCustomer() != null ? order.getSenderCustomer().getId() : null)
                .senderName(order.getSenderName())
                .senderPhone(order.getSenderPhone())
                .senderAddress(order.getSenderAddress())
                .receiverName(order.getReceiverName())
                .receiverPhone(order.getReceiverPhone())
                .receiverAddress(order.getReceiverAddress())
                .destinationWardName(order.getDestinationWard() != null ? order.getDestinationWard().getName() : null)
                .destinationProvinceName(order.getDestinationWard() != null ? order.getDestinationWard().getProvince().getName() : null)
                .packageType(order.getPackageType())
                .packageDescription(order.getPackageDescription())
                .weightKg(order.getWeightKg())
                .chargeableWeightKg(order.getChargeableWeightKg())
                .dimensions(dimensions)
                .serviceType(order.getServiceType())
                .shippingFee(order.getShippingFee())
                .codAmount(order.getCodAmount())
                .insuranceFee(order.getInsuranceFee())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus())
                .statusDescription(getStatusDescription(order.getStatus()))
                .estimatedDeliveryDate(order.getEstimatedDeliveryDate())
                .actualDeliveryDate(order.getActualDeliveryDate())
                .originOfficeName(order.getOriginOffice() != null ? order.getOriginOffice().getOfficeName() : null)
                .currentOfficeName(order.getCurrentOffice() != null ? order.getCurrentOffice().getOfficeName() : null)
                .destinationOfficeName(order.getDestinationOffice() != null ? order.getDestinationOffice().getOfficeName() : null)
                .createdByEmployeeName(order.getCreatedByEmployee() != null ? order.getCreatedByEmployee().getFullName() : null)
                .assignedShipperName(order.getAssignedShipper() != null ? order.getAssignedShipper().getFullName() : null)
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .deliveryInstructions(order.getDeliveryInstructions())
                .build();
    }

    private String getStatusDescription(OrderStatus status) {
        return switch (status) {
            case CREATED -> "Order created at post office";
            case PENDING_PICKUP -> "Waiting for pickup";
            case PICKED_UP -> "Package picked up";
            case AT_ORIGIN_OFFICE -> "At origin post office";
            case SORTED_AT_ORIGIN -> "Sorted and ready for transit";
            case IN_TRANSIT_TO_HUB -> "In transit to regional hub";
            case AT_HUB -> "At regional hub";
            case IN_TRANSIT_TO_DESTINATION -> "In transit to destination region";
            case AT_DESTINATION_HUB -> "At destination hub";
            case IN_TRANSIT_TO_OFFICE -> "In transit to destination office";
            case AT_DESTINATION_OFFICE -> "At destination post office";
            case OUT_FOR_DELIVERY -> "Out for delivery";
            case DELIVERED -> "Successfully delivered";
            case DELIVERY_FAILED -> "Delivery attempt failed";
            case RETURNING -> "Being returned to sender";
            case RETURNED -> "Returned to sender";
            case ON_HOLD -> "On hold";
            case LOST -> "Package lost";
            case DAMAGED -> "Package damaged";
            case CANCELLED -> "Order cancelled";
        };
    }

    private List<OrderResponse.StatusHistoryItem> mapToStatusHistoryItems(List<OrderStatusHistory> history) {
        return history.stream()
                .map(h -> OrderResponse.StatusHistoryItem.builder()
                        .status(h.getStatus())
                        .description(h.getDescription() != null ? h.getDescription() : getStatusDescription(h.getStatus()))
                        .location(h.getOffice() != null ? h.getOffice().getOfficeName() : h.getLocationDetails())
                        .timestamp(h.getCreatedAt())
                        .build())
                .toList();
    }

    private <T> PageResponse<T> mapToPageResponse(Page<T> page) {
        return PageResponse.<T>builder()
                .content(page.getContent())
                .pageNumber(page.getNumber())
                .pageSize(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .first(page.isFirst())
                .last(page.isLast())
                .hasNext(page.hasNext())
                .hasPrevious(page.hasPrevious())
                .build();
    }

    // ==================== CUSTOMER ONLINE ORDER METHODS ====================

    @Override
    @Transactional(readOnly = true)
    public PriceCalculationResponse calculatePriceForCustomer(CalculatePriceRequest request, String pickupWardCode) {
        // Get pickup ward to determine origin
        Ward pickupWard = wardRepository.findById(pickupWardCode)
                .orElseThrow(() -> new IllegalArgumentException("Pickup ward not found: " + pickupWardCode));
        
        // Get destination ward
        Ward destinationWard = wardRepository.findById(request.getDestinationWardCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination ward not found: " + request.getDestinationWardCode()));
        
        // Calculate weights
        BigDecimal actualWeight = request.getWeightKg();
        BigDecimal volumetricWeight = calculateVolumetricWeight(request.getLengthCm(), request.getWidthCm(), request.getHeightCm());
        BigDecimal chargeableWeight = actualWeight.max(volumetricWeight != null ? volumetricWeight : BigDecimal.ZERO);
        
        // Determine routing info based on wards
        boolean sameProvince = pickupWard.getProvince().getCode().equals(destinationWard.getProvince().getCode());
        boolean sameRegion = pickupWard.getProvince().getAdministrativeRegion().getId()
                .equals(destinationWard.getProvince().getAdministrativeRegion().getId());
        
        // Calculate surcharges
        BigDecimal weightSurcharge = calculateWeightSurcharge(chargeableWeight);
        BigDecimal packageTypeSurcharge = calculatePackageTypeSurcharge(request.getPackageType());
        BigDecimal distanceSurcharge = calculateDistanceSurcharge(sameProvince, sameRegion);
        BigDecimal insuranceFee = request.isAddInsurance() && request.getDeclaredValue() != null 
                ? request.getDeclaredValue().multiply(INSURANCE_RATE).setScale(0, RoundingMode.UP)
                : BigDecimal.ZERO;
        
        // Build service options
        List<PriceCalculationResponse.ServiceOption> serviceOptions = new ArrayList<>();
        
        for (ServiceType serviceType : ServiceType.values()) {
            BigDecimal baseRate = getBaseRate(serviceType);
            BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
            BigDecimal totalAmount = shippingFee.add(insuranceFee);
            int deliveryDays = getDeliveryDays(serviceType, sameProvince, sameRegion);
            LocalDateTime estimatedDelivery = calculateEstimatedDeliveryDate(deliveryDays);
            
            serviceOptions.add(PriceCalculationResponse.ServiceOption.builder()
                    .serviceType(serviceType)
                    .serviceName(getServiceName(serviceType))
                    .shippingFee(shippingFee)
                    .totalAmount(totalAmount)
                    .estimatedDeliveryDays(deliveryDays)
                    .estimatedDeliveryDate(estimatedDelivery)
                    .slaDescription(getSlaDescription(serviceType, deliveryDays))
                    .build());
        }
        
        // Get selected service details
        ServiceType selectedService = request.getServiceType();
        BigDecimal baseRate = getBaseRate(selectedService);
        BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
        BigDecimal totalAmount = shippingFee.add(insuranceFee);
        int deliveryDays = getDeliveryDays(selectedService, sameProvince, sameRegion);
        
        return PriceCalculationResponse.builder()
                .actualWeightKg(actualWeight)
                .volumetricWeightKg(volumetricWeight)
                .chargeableWeightKg(chargeableWeight)
                .originProvinceName(pickupWard.getProvince().getName())
                .destinationProvinceName(destinationWard.getProvince().getName())
                .destinationWardName(destinationWard.getName())
                .sameProvince(sameProvince)
                .sameRegion(sameRegion)
                .baseShippingFee(baseRate)
                .weightSurcharge(weightSurcharge)
                .packageTypeSurcharge(packageTypeSurcharge)
                .distanceSurcharge(distanceSurcharge)
                .shippingFee(shippingFee)
                .insuranceFee(insuranceFee)
                .totalAmount(totalAmount)
                .serviceType(selectedService)
                .estimatedDeliveryDays(deliveryDays)
                .estimatedDeliveryDate(calculateEstimatedDeliveryDate(deliveryDays))
                .slaDescription(getSlaDescription(selectedService, deliveryDays))
                .availableServices(serviceOptions)
                .build();
    }

    @Override
    @Transactional
    public OrderResponse createCustomerPickupOrder(CustomerCreateOrderRequest request, Account currentAccount) {
        // Validate customer role
        if (currentAccount.getRole() != Role.CUSTOMER) {
            throw new AccessDeniedException("Only customers can create pickup orders");
        }
        
        // Get customer
        Customer customer = customerRepository.findByAccountId(currentAccount.getId())
                .orElseThrow(() -> new IllegalArgumentException("Customer not found for account"));
        
        // Get pickup ward
        Ward pickupWard = wardRepository.findById(request.getPickupWardCode())
                .orElseThrow(() -> new IllegalArgumentException("Pickup ward not found: " + request.getPickupWardCode()));
        
        // Get destination ward
        Ward destinationWard = wardRepository.findById(request.getDestinationWardCode())
                .orElseThrow(() -> new IllegalArgumentException("Destination ward not found: " + request.getDestinationWardCode()));
        
        // Find the nearest post office (ward-level or province-level)
        Office originOffice = findNearestPostOffice(pickupWard);
        if (originOffice == null) {
            throw new IllegalArgumentException("No post office found for pickup location");
        }
        
        // Calculate weights
        BigDecimal volumetricWeight = calculateVolumetricWeight(request.getLengthCm(), request.getWidthCm(), request.getHeightCm());
        BigDecimal chargeableWeight = request.getWeightKg().max(volumetricWeight != null ? volumetricWeight : BigDecimal.ZERO);
        
        // Calculate pricing
        boolean sameProvince = pickupWard.getProvince().getCode().equals(destinationWard.getProvince().getCode());
        boolean sameRegion = pickupWard.getProvince().getAdministrativeRegion().getId()
                .equals(destinationWard.getProvince().getAdministrativeRegion().getId());
        
        BigDecimal baseRate = getBaseRate(request.getServiceType());
        BigDecimal weightSurcharge = calculateWeightSurcharge(chargeableWeight);
        BigDecimal packageTypeSurcharge = calculatePackageTypeSurcharge(request.getPackageType());
        BigDecimal distanceSurcharge = calculateDistanceSurcharge(sameProvince, sameRegion);
        BigDecimal shippingFee = baseRate.add(weightSurcharge).add(packageTypeSurcharge).add(distanceSurcharge);
        
        BigDecimal insuranceFee = BigDecimal.ZERO;
        if (request.isAddInsurance() && request.getDeclaredValue() != null) {
            insuranceFee = request.getDeclaredValue().multiply(INSURANCE_RATE).setScale(0, RoundingMode.UP);
        }
        BigDecimal totalAmount = shippingFee.add(insuranceFee);
        
        int deliveryDays = getDeliveryDays(request.getServiceType(), sameProvince, sameRegion);
        LocalDateTime estimatedDelivery = calculateEstimatedDeliveryDate(deliveryDays);
        
        // Generate tracking number
        String trackingNumber = generateTrackingNumber();
        
        // Create order
        Order order = new Order();
        order.setTrackingNumber(trackingNumber);
        
        // Sender info from customer account
        order.setSenderCustomer(customer);
        order.setSenderName(customer.getFullName());
        order.setSenderPhone(customer.getPhoneNumber());
        order.setSenderAddress(request.getPickupAddress());
        
        // Receiver info
        order.setReceiverName(request.getReceiverName());
        order.setReceiverPhone(request.getReceiverPhone());
        order.setReceiverAddress(request.getReceiverAddress());
        order.setDestinationWard(destinationWard);
        
        // Package info
        order.setPackageType(request.getPackageType());
        order.setPackageDescription(request.getPackageDescription());
        order.setWeightKg(request.getWeightKg());
        order.setLengthCm(request.getLengthCm());
        order.setWidthCm(request.getWidthCm());
        order.setHeightCm(request.getHeightCm());
        order.setVolumetricWeightKg(volumetricWeight);
        order.setChargeableWeightKg(chargeableWeight);
        
        // Service & pricing
        order.setServiceType(request.getServiceType());
        order.setShippingFee(shippingFee);
        order.setCodAmount(request.getCodAmount() != null ? request.getCodAmount() : BigDecimal.ZERO);
        order.setDeclaredValue(request.getDeclaredValue());
        order.setInsuranceFee(insuranceFee);
        order.setTotalAmount(totalAmount);
        
        // SLA
        order.setEstimatedDeliveryDate(estimatedDelivery);
        
        // Status & location - PENDING_PICKUP means awaiting shipper assignment
        order.setStatus(OrderStatus.PENDING_PICKUP);
        order.setOriginOffice(originOffice);
        order.setCurrentOffice(originOffice);
        // No createdByEmployee for customer-created orders
        
        // Notes
        order.setDeliveryInstructions(request.getDeliveryInstructions());
        
        // Save order
        Order savedOrder = orderRepository.save(order);
        
        // Create initial status history
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.PENDING_PICKUP);
        history.setOffice(originOffice);
        history.setDescription("Order created online by customer. Awaiting shipper pickup at: " + request.getPickupAddress());
        history.setLocationDetails(request.getPickupAddress());
        statusHistoryRepository.save(history);
        
        log.info("Customer created pickup order {} for pickup at {}", 
                trackingNumber, request.getPickupAddress());
        
        // Send notification to office staff
        NotificationMessage notification = NotificationMessage.createNewOrderNotification(
                savedOrder.getId(),
                trackingNumber,
                originOffice.getId(),
                originOffice.getOfficeName(),
                customer.getFullName(),
                request.getPickupAddress()
        );
        notificationService.notifyOfficeNewPickupOrder(
                originOffice.getId(), 
                originOffice.getOfficeName(), 
                notification
        );
        
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getPendingPickupOrders(Pageable pageable, Account currentAccount) {
        validateStaffRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        UUID officeId = currentEmployee.getOffice().getId();
        
        Page<Order> orderPage = orderRepository.findPendingPickupOrdersByOfficeId(officeId, pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
        
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional
    public OrderResponse assignShipperToPickup(AssignShipperRequest request, Account currentAccount) {
        validateStaffRole(currentAccount);
        Employee currentEmployee = getCurrentEmployee(currentAccount);
        
        // Get order
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + request.getOrderId()));
        
        // Validate order is pending pickup
        if (order.getStatus() != OrderStatus.PENDING_PICKUP) {
            throw new IllegalArgumentException("Order is not in PENDING_PICKUP status");
        }
        
        // Validate order belongs to staff's office
        if (!order.getOriginOffice().getId().equals(currentEmployee.getOffice().getId())) {
            throw new AccessDeniedException("You can only assign shippers for orders at your office");
        }
        
        // Get shipper
        Employee shipper = employeeRepository.findById(request.getShipperId())
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found: " + request.getShipperId()));
        
        // Validate shipper role
        if (shipper.getAccount().getRole() != Role.SHIPPER) {
            throw new IllegalArgumentException("Selected employee is not a shipper");
        }
        
        // Validate shipper belongs to same office
        if (!shipper.getOffice().getId().equals(currentEmployee.getOffice().getId())) {
            throw new IllegalArgumentException("Shipper must belong to the same office");
        }
        
        // Assign shipper
        order.setAssignedShipper(shipper);
        
        // Add notes if provided
        if (request.getNotes() != null && !request.getNotes().isBlank()) {
            String existingNotes = order.getInternalNotes() != null ? order.getInternalNotes() + "\n" : "";
            order.setInternalNotes(existingNotes + "Pickup notes: " + request.getNotes());
        }
        
        Order savedOrder = orderRepository.save(order);
        
        // Create status history entry
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.PENDING_PICKUP);
        history.setOffice(currentEmployee.getOffice());
        history.setEmployee(currentEmployee);
        history.setDescription("Shipper " + shipper.getFullName() + " assigned for pickup");
        statusHistoryRepository.save(history);
        
        log.info("Assigned shipper {} to order {} by staff {}", 
                shipper.getFullName(), order.getTrackingNumber(), currentEmployee.getFullName());
        
        // Notify shipper
        NotificationMessage notification = NotificationMessage.createShipperAssignmentNotification(
                order.getId(),
                order.getTrackingNumber(),
                shipper.getId(),
                shipper.getFullName(),
                order.getSenderName(),
                order.getSenderAddress(),
                currentEmployee.getFullName()
        );
        notificationService.notifyShipperAssignment(shipper.getId(), notification);
        
        return mapToOrderResponse(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<OrderResponse> getShipperAssignedOrders(Pageable pageable, Account currentAccount) {
        // Validate shipper role
        if (currentAccount.getRole() != Role.SHIPPER) {
            throw new AccessDeniedException("Only shippers can access this endpoint");
        }
        
        Employee shipper = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found"));
        
        Page<Order> orderPage = orderRepository.findAssignedPickupOrders(shipper.getId(), pageable);
        Page<OrderResponse> responsePage = orderPage.map(this::mapToOrderResponse);
        
        return mapToPageResponse(responsePage);
    }

    @Override
    @Transactional
    public OrderResponse markOrderPickedUp(UUID orderId, Account currentAccount) {
        // Validate shipper role
        if (currentAccount.getRole() != Role.SHIPPER) {
            throw new AccessDeniedException("Only shippers can mark orders as picked up");
        }
        
        Employee shipper = employeeRepository.findById(currentAccount.getId())
                .orElseThrow(() -> new IllegalArgumentException("Shipper not found"));
        
        // Get order
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));
        
        // Validate shipper is assigned to this order
        if (order.getAssignedShipper() == null || !order.getAssignedShipper().getId().equals(shipper.getId())) {
            throw new AccessDeniedException("You are not assigned to this order");
        }
        
        // Validate order status
        if (order.getStatus() != OrderStatus.PENDING_PICKUP) {
            throw new IllegalArgumentException("Order is not in PENDING_PICKUP status");
        }
        
        // Update status to PICKED_UP
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(OrderStatus.PICKED_UP);
        
        Order savedOrder = orderRepository.save(order);
        
        // Create status history entry
        OrderStatusHistory history = new OrderStatusHistory();
        history.setOrder(savedOrder);
        history.setStatus(OrderStatus.PICKED_UP);
        history.setPreviousStatus(previousStatus);
        history.setEmployee(shipper);
        history.setDescription("Package picked up from customer by shipper " + shipper.getFullName());
        history.setLocationDetails(order.getSenderAddress());
        statusHistoryRepository.save(history);
        
        log.info("Order {} picked up by shipper {}", order.getTrackingNumber(), shipper.getFullName());
        
        return mapToOrderResponse(savedOrder);
    }

    // ==================== ADDITIONAL PRIVATE HELPERS ====================

    /**
     * Find the nearest post office for a given ward.
     * First looks for ward-level post office, then falls back to province-level.
     */
    private Office findNearestPostOffice(Ward ward) {
        // First, try to find a ward-level post office
        List<Office> wardOffices = officeRepository.findByProvinceCodeAndOfficeType(
                ward.getProvince().getCode(), OfficeType.WARD_POST);
        
        if (!wardOffices.isEmpty()) {
            // Return the first ward post office (in a real system, we'd calculate distance)
            return wardOffices.get(0);
        }
        
        // Fall back to province-level post office
        List<Office> provinceOffices = officeRepository.findByProvinceCodeAndOfficeType(
                ward.getProvince().getCode(), OfficeType.PROVINCE_POST);
        
        if (!provinceOffices.isEmpty()) {
            return provinceOffices.get(0);
        }
        
        return null;
    }
}
