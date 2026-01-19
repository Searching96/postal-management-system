package org.f3.postalmanagement.service.consolidation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.unit.ConsolidationRoute;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.repository.ConsolidationRouteRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.service.office.OfficeHierarchyValidator;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Authorizes consolidation route management operations.
 *
 * Authorization rules:
 * - SYSTEM_ADMIN: Can manage all consolidation routes
 * - PO_PROVINCE_ADMIN/WH_PROVINCE_ADMIN: Can manage routes in their province only
 * - Others: Cannot manage consolidation routes
 *
 * Business rule: Only PROVINCE_ADMIN can create consolidation routes from their province's
 * ward post offices/warehouses to their province warehouse.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ConsolidationRouteAuthorizationValidator {

    private final ConsolidationRouteRepository consolidationRouteRepository;
    private final OfficeRepository officeRepository;
    private final OfficeHierarchyValidator officeHierarchyValidator;

    /**
     * Validates if user can create a consolidation route.
     *
     * Requirements:
     * - User must be SYSTEM_ADMIN or PROVINCE_ADMIN
     * - Province code must match user's assigned office's province
     * - Destination warehouse must be a PROVINCE_WAREHOUSE
     * - Destination warehouse must be in the same province as user's office
     *
     * @param user The user performing the action
     * @param provinceCode The province code for the route
     * @param destinationWarehouseId The ID of the destination warehouse
     * @throws ForbiddenException if user is not authorized
     */
    @Transactional(readOnly = true)
    public void validateCreateConsolidationRoute(Account user, String provinceCode, UUID destinationWarehouseId) {
        // SYSTEM_ADMIN can create any consolidation route
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        // Only PROVINCE_ADMIN roles can create consolidation routes
        if (user.getRole() != Role.PO_PROVINCE_ADMIN &&
            user.getRole() != Role.WH_PROVINCE_ADMIN) {
            log.warn("User {} with role {} attempted to create consolidation route",
                    user.getId(), user.getRole());
            throw new ForbiddenException(
                "Consolidation route creation is restricted to SYSTEM_ADMIN and PROVINCE_ADMIN roles."
            );
        }

        // Check if user manages the province
        if (!officeHierarchyValidator.canManageProvince(user, provinceCode)) {
            log.warn("User {} attempted to create route in province {} without authorization",
                    user.getId(), provinceCode);
            throw new ForbiddenException(
                "You do not have permission to manage consolidation routes in province: " + provinceCode
            );
        }

        // Validate destination warehouse
        Office destinationWarehouse = officeRepository.findById(destinationWarehouseId)
                .orElseThrow(() -> new ForbiddenException("Destination warehouse not found"));

        // Destination must be a PROVINCE_WAREHOUSE
        if (destinationWarehouse.getOfficeType() != OfficeType.PROVINCE_WAREHOUSE &&
            destinationWarehouse.getOfficeType() != OfficeType.PROVINCE_POST) {
            log.warn("User {} attempted to create route with invalid destination type: {}",
                    user.getId(), destinationWarehouse.getOfficeType());
            throw new ForbiddenException(
                "Destination warehouse must be a PROVINCE_WAREHOUSE or PROVINCE_POST office."
            );
        }

        // Destination warehouse must be in the same province as the route
        if (!officeHierarchyValidator.canManageOffice(user, destinationWarehouseId)) {
            log.warn("User {} attempted to create route with warehouse {} outside their jurisdiction",
                    user.getId(), destinationWarehouseId);
            throw new ForbiddenException(
                "Destination warehouse must be within your province jurisdiction."
            );
        }
    }

    /**
     * Validates if user can update a consolidation route.
     *
     * Requirements:
     * - User must be SYSTEM_ADMIN or PROVINCE_ADMIN
     * - Route must be managed by a province that the user administers
     *
     * @param user The user performing the action
     * @param routeId The ID of the route to update
     * @throws ForbiddenException if user is not authorized
     */
    @Transactional(readOnly = true)
    public void validateUpdateConsolidationRoute(Account user, UUID routeId) {
        // SYSTEM_ADMIN can update any route
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        // Only PROVINCE_ADMIN roles can update consolidation routes
        if (user.getRole() != Role.PO_PROVINCE_ADMIN &&
            user.getRole() != Role.WH_PROVINCE_ADMIN) {
            log.warn("User {} with role {} attempted to update consolidation route",
                    user.getId(), user.getRole());
            throw new ForbiddenException(
                "Consolidation route update is restricted to SYSTEM_ADMIN and PROVINCE_ADMIN roles."
            );
        }

        // Get the route
        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new ForbiddenException("Consolidation route not found"));

        // Get province code from route
        String routeProvinceCode = route.getProvince().getCode();

        // Check if user manages the province
        if (!officeHierarchyValidator.canManageProvince(user, routeProvinceCode)) {
            log.warn("User {} attempted to update route in province {} without authorization",
                    user.getId(), routeProvinceCode);
            throw new ForbiddenException(
                "You do not have permission to manage consolidation routes in province: " + routeProvinceCode
            );
        }
    }

    /**
     * Validates if user can delete a consolidation route.
     *
     * Requirements:
     * - User must be SYSTEM_ADMIN or PROVINCE_ADMIN
     * - Route must be managed by a province that the user administers
     *
     * @param user The user performing the action
     * @param routeId The ID of the route to delete
     * @throws ForbiddenException if user is not authorized
     */
    @Transactional(readOnly = true)
    public void validateDeleteConsolidationRoute(Account user, UUID routeId) {
        // SYSTEM_ADMIN can delete any route
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        // Only PROVINCE_ADMIN roles can delete consolidation routes
        if (user.getRole() != Role.PO_PROVINCE_ADMIN &&
            user.getRole() != Role.WH_PROVINCE_ADMIN) {
            log.warn("User {} with role {} attempted to delete consolidation route",
                    user.getId(), user.getRole());
            throw new ForbiddenException(
                "Consolidation route deletion is restricted to SYSTEM_ADMIN and PROVINCE_ADMIN roles."
            );
        }

        // Get the route
        ConsolidationRoute route = consolidationRouteRepository.findById(routeId)
                .orElseThrow(() -> new ForbiddenException("Consolidation route not found"));

        // Get province code from route
        String routeProvinceCode = route.getProvince().getCode();

        // Check if user manages the province
        if (!officeHierarchyValidator.canManageProvince(user, routeProvinceCode)) {
            log.warn("User {} attempted to delete route in province {} without authorization",
                    user.getId(), routeProvinceCode);
            throw new ForbiddenException(
                "You do not have permission to manage consolidation routes in province: " + routeProvinceCode
            );
        }
    }
}
