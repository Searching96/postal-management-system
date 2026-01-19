package org.f3.postalmanagement.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.consolidation.CreateConsolidationRouteRequest;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationRouteResponse;
import org.f3.postalmanagement.dto.response.consolidation.ConsolidationStatusResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.administrative.Province;
import org.f3.postalmanagement.entity.order.Order;
import org.f3.postalmanagement.entity.unit.ConsolidationRoute;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OrderStatus;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.exception.BadRequestException;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.ConsolidationRouteRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.OrderRepository;
import org.f3.postalmanagement.repository.ProvinceRepository;
import org.f3.postalmanagement.service.IConsolidationRouteService;
import org.f3.postalmanagement.service.consolidation.ConsolidationRouteAuthorizationValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementation of consolidation route service.
 * Handles ward-to-province order consolidation and routing.
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ConsolidationRouteServiceImpl implements IConsolidationRouteService {

    private final ConsolidationRouteRepository consolidationRouteRepository;
    private final OrderRepository orderRepository;
    private final OfficeRepository officeRepository;
    private final ProvinceRepository provinceRepository;
    private final ConsolidationRouteAuthorizationValidator consolidationRouteAuthorizationValidator;

    // ==================== ROUTE MANAGEMENT ====================

    @Override
    public ConsolidationRouteResponse createConsolidationRoute(
            CreateConsolidationRouteRequest request,
            Account currentAccount) {

        // Validate user authorization to create consolidation route
        consolidationRouteAuthorizationValidator.validateCreateConsolidationRoute(
                currentAccount,
                request.getProvinceCode(),
                request.getDestinationWarehouseId()
        );

        // Validate province exists
        Province province = provinceRepository.findByCode(request.getProvinceCode())
                .orElseThrow(() -> new NotFoundException("Province not found: " + request.getProvinceCode()));

        // Validate destination warehouse exists and is correct type
        Office warehouse = officeRepository.findById(request.getDestinationWarehouseId())
                .orElseThrow(() -> new NotFoundException("Destination warehouse not found"));

        if (warehouse.getOfficeType() != OfficeType.PROVINCE_WAREHOUSE) {
            throw new BadRequestException(
                "Destination must be a PROVINCE_WAREHOUSE office, got: " + warehouse.getOfficeType());
        }

        if (!warehouse.getProvince().getCode().equals(request.getProvinceCode())) {
            throw new BadRequestException(
                "Warehouse province must match route province");
        }

        // Convert route stops to JSON
        String routeSequenceJson = convertStopsToJson(request.getRouteStops());

        // Create route
        ConsolidationRoute route = new ConsolidationRoute();
        route.setName(request.getName());
        route.setProvince(province);
        route.setDestinationWarehouse(warehouse);
        route.setRouteSequence(routeSequenceJson);
        route.setMaxWeightKg(request.getMaxWeightKg());
        route.setMaxVolumeCm3(request.getMaxVolumeCm3());
        route.setMaxOrders(request.getMaxOrders());
        route.setIsActive(request.getIsActive());
        route.setTotalConsolidatedOrders(0);

        route = consolidationRouteRepository.save(route);

        log.info("Created consolidation route {} for province {}", route.getId(), province.getCode());
        return mapToResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsolidationRouteResponse> getAllConsolidationRoutes() {
        List<ConsolidationRoute> routes = consolidationRouteRepository.findAll();
        return routes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ConsolidationRouteResponse> getRoutesByProvince(String provinceCode, Account currentAccount) {
        List<ConsolidationRoute> routes = consolidationRouteRepository.findRoutesByProvince(provinceCode);
        return routes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ConsolidationRouteResponse getRouteById(UUID routeId, Account currentAccount) {
        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));
        return mapToResponse(route);
    }

    @Override
    public ConsolidationRouteResponse updateRoute(
            UUID routeId,
            CreateConsolidationRouteRequest request,
            Account currentAccount) {

        // Validate user authorization to update consolidation route
        consolidationRouteAuthorizationValidator.validateUpdateConsolidationRoute(
                currentAccount,
                routeId
        );

        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        // Update basic fields
        route.setName(request.getName());
        route.setMaxWeightKg(request.getMaxWeightKg());
        route.setMaxVolumeCm3(request.getMaxVolumeCm3());
        route.setMaxOrders(request.getMaxOrders());

        // Update route sequence if provided
        if (request.getRouteStops() != null && !request.getRouteStops().isEmpty()) {
            route.setRouteSequence(convertStopsToJson(request.getRouteStops()));
        }

        route = consolidationRouteRepository.save(route);
        log.info("Updated consolidation route {}", routeId);
        return mapToResponse(route);
    }

    @Override
    public ConsolidationRouteResponse setRouteActive(UUID routeId, boolean active, Account currentAccount) {
        // Validate user authorization to change route status
        consolidationRouteAuthorizationValidator.validateUpdateConsolidationRoute(
                currentAccount,
                routeId
        );

        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        route.setIsActive(active);
        route = consolidationRouteRepository.save(route);

        log.info("Set consolidation route {} to active={}", routeId, active);
        return mapToResponse(route);
    }

    @Override
    public void deleteRoute(UUID routeId, Account currentAccount) {
        // Validate user authorization to delete consolidation route
        consolidationRouteAuthorizationValidator.validateDeleteConsolidationRoute(
                currentAccount,
                routeId
        );

        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        // Check for pending orders
        long pendingOrderCount = orderRepository.findByAssignedConsolidationRouteId(routeId).stream()
                .filter(o -> o.getConsolidatedAt() == null)
                .count();

        if (pendingOrderCount > 0) {
            throw new BadRequestException(
                "Cannot delete route with " + pendingOrderCount + " pending orders");
        }

        consolidationRouteRepository.deleteById(routeId);
        log.info("Deleted consolidation route {}", routeId);
    }

    // ==================== ORDER ASSIGNMENT ====================

    @Override
    public void assignOrderToRoute(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new NotFoundException("Order not found"));

        // Skip if already assigned
        if (order.getAssignedConsolidationRoute() != null) {
            return;
        }

        // Get origin office (must be ward-level)
        Office originOffice = order.getOriginOffice();
        if (originOffice == null) {
            throw new BadRequestException("Order must have origin office");
        }

        // Get province from origin office (required)
        String provinceCode = null;
        String originWardCode = null;

        if (originOffice.getProvince() != null) {
            provinceCode = originOffice.getProvince().getCode();
        }

        if (originOffice.getWard() != null) {
            originWardCode = originOffice.getWard().getCode();
        }

        if (provinceCode == null) {
            throw new BadRequestException("Origin office must belong to a province");
        }

        if (originWardCode == null) {
            throw new BadRequestException("Origin office must belong to a ward");
        }

        // Find active consolidation route for this province
        List<ConsolidationRoute> activeRoutes = consolidationRouteRepository
                .findActiveRoutesByProvince(provinceCode);

        if (activeRoutes.isEmpty()) {
            throw new BadRequestException(
                "No active consolidation routes available for province: " + provinceCode);
        }

        // Find route that contains this ward
        ConsolidationRoute assignedRoute = null;
        for (ConsolidationRoute route : activeRoutes) {
            if (route.containsWard(originWardCode)) {
                assignedRoute = route;
                break;
            }
        }

        if (assignedRoute == null) {
            throw new BadRequestException(
                "No consolidation route found for ward: " + originWardCode + " in province: " + provinceCode);
        }

        order.setAssignedConsolidationRoute(assignedRoute);
        order.setStatus(OrderStatus.AT_ORIGIN_OFFICE);

        orderRepository.save(order);
        log.info("Assigned order {} to consolidation route {} (ward: {})",
                orderId, assignedRoute.getId(), originWardCode);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getUnassignedOrdersByProvince(String provinceCode) {
        // Get all unassigned orders in eligible status, then filter by province
        return orderRepository.findUnbatchedOrders(
                null,
                null,
                List.of(OrderStatus.AT_ORIGIN_OFFICE, OrderStatus.SORTED_AT_ORIGIN)
        ).stream()
                .filter(o -> o.getAssignedConsolidationRoute() == null)
                .filter(o -> {
                    // Filter by origin office province
                    if (o.getOriginOffice() != null && o.getOriginOffice().getProvince() != null) {
                        return o.getOriginOffice().getProvince().getCode().equals(provinceCode);
                    }
                    return false;
                })
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getPendingOrdersForRoute(UUID routeId) {
        return orderRepository.findByAssignedConsolidationRouteId(routeId).stream()
                .filter(o -> o.getConsolidatedAt() == null)
                .collect(Collectors.toList());
    }

    // ==================== CONSOLIDATION OPERATIONS ====================

    @Override
    @Transactional(readOnly = true)
    public boolean isRouteReadyForConsolidation(UUID routeId) {
        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        List<Order> pendingOrders = getPendingOrdersForRoute(routeId);

        if (pendingOrders.isEmpty()) {
            return false;
        }

        // Check if minimum threshold met
        BigDecimal totalWeight = pendingOrders.stream()
                .map(Order::getChargeableWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean orderThresholdMet = route.getMaxOrders() != null &&
                pendingOrders.size() >= route.getMaxOrders() / 2; // 50% capacity

        boolean weightThresholdMet = route.getMaxWeightKg() != null &&
                totalWeight.compareTo(route.getMaxWeightKg().multiply(BigDecimal.valueOf(0.5))) >= 0; // 50% capacity

        boolean timeThresholdMet = false;
        if (route.getLastConsolidationAt() != null) {
            // Consolidate if >2 hours since last consolidation
            timeThresholdMet = LocalDateTime.now().isAfter(route.getLastConsolidationAt().plusHours(2));
        } else {
            // Consolidate if >1 hour since first order
            timeThresholdMet = LocalDateTime.now().isAfter(
                    pendingOrders.stream()
                            .map(Order::getCreatedAt)
                            .min(LocalDateTime::compareTo)
                            .orElse(LocalDateTime.now())
                            .plusHours(1)
            );
        }

        return orderThresholdMet || weightThresholdMet || timeThresholdMet;
    }

    @Override
    public ConsolidationStatusResponse consolidateRoute(UUID routeId, Account currentAccount) {
        // Validate user authorization to consolidate route
        consolidationRouteAuthorizationValidator.validateUpdateConsolidationRoute(
                currentAccount,
                routeId
        );

        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        List<Order> pendingOrders = getPendingOrdersForRoute(routeId);

        if (pendingOrders.isEmpty()) {
            throw new BadRequestException("No pending orders to consolidate");
        }

        // Move all orders to destination warehouse (province warehouse)
        Office destWarehouse = route.getDestinationWarehouse();
        LocalDateTime now = LocalDateTime.now();

        for (Order order : pendingOrders) {
            order.setCurrentOffice(destWarehouse);
            order.setConsolidatedAt(now);
            // Note: Order is now at province warehouse (intermediate stop before transfer to hub)
            // AT_DESTINATION_OFFICE here refers to the current "destination" in consolidation flow,
            // not the final customer delivery location. Phase 4 will refactor this to use
            // a dedicated AT_PROVINCE_WAREHOUSE status when integrated with transfer routes.
            order.setStatus(OrderStatus.AT_DESTINATION_OFFICE);
            orderRepository.save(order);
        }

        // Update route metrics
        route.setLastConsolidationAt(now);
        route.setTotalConsolidatedOrders(route.getTotalConsolidatedOrders() + pendingOrders.size());
        consolidationRouteRepository.save(route);

        log.info("Consolidated {} orders from route {} to warehouse {}",
                pendingOrders.size(), routeId, destWarehouse.getId());

        return getRouteStatus(routeId);
    }

    @Override
    public int consolidateReadyRoutesByProvince(String provinceCode) {
        List<ConsolidationRoute> routes = consolidationRouteRepository.findActiveRoutesByProvince(provinceCode);
        int consolidated = 0;

        for (ConsolidationRoute route : routes) {
            if (isRouteReadyForConsolidation(route.getId())) {
                try {
                    consolidateRoute(route.getId(), null);
                    consolidated++;
                } catch (Exception e) {
                    log.warn("Failed to consolidate route {}: {}", route.getId(), e.getMessage());
                }
            }
        }

        return consolidated;
    }

    @Override
    public int consolidateAllReadyRoutes() {
        List<ConsolidationRoute> allRoutes = consolidationRouteRepository.findAll();
        int consolidated = 0;

        for (ConsolidationRoute route : allRoutes) {
            if (route.getIsActive() && isRouteReadyForConsolidation(route.getId())) {
                try {
                    consolidateRoute(route.getId(), null);
                    consolidated++;
                } catch (Exception e) {
                    log.warn("Failed to consolidate route {}: {}", route.getId(), e.getMessage());
                }
            }
        }

        return consolidated;
    }

    // ==================== STATUS & MONITORING ====================

    @Override
    @Transactional(readOnly = true)
    public ConsolidationStatusResponse getRouteStatus(UUID routeId) {
        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Consolidation route not found"));

        List<Order> pendingOrders = getPendingOrdersForRoute(routeId);

        BigDecimal totalWeight = pendingOrders.stream()
                .map(Order::getChargeableWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalVolume = pendingOrders.stream()
                .map(o -> {
                    if (o.getLengthCm() != null && o.getWidthCm() != null && o.getHeightCm() != null) {
                        return o.getLengthCm().multiply(o.getWidthCm()).multiply(o.getHeightCm());
                    }
                    return BigDecimal.ZERO;
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        boolean canConsolidate = isRouteReadyForConsolidation(routeId);

        // Calculate last consolidation metrics based on consolidated orders
        ConsolidationStatusResponse.LastConsolidation lastConsolidationInfo = null;
        if (route.getLastConsolidationAt() != null) {
            // Get orders consolidated at this exact time (approximate)
            List<Order> recentlyConsolidated = orderRepository
                .findByAssignedConsolidationRouteId(routeId).stream()
                .filter(o -> o.getConsolidatedAt() != null &&
                            o.getConsolidatedAt().getSecond() <= route.getLastConsolidationAt().getSecond() + 5)
                .collect(Collectors.toList());

            BigDecimal lastConsolidationWeight = recentlyConsolidated.stream()
                .map(Order::getChargeableWeightKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

            lastConsolidationInfo = ConsolidationStatusResponse.LastConsolidation.builder()
                .timestamp(route.getLastConsolidationAt())
                .ordersConsolidated(recentlyConsolidated.size())
                .totalWeightKg(lastConsolidationWeight)
                .build();
        }

        return ConsolidationStatusResponse.builder()
                .routeId(routeId)
                .routeName(route.getName())
                .pendingOrderCount(pendingOrders.size())
                .pendingWeightKg(totalWeight)
                .pendingVolumeCm3(totalVolume)
                .canConsolidate(canConsolidate)
                .consolidationBlockReason(canConsolidate ? null : "Insufficient orders/weight or time threshold not met")
                .nextConsolidationTime(route.getLastConsolidationAt() != null ?
                        route.getLastConsolidationAt().plusHours(2) : LocalDateTime.now().plusHours(1))
                .lastConsolidation(lastConsolidationInfo)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ConsolidationStatusResponse getProvinceConsolidationStatus(String provinceCode) {
        List<ConsolidationRoute> routes = consolidationRouteRepository.findActiveRoutesByProvince(provinceCode);

        int totalPending = 0;
        BigDecimal totalWeight = BigDecimal.ZERO;
        int readyRoutes = 0;

        for (ConsolidationRoute route : routes) {
            List<Order> pending = getPendingOrdersForRoute(route.getId());
            totalPending += pending.size();

            totalWeight = totalWeight.add(pending.stream()
                    .map(Order::getChargeableWeightKg)
                    .reduce(BigDecimal.ZERO, BigDecimal::add));

            if (isRouteReadyForConsolidation(route.getId())) {
                readyRoutes++;
            }
        }

        return ConsolidationStatusResponse.builder()
                .routeName("Province: " + provinceCode)
                .pendingOrderCount(totalPending)
                .pendingWeightKg(totalWeight)
                .canConsolidate(readyRoutes > 0)
                .build();
    }

    @Override
    public void assignConsolidatedOrdersToTransferRoute(UUID routeId) {
        // This will be implemented in Phase 4 when integrating with transfer routes
        // For now: placeholder
        log.debug("Assigning consolidated orders from route {} to transfer routes", routeId);
    }

    // ==================== HELPER METHODS ====================

    private String convertStopsToJson(List<CreateConsolidationRouteRequest.RouteStopRequest> stops) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            // Convert stops to JSON string with proper escaping
            return mapper.writeValueAsString(stops);
        } catch (Exception e) {
            log.error("Failed to convert route stops to JSON: {}", e.getMessage());
            throw new BadRequestException("Failed to serialize route stops: " + e.getMessage());
        }
    }

    private ConsolidationRouteResponse mapToResponse(ConsolidationRoute route) {
        return ConsolidationRouteResponse.builder()
                .id(route.getId())
                .name(route.getName())
                .province(ConsolidationRouteResponse.ProvinceInfo.builder()
                        .code(route.getProvince().getCode())
                        .name(route.getProvince().getName())
                        .build())
                .destinationWarehouse(ConsolidationRouteResponse.OfficeInfo.builder()
                        .id(route.getDestinationWarehouse().getId())
                        .name(route.getDestinationWarehouse().getOfficeName())
                        .code(route.getDestinationWarehouse().getOfficeCode())
                        .build())
                .routeStops(parseRouteStops(route.getRouteSequence()))
                .capacity(ConsolidationRouteResponse.CapacityInfo.builder()
                        .maxWeightKg(route.getMaxWeightKg())
                        .maxVolumeCm3(route.getMaxVolumeCm3())
                        .maxOrders(route.getMaxOrders())
                        .build())
                .status(ConsolidationRouteResponse.StatusInfo.builder()
                        .isActive(route.getIsActive())
                        .totalConsolidatedOrders(route.getTotalConsolidatedOrders())
                        .lastConsolidationAt(route.getLastConsolidationAt())
                        .build())
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }

    private List<ConsolidationRouteResponse.RouteStop> parseRouteStops(String routeSequenceJson) {
        List<ConsolidationRouteResponse.RouteStop> stops = new java.util.ArrayList<>();
        try {
            if (routeSequenceJson != null && !routeSequenceJson.isEmpty()) {
                ObjectMapper mapper = new ObjectMapper();
                ConsolidationRouteResponse.RouteStop[] stopsArray = mapper.readValue(
                    routeSequenceJson,
                    ConsolidationRouteResponse.RouteStop[].class
                );
                for (ConsolidationRouteResponse.RouteStop stop : stopsArray) {
                    stops.add(stop);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to parse route sequence JSON: {}", e.getMessage());
        }
        return stops;
    }
}
