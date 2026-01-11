package org.f3.postalmanagement.dto.request.employee;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.util.UUID;

@Data
@Schema(description = "Request to register a new HUB admin")
public class RegisterHubAdminRequest {

    @NotNull(message = "Full name is required")
    @Schema(
            description = "Full name of the HUB admin",
            example = "Nguyen Van A",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String fullName;

    @NotNull(message = "Phone number is required")
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format (must be 10 digits)"
    )
    @Schema(
            description = "Phone number (used as username)",
            example = "0901234567",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String phoneNumber;

    @NotNull(message = "Password is required")
    @Schema(
            description = "Password (at least 6 characters)",
            example = "123456",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String password;

    @NotNull(message = "Email is required")
    @Email(message = "Invalid email format")
    @Schema(
            description = "Email address",
            example = "hubadmin@f3postal.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String email;

    @NotNull(message = "Office ID is required")
    @Schema(
            description = "ID of the HUB office where the admin will work",
            example = "550e8400-e29b-41d4-a716-446655440000",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private UUID officeId;
}
