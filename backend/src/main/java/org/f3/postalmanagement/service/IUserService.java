package org.f3.postalmanagement.service;

import org.f3.postalmanagement.dto.response.user.UserResponse;

public interface IUserService {

    UserResponse fetchMe();
}
