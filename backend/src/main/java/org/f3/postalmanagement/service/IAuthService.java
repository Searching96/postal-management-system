package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.request.auth.CustomerRegisterRequest;
import org.f3.postalmanagement.dto.response.auth.AuthResponse;

public interface IAuthService {

    AuthResponse login(String username, String password);

    void register(CustomerRegisterRequest request);
}
