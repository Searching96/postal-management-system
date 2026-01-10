package org.f3.postalmanagement.dto.response.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@Schema(description = "User information response")
public class UserResponse {

    private UUID id;

    private String fullName;

    private String username;

    private String phoneNumber;

    private String role;

    private String email;

    private String address;

    private String subscriptionPlan;

    private boolean isActive;
}
