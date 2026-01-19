package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.request.route.DisableRouteRequest;
import org.f3.postalmanagement.dto.response.route.DisruptionResponse;
import org.f3.postalmanagement.dto.response.route.ReroutingImpactResponse;
import org.f3.postalmanagement.dto.response.route.TransferRouteResponse;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.order.BatchPackage;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.RouteDisruption;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.exception.BadRequestException;
import org.f3.postalmanagement.exception.NotFoundException;
import org.f3.postalmanagement.repository.BatchPackageRepository;
import org.f3.postalmanagement.repository.RouteDisruptionRepository;
import org.f3.postalmanagement.repository.TransferRouteRepository;
import org.f3.postalmanagement.service.IReroutingService;
import org.f3.postalmanagement.service.IRouteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final IRouteService routeService;

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
