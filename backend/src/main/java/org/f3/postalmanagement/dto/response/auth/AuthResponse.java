package org.f3.postalmanagement.dto.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Authentication response (JWT token)")
public class AuthResponse {

    @Schema(description = "JWT token")
    private String token;
}
