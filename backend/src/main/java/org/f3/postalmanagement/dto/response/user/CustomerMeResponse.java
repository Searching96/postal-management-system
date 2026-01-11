package org.f3.postalmanagement.dto.response.user;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
@Schema(description = "Customer user information response")
public class CustomerMeResponse {

    @Schema(description = "Account ID")
    private UUID id;

    @Schema(description = "Username (phone number)")
    private String username;

    @Schema(description = "Email address")
    private String email;

    @Schema(description = "Role")
    private String role;

    @Schema(description = "Account active status")
    private boolean isActive;

    @Schema(description = "Full name")
    private String fullName;

    @Schema(description = "Phone number")
    private String phoneNumber;

    @Schema(description = "Address")
    private String address;

    @Schema(description = "Subscription plan")
    private String subscriptionPlan;
}
