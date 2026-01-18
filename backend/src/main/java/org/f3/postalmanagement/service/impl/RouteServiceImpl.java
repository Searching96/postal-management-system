package org.f3.postalmanagement.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.dto.response.route.RouteResponse;
import org.f3.postalmanagement.entity.administrative.Ward;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.TransferRouteRepository;
import org.f3.postalmanagement.repository.WardRepository;
import org.f3.postalmanagement.service.IRouteService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Implementation of route calculation service using BFS for hub-to-hub routing.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RouteServiceImpl implements IRouteService {

    private final OfficeRepository officeRepository;
    private final TransferRouteRepository transferRouteRepository;
    private final WardRepository wardRepository;

    // Average processing time at each stop (hours)
    private static final int WAREHOUSE_PROCESSING_HOURS = 2;
    private static final int HUB_PROCESSING_HOURS = 4;

    @Override
    @Transactional(readOnly = true)
    public RouteResponse calculatePackageRoute(UUID originOfficeId, String destinationWardCode) {
        // Get origin office
        Office originOffice = officeRepository.findById(originOfficeId)
                .orElseThrow(() -> new IllegalArgumentException("Origin office not found: " + originOfficeId));

        // Get destination ward
        Ward destinationWard = wardRepository.findById(destinationWardCode)
                .orElseThrow(() -> new IllegalArgumentException("Destination ward not found: " + destinationWardCode));

        // Build the route
        List<RouteResponse.RouteStop> stops = new ArrayList<>();
        int cumulativeHours = 0;
        int stopOrder = 1;
        int totalDistanceKm = 0;

        Integer originRegionId = originOffice.getRegion().getId();
        Integer destRegionId = destinationWard.getProvince().getAdministrativeRegion().getId();
        boolean sameRegion = originRegionId.equals(destRegionId);
        boolean sameProvince = originOffice.getProvince() != null && 
                originOffice.getProvince().getCode().equals(destinationWard.getProvince().getCode());

        // Step 1: Add origin office
        stops.add(buildRouteStop(originOffice, stopOrder++, cumulativeHours));

        // Step 2: If origin is not a warehouse, go to province warehouse
        if (originOffice.getOfficeType() == OfficeType.WARD_POST || 
            originOffice.getOfficeType() == OfficeType.PROVINCE_POST) {
            // Find province warehouse for origin
            Office originWarehouse = findProvinceWarehouse(originOffice.getProvince().getCode());
            if (originWarehouse != null) {
                cumulativeHours += WAREHOUSE_PROCESSING_HOURS;
                stops.add(buildRouteStop(originWarehouse, stopOrder++, cumulativeHours));
            }
        }

        // Step 3: Get origin hub
        Office originHub = getHubForOffice(originOffice);
        if (originHub != null && !isAlreadyInStops(stops, originHub.getId())) {
            cumulativeHours += HUB_PROCESSING_HOURS;
            stops.add(buildRouteStop(originHub, stopOrder++, cumulativeHours));
        }

        // Step 4: Hub-to-hub routing (if different regions)
        if (!sameRegion && originHub != null) {
            List<Office> hubPath = getHubPath(originRegionId, destRegionId);
            
            // Skip the first hub (already added) and add intermediate + destination hubs
            for (int i = 1; i < hubPath.size(); i++) {
                Office hub = hubPath.get(i);
                
                // Calculate transit time from previous hub
                Office prevHub = hubPath.get(i - 1);
                TransferRoute route = transferRouteRepository.findByFromHubIdAndToHubId(prevHub.getId(), hub.getId())
                        .orElse(null);
                if (route != null) {
                    cumulativeHours += route.getTransitHours();
                    totalDistanceKm += route.getDistanceKm() != null ? route.getDistanceKm() : 0;
                } else {
                    cumulativeHours += HUB_PROCESSING_HOURS; // Default if route not found
                }
                
                stops.add(buildRouteStop(hub, stopOrder++, cumulativeHours));
            }
        }

        // Step 5: Go to destination province warehouse
        Office destWarehouse = findProvinceWarehouse(destinationWard.getProvince().getCode());
        if (destWarehouse != null && !isAlreadyInStops(stops, destWarehouse.getId())) {
            cumulativeHours += WAREHOUSE_PROCESSING_HOURS;
            stops.add(buildRouteStop(destWarehouse, stopOrder++, cumulativeHours));
        }

        // Step 6: Final destination (ward office if exists, otherwise warehouse is final)
        Office destWardOffice = findWardOffice(destinationWard.getCode());
        if (destWardOffice != null && !isAlreadyInStops(stops, destWardOffice.getId())) {
            cumulativeHours += WAREHOUSE_PROCESSING_HOURS;
            stops.add(buildRouteStop(destWardOffice, stopOrder++, cumulativeHours));
        }

        return RouteResponse.builder()
                .stops(stops)
                .totalStops(stops.size())
                .estimatedHours(cumulativeHours)
                .totalDistanceKm(totalDistanceKm)
                .sameRegion(sameRegion)
                .sameProvince(sameProvince)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<Office> getHubPath(Integer fromRegionId, Integer toRegionId) {
        if (fromRegionId.equals(toRegionId)) {
            // Same region, just return the hub for that region
            List<Office> hubs = officeRepository.findAllByOfficeType(OfficeType.HUB);
            return hubs.stream()
                    .filter(h -> h.getRegion().getId().equals(fromRegionId))
                    .findFirst()
                    .map(List::of)
                    .orElse(Collections.emptyList());
        }

        // Build adjacency graph from active routes
        Map<UUID, List<TransferRoute>> adjacencyMap = new HashMap<>();
        Map<UUID, Office> hubMap = new HashMap<>();
        Map<Integer, Office> regionToHub = new HashMap<>();

        List<TransferRoute> allRoutes = transferRouteRepository.findAllByIsActiveTrue();
        for (TransferRoute route : allRoutes) {
            adjacencyMap.computeIfAbsent(route.getFromHub().getId(), k -> new ArrayList<>()).add(route);
            hubMap.put(route.getFromHub().getId(), route.getFromHub());
            hubMap.put(route.getToHub().getId(), route.getToHub());
            regionToHub.put(route.getFromHub().getRegion().getId(), route.getFromHub());
            regionToHub.put(route.getToHub().getRegion().getId(), route.getToHub());
        }

        Office startHub = regionToHub.get(fromRegionId);
        Office endHub = regionToHub.get(toRegionId);

        if (startHub == null || endHub == null) {
            log.warn("No hub found for regions {} or {}", fromRegionId, toRegionId);
            return Collections.emptyList();
        }

        // BFS to find shortest path
        Queue<UUID> queue = new LinkedList<>();
        Map<UUID, UUID> parentMap = new HashMap<>();
        Set<UUID> visited = new HashSet<>();

        queue.add(startHub.getId());
        visited.add(startHub.getId());
        parentMap.put(startHub.getId(), null);

        while (!queue.isEmpty()) {
            UUID currentId = queue.poll();

            if (currentId.equals(endHub.getId())) {
                // Found the destination, reconstruct path
                return reconstructPath(parentMap, hubMap, startHub.getId(), endHub.getId());
            }

            List<TransferRoute> neighbors = adjacencyMap.getOrDefault(currentId, Collections.emptyList());
            for (TransferRoute route : neighbors) {
                UUID neighborId = route.getToHub().getId();
                if (!visited.contains(neighborId)) {
                    visited.add(neighborId);
                    parentMap.put(neighborId, currentId);
                    queue.add(neighborId);
                }
            }
        }

        log.warn("No path found between regions {} and {}", fromRegionId, toRegionId);
        return Collections.emptyList();
    }

    @Override
    @Transactional(readOnly = true)
    public int calculateEstimatedTransitHours(UUID originOfficeId, String destinationWardCode) {
        RouteResponse route = calculatePackageRoute(originOfficeId, destinationWardCode);
        return route.getEstimatedHours();
    }

    // ==================== HELPER METHODS ====================

    private List<Office> reconstructPath(Map<UUID, UUID> parentMap, Map<UUID, Office> hubMap, UUID startId, UUID endId) {
        List<Office> path = new ArrayList<>();
        UUID currentId = endId;

        while (currentId != null) {
            path.add(0, hubMap.get(currentId));
            currentId = parentMap.get(currentId);
        }

        return path;
    }

    private Office getHubForOffice(Office office) {
        // If office is a hub, return it
        if (office.getOfficeType() == OfficeType.HUB) {
            return office;
        }

        // If office has a parent, traverse up to find hub
        Office current = office;
        while (current != null) {
            if (current.getOfficeType() == OfficeType.HUB) {
                return current;
            }
            current = current.getParent();
        }

        // Fallback: find hub for the office's region
        return officeRepository.findAllByOfficeType(OfficeType.HUB).stream()
                .filter(h -> h.getRegion().getId().equals(office.getRegion().getId()))
                .findFirst()
                .orElse(null);
    }

    private Office findProvinceWarehouse(String provinceCode) {
        List<Office> warehouses = officeRepository.findByProvinceCodeAndOfficeType(provinceCode, OfficeType.PROVINCE_WAREHOUSE);
        return warehouses.isEmpty() ? null : warehouses.get(0);
    }

    private Office findWardOffice(String wardCode) {
        // For now, ward offices may not exist in all cases
        // This is a placeholder for when ward-level offices are created
        return null;
    }

    private boolean isAlreadyInStops(List<RouteResponse.RouteStop> stops, UUID officeId) {
        return stops.stream().anyMatch(s -> s.getOfficeId().equals(officeId));
    }

    private RouteResponse.RouteStop buildRouteStop(Office office, int stopOrder, int hoursFromStart) {
        return RouteResponse.RouteStop.builder()
                .officeId(office.getId())
                .officeName(office.getOfficeName())
                .officeType(office.getOfficeType())
                .provinceName(office.getProvince() != null ? office.getProvince().getName() : null)
                .regionName(office.getRegion() != null ? office.getRegion().getName() : null)
                .stopOrder(stopOrder)
                .estimatedHoursFromStart(hoursFromStart)
                .build();
    }
}
