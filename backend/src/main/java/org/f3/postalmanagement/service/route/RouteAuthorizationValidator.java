package org.f3.postalmanagement.service.route;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.f3.postalmanagement.entity.actor.Account;
import org.f3.postalmanagement.entity.actor.Employee;
import org.f3.postalmanagement.entity.unit.TransferRoute;
import org.f3.postalmanagement.enums.OfficeType;
import org.f3.postalmanagement.enums.Role;
import org.f3.postalmanagement.exception.ForbiddenException;
import org.f3.postalmanagement.repository.EmployeeRepository;
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
