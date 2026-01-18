package org.f3.postalmanagement.dto.response.administrative;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Ward information response")
public class WardResponse {

    @Schema(description = "Ward code")
    private String code;

    @Schema(description = "Ward name")
    private String name;

    @Schema(description = "Province name")
    private String provinceName;
}
