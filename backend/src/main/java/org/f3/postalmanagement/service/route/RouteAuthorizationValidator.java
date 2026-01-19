package org.f3.postalmanagement.service.route;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.Office;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.repository.EmployeeRepository;
import org.f3.postalmanagement.repository.OfficeRepository;
import org.f3.postalmanagement.repository.TransferRouteRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Authorizes route management operations based on role and route hierarchy.
 *
 * Authorization rules:
 * - SYSTEM_ADMIN: Can manage all routes
 * - NATIONAL_MANAGER: Can manage HUB-level routes (all transfer routes)
 * - HUB_ADMIN: Can only manage routes where they're assigned to one of the connecting HUBs
 * - Others: Cannot manage routes
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RouteAuthorizationValidator {

    private final TransferRouteRepository transferRouteRepository;
    private final EmployeeRepository employeeRepository;
    private final OfficeRepository officeRepository;

    /**
     * Validates if the current user can disable/enable a route.
     *
     * @param routeId The route to authorize
     * @param currentAccount The user performing the action
     * @throws ForbiddenException if user is not authorized
     */
    @Transactional(readOnly = true)
    public void validateRouteManagementAccess(UUID routeId, Account currentAccount) {
        // SYSTEM_ADMIN can always manage routes
        if (currentAccount.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        // NATIONAL_MANAGER can manage HUB-level routes (all transfer routes)
        if (currentAccount.getRole() == Role.NATIONAL_MANAGER) {
            return;
        }

        // HUB_ADMIN can only manage routes where they manage one of the connecting HUBs
        if (currentAccount.getRole() == Role.HUB_ADMIN) {
            Employee employee = employeeRepository.findById(currentAccount.getId())
                    .orElseThrow(() -> new ForbiddenException("Employee not found"));

            TransferRoute route = transferRouteRepository.findById(routeId)
                    .orElseThrow(() -> new ForbiddenException("Route not found"));

            // Check if employee's office is one of the route's HUBs
            UUID employeeOfficeId = employee.getOffice().getId();
            UUID fromHubId = route.getFromHub().getId();
            UUID toHubId = route.getToHub().getId();

            boolean isAuthorized = employeeOfficeId.equals(fromHubId) ||
                                 employeeOfficeId.equals(toHubId);

            if (!isAuthorized) {
                log.warn("HUB_ADMIN {} attempted to manage route {} without jurisdiction",
                        employee.getFullName(), routeId);
                throw new ForbiddenException(
                    "Route management not under your jurisdiction. " +
                    "HUB_ADMIN can only manage routes where they are assigned to one of the connecting HUBs."
                );
            }
            return;
        }

        // All other roles cannot manage routes
        throw new ForbiddenException(
            "You do not have permission to manage routes. " +
            "Only SYSTEM_ADMIN, NATIONAL_MANAGER, and HUB_ADMIN roles can manage routes."
        );
    }

    /**
     * Validates if user can create a transfer route.
     *
     * Requirements for TRANSFER ROUTES (both HUB_TO_HUB and PROVINCE_TO_HUB):
     * - SYSTEM_ADMIN: Can create any transfer route
     * - NATIONAL_MANAGER: Can create any transfer route
     * - HUB_ADMIN: Can only create routes from their own HUB (fromHubId must match their office)
     * - Others: Cannot create transfer routes
     *
     * Special handling for PROVINCE_TO_HUB routes:
     * - Only fromHubId and toHubId are validated
     * - provinceWarehouseId is used by the service layer but doesn't affect authorization
     *
     * @param user The user performing the action
     * @param fromHubId The source hub/warehouse
     * @param toHubId The destination hub
     * @param provinceWarehouseId The province warehouse (for PROVINCE_TO_HUB routes, can be null for HUB_TO_HUB)
     * @throws ForbiddenException if user is not authorized
     */
    @Transactional(readOnly = true)
    public void validateCreateTransferRoute(Account user, UUID fromHubId, UUID toHubId, UUID provinceWarehouseId) {
        // SYSTEM_ADMIN can create any transfer route
        if (user.getRole() == Role.SYSTEM_ADMIN) {
            return;
        }

        // NATIONAL_MANAGER can create any transfer route
        if (user.getRole() == Role.NATIONAL_MANAGER) {
            return;
        }

        // HUB_ADMIN can only create routes from their own HUB
        if (user.getRole() == Role.HUB_ADMIN) {
            Employee employee = employeeRepository.findById(user.getId())
                    .orElseThrow(() -> new ForbiddenException("Employee not found"));

            UUID employeeOfficeId = employee.getOffice().getId();

            // HUB_ADMIN can only create routes starting from their own HUB
            if (!employeeOfficeId.equals(fromHubId)) {
                log.warn("HUB_ADMIN {} attempted to create route from hub {} (their hub is {})",
                        employee.getFullName(), fromHubId, employeeOfficeId);
                throw new ForbiddenException(
                    "HUB_ADMIN can only create routes from their own HUB. " +
                    "Your assigned HUB is: " + employeeOfficeId
                );
            }
            return;
        }

        // All other roles cannot create transfer routes
        log.warn("User {} with role {} attempted to create transfer route",
                user.getId(), user.getRole());
        throw new ForbiddenException(
            "You do not have permission to create transfer routes. " +
            "Only SYSTEM_ADMIN, NATIONAL_MANAGER, and HUB_ADMIN roles can create transfer routes."
        );
    }

    /**
     * Returns a user-friendly description of which roles can manage routes.
     */
    public String getRouteManagementPermissionDescription(Account account) {
        return switch (account.getRole()) {
            case SYSTEM_ADMIN -> "You can manage all routes.";
            case NATIONAL_MANAGER -> "You can manage all HUB-level routes (inter-hub transfer routes).";
            case HUB_ADMIN -> "You can manage routes where you are assigned to one of the connecting HUBs.";
            default -> "You do not have permission to manage routes.";
        };
    }
}
