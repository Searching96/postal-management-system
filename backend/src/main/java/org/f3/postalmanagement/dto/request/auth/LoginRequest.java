package org.f3.postalmanagement.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Login request")
public class LoginRequest {

    @NotNull(message = "Phone number is required")
    @Schema(
            description = "Phone number",
            example = "0123456789",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Pattern(
            regexp = "^[0-9]{10}$",
            message = "Invalid phone number format"
    )
    private String username;

    @NotNull(message = "Password is required")
    @Schema(
            description = "Password (at least 6 characters)",
            example = "123456 / abcdef",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @Size(
            min = 6,
            message = "Password must be at least 6 characters"
    )
    private String password;
}

