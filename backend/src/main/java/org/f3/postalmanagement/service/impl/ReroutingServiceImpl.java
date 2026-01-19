package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.route.CreateTransferRouteRequest;
import org.f3.postalmanagement.dto.request.route.DisableRouteRequest;
import org.f3.postalmanagement.dto.response.route.DisruptionResponse;
import org.f3.postalmanagement.dto.response.route.ReroutingImpactResponse;
import org.f3.postalmanagement.dto.response.route.TransferRouteResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.RouteDisruption;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.exception.BadRequestException;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.BatchPackageRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.RouteDisruptionRepository;
import org.f3.postalmanagement.repository.TransferRouteRepository;
import org.f3.postalmanagement.service.IReroutingService;
import org.f3.postalmanagement.service.IRouteService;
import org.f3.postalmanagement.service.route.RouteAuthorizationValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Implementation of rerouting service for managing route disruptions.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class ReroutingServiceImpl implements IReroutingService {

    private final TransferRouteRepository transferRouteRepository;
    private final RouteDisruptionRepository routeDisruptionRepository;
    private final BatchPackageRepository batchPackageRepository;
    private final OfficeRepository officeRepository;
    private final IRouteService routeService;
    private final RouteAuthorizationValidator routeAuthorizationValidator;

    @Override
    @Transactional
    public TransferRouteResponse createRoute(CreateTransferRouteRequest request, Account currentAccount) {
        // Fetch from and to hubs
        Office fromHub = officeRepository.findById(request.getFromHubId())
                .orElseThrow(() -> new NotFoundException("From hub not found: " + request.getFromHubId()));

        Office toHub = officeRepository.findById(request.getToHubId())
                .orElseThrow(() -> new NotFoundException("To hub not found: " + request.getToHubId()));

        // Validate hubs exist and are appropriate types
        // Validate hubs exist and are appropriate types based on route type
        if (request.getRouteType() == org.f3.postalmanagement.enums.RouteType.HUB_TO_HUB) {
            if (fromHub.getOfficeType() != OfficeType.HUB) {
                throw new BadRequestException("From office must be a hub for HUB_TO_HUB route");
            }
            if (toHub.getOfficeType() != OfficeType.HUB) {
                throw new BadRequestException("To office must be a hub for HUB_TO_HUB route");
            }
        } else if (request.getRouteType() == org.f3.postalmanagement.enums.RouteType.PROVINCE_TO_HUB) {
            if (fromHub.getOfficeType() != OfficeType.PROVINCE_WAREHOUSE) {
                throw new BadRequestException("From office must be a province warehouse for PROVINCE_TO_HUB route");
            }
            if (toHub.getOfficeType() != OfficeType.HUB) {
                throw new BadRequestException("To office must be a hub for PROVINCE_TO_HUB route");
            }
        }

        // Validate user authorization to create this route
        routeAuthorizationValidator.validateCreateTransferRoute(
                currentAccount,
                request.getFromHubId(),
                request.getToHubId(),
                request.getProvinceWarehouseId()
        );

        // Create new route (forward direction)
        TransferRoute route = new TransferRoute();
        route.setRouteType(request.getRouteType());
        route.setFromHub(fromHub);
        route.setToHub(toHub);
        route.setDistanceKm(request.getDistanceKm());
        route.setTransitHours(request.getTransitHours());
        route.setPriority(request.getPriority() != null ? request.getPriority() : 1);
        route.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // For PROVINCE_TO_HUB routes, set the province warehouse
        if (request.getRouteType().name().equals("PROVINCE_TO_HUB") && request.getProvinceWarehouseId() != null) {
            Office provinceWarehouse = officeRepository.findById(request.getProvinceWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Province warehouse not found: " + request.getProvinceWarehouseId()));
            route.setProvinceWarehouse(provinceWarehouse);
        }

        route = transferRouteRepository.save(route);

        // Create reverse route (bi-directional)
        TransferRoute reverseRoute = new TransferRoute();
        reverseRoute.setRouteType(request.getRouteType());
        reverseRoute.setFromHub(toHub);
        reverseRoute.setToHub(fromHub);
        reverseRoute.setDistanceKm(request.getDistanceKm());
        reverseRoute.setTransitHours(request.getTransitHours());
        reverseRoute.setPriority(request.getPriority() != null ? request.getPriority() : 1);
        reverseRoute.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        // For PROVINCE_TO_HUB routes, reverse direction uses same province warehouse
        if (request.getRouteType().name().equals("PROVINCE_TO_HUB") && request.getProvinceWarehouseId() != null) {
            Office provinceWarehouse = officeRepository.findById(request.getProvinceWarehouseId())
                    .orElseThrow(() -> new NotFoundException("Province warehouse not found: " + request.getProvinceWarehouseId()));
            reverseRoute.setProvinceWarehouse(provinceWarehouse);
        }

        transferRouteRepository.save(reverseRoute);

        log.info("Bi-directional transfer routes created by {}: {} ↔ {}", currentAccount.getEmail(),
                fromHub.getOfficeName(), toHub.getOfficeName());

        return mapToRouteResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransferRouteResponse> getAllRoutes() {
        List<TransferRoute> routes = transferRouteRepository.findAll();
        return routes.stream()
                .map(this::mapToRouteResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TransferRouteResponse getRouteById(UUID routeId) {
        TransferRoute route = transferRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Route not found: " + routeId));
        return mapToRouteResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public ReroutingImpactResponse previewDisableImpact(UUID routeId) {
        TransferRoute route = transferRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Route not found: " + routeId));

        if (!route.getIsActive()) {
            throw new BadRequestException("Route is already disabled");
        }

        // Find batches that would be affected
        List<BatchPackage> affectedBatches = batchPackageRepository
                .findActiveBatchesBetweenHubs(route.getFromHub().getId(), route.getToHub().getId());

        // Check if alternative route exists
        boolean hasAlternative = checkForAlternativeRoute(
                route.getFromHub().getRegion().getId(),
                route.getToHub().getRegion().getId(),
                routeId
        );

        // Count total orders affected
        int totalOrders = affectedBatches.stream()
                .mapToInt(BatchPackage::getCurrentOrderCount)
                .sum();

        // Map affected batches to summaries
        List<ReroutingImpactResponse.AffectedBatchSummary> batchSummaries = affectedBatches.stream()
                .map(batch -> ReroutingImpactResponse.AffectedBatchSummary.builder()
                        .batchId(batch.getId())
                        .batchCode(batch.getBatchCode())
                        .status(batch.getStatus().name())
                        .orderCount(batch.getCurrentOrderCount())
                        .currentLocation(batch.getOriginOffice().getOfficeName())
                        .destination(batch.getDestinationOffice().getOfficeName())
                        .canReroute(hasAlternative)
                        .build())
                .toList();

        String routeDesc = String.format("%s → %s",
                route.getFromHub().getOfficeName(),
                route.getToHub().getOfficeName());

        return ReroutingImpactResponse.builder()
                .routeId(routeId)
                .routeDescription(routeDesc)
                .affectedBatchCount(affectedBatches.size())
                .affectedOrderCount(totalOrders)
                .hasAlternativeRoute(hasAlternative)
                .alternativeRouteDescription(hasAlternative ? "Alternative path available via other hubs" : null)
                .additionalHours(hasAlternative ? estimateAdditionalHours(route) : null)
                .affectedBatches(batchSummaries)
                .build();
    }

    @Override
    @Transactional
    public DisruptionResponse disableRoute(UUID routeId, DisableRouteRequest request, Account currentAccount) {
        TransferRoute route = transferRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Route not found: " + routeId));

        if (!route.getIsActive()) {
            throw new BadRequestException("Route is already disabled");
        }

        // Calculate impact before disabling
        List<BatchPackage> affectedBatches = batchPackageRepository
                .findActiveBatchesBetweenHubs(route.getFromHub().getId(), route.getToHub().getId());

        int totalOrders = affectedBatches.stream()
                .mapToInt(BatchPackage::getCurrentOrderCount)
                .sum();

        // Disable the route
        route.setIsActive(false);
        transferRouteRepository.save(route);

        // Create disruption record
        RouteDisruption disruption = new RouteDisruption();
        disruption.setTransferRoute(route);
        disruption.setDisruptionType(request.getDisruptionType());
        disruption.setReason(request.getReason());
        disruption.setStartTime(LocalDateTime.now());
        disruption.setExpectedEndTime(request.getExpectedEndTime());
        disruption.setIsActive(true);
        disruption.setAffectedBatchCount(affectedBatches.size());
        disruption.setAffectedOrderCount(totalOrders);
        disruption.setCreatedBy(currentAccount.getEmail());

        disruption = routeDisruptionRepository.save(disruption);

        log.info("Route {} disabled by {}. Affected: {} batches, {} orders",
                routeId, currentAccount.getEmail(), affectedBatches.size(), totalOrders);

        // Note: In a production system, you would trigger batch rerouting here
        // For now, the BFS algorithm in RouteService will automatically use alternative routes
        // when calculatePackageRoute is called, since it filters by isActive = true

        return mapToDisruptionResponse(disruption);
    }

    @Override
    @Transactional
    public TransferRouteResponse enableRoute(UUID routeId, Account currentAccount) {
        TransferRoute route = transferRouteRepository.findById(routeId)
                .orElseThrow(() -> new NotFoundException("Route not found: " + routeId));

        if (route.getIsActive()) {
            throw new BadRequestException("Route is already active");
        }

        // Re-enable the route
        route.setIsActive(true);
        transferRouteRepository.save(route);

        // Close active disruption
        RouteDisruption activeDisruption = routeDisruptionRepository.findActiveByRouteId(routeId);
        if (activeDisruption != null) {
            activeDisruption.setIsActive(false);
            activeDisruption.setActualEndTime(LocalDateTime.now());
            routeDisruptionRepository.save(activeDisruption);
        }

        log.info("Route {} re-enabled by {}", routeId, currentAccount.getEmail());

        return mapToRouteResponse(route);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisruptionResponse> getActiveDisruptions() {
        return routeDisruptionRepository.findAllByIsActiveTrue().stream()
                .map(this::mapToDisruptionResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DisruptionResponse> getDisruptionHistory(UUID routeId) {
        return routeDisruptionRepository.findByTransferRouteIdOrderByStartTimeDesc(routeId).stream()
                .map(this::mapToDisruptionResponse)
                .toList();
    }

    // ==================== HELPER METHODS ====================

    private boolean checkForAlternativeRoute(Integer fromRegionId, Integer toRegionId, UUID excludedRouteId) {
        // Use the existing BFS to check if an alternative path exists
        // Since we haven't disabled the route yet, we need to simulate it
        // For now, we check if there are other active routes from the same region
        List<TransferRoute> alternatives = transferRouteRepository.findAllByIsActiveTrue().stream()
                .filter(r -> !r.getId().equals(excludedRouteId))
                .filter(r -> r.getFromHub().getRegion().getId().equals(fromRegionId) ||
                             r.getToHub().getRegion().getId().equals(toRegionId))
                .toList();

        return !alternatives.isEmpty();
    }

    private Integer estimateAdditionalHours(TransferRoute disabledRoute) {
        // Rough estimate: alternative routes typically add 4-8 hours
        // In a real system, this would calculate actual path differences
        return disabledRoute.getTransitHours() != null ? disabledRoute.getTransitHours() / 2 : 4;
    }

    private TransferRouteResponse mapToRouteResponse(TransferRoute route) {
        TransferRouteResponse.TransferRouteResponseBuilder builder = TransferRouteResponse.builder()
                .id(route.getId())
                .fromHubId(route.getFromHub().getId())
                .fromHubName(route.getFromHub().getOfficeName())
                .fromRegionName(route.getFromHub().getRegion() != null ?
                        route.getFromHub().getRegion().getName() : null)
                .toHubId(route.getToHub().getId())
                .toHubName(route.getToHub().getOfficeName())
                .toRegionName(route.getToHub().getRegion() != null ?
                        route.getToHub().getRegion().getName() : null)
                .distanceKm(route.getDistanceKm())
                .transitHours(route.getTransitHours())
                .priority(route.getPriority())
                .isActive(route.getIsActive())
                .routeType(route.getRouteType());

        // Add active disruption info if route is disabled
        if (!route.getIsActive()) {
            RouteDisruption activeDisruption = routeDisruptionRepository.findActiveByRouteId(route.getId());
            if (activeDisruption != null) {
                builder.activeDisruption(TransferRouteResponse.DisruptionInfo.builder()
                        .disruptionId(activeDisruption.getId())
                        .type(activeDisruption.getDisruptionType())
                        .reason(activeDisruption.getReason())
                        .startTime(activeDisruption.getStartTime())
                        .expectedEndTime(activeDisruption.getExpectedEndTime())
                        .affectedBatchCount(activeDisruption.getAffectedBatchCount())
                        .affectedOrderCount(activeDisruption.getAffectedOrderCount())
                        .build());
            }
        }

        return builder.build();
    }

    private DisruptionResponse mapToDisruptionResponse(RouteDisruption disruption) {
        TransferRoute route = disruption.getTransferRoute();
        String routeDesc = String.format("%s → %s",
                route.getFromHub().getOfficeName(),
                route.getToHub().getOfficeName());

        return DisruptionResponse.builder()
                .id(disruption.getId())
                .routeId(route.getId())
                .routeDescription(routeDesc)
                .disruptionType(disruption.getDisruptionType())
                .reason(disruption.getReason())
                .startTime(disruption.getStartTime())
                .expectedEndTime(disruption.getExpectedEndTime())
                .actualEndTime(disruption.getActualEndTime())
                .isActive(disruption.getIsActive())
                .affectedBatchCount(disruption.getAffectedBatchCount())
                .affectedOrderCount(disruption.getAffectedOrderCount())
                .createdBy(disruption.getCreatedBy())
                .createdAt(disruption.getCreatedAt())
                .build();
    }
}
