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

    // Employee-specific fields
    @Schema(description = "Office ID (for employees only)")
    private UUID officeId;

    @Schema(description = "Office name (for employees only)")
    private String officeName;

    @Schema(description = "Office type (for employees only)")
    private String officeType;

    @Schema(description = "Region name (for employees only)")
    private String regionName;
}
