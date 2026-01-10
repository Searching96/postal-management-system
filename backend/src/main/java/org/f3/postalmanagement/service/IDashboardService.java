package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.auth.RegisterSystemAdminRequest;

public interface IDashboardService {

    void registerNewAdmin(RegisterSystemAdminRequest request);
}
