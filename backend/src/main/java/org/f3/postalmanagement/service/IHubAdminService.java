package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.employee.RegisterHubAdminRequest;
import org.f3.postalmanagement.dto.response.employee.EmployeeResponse;
import org.f3.postalmanagement.entity.actor.Account;

public interface IHubAdminService {

    /**
     * Register a new HUB admin.
     * - SYSTEM_ADMIN can register for any HUB
     * - HUB_ADMIN can only register for their own region's HUB
     *
     * @param request the registration request
     * @param currentAccount the account of the user making the request
     * @return the registered employee response
     */
    EmployeeResponse registerHubAdmin(RegisterHubAdminRequest request, Account currentAccount);
}
