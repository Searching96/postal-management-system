package org.f3.postalmanagement.dto.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
@Schema(description = "Login request")
public class LoginRequest {

    @Schema(description = "Username (phone number for customer)")
    @NotNull(message = "Username is required")
    private String username;

    @Schema(description = "Password (at least 6 characters)")
    @NotNull(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}

