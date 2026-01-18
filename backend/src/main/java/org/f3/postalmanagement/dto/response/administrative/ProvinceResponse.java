package org.f3.postalmanagement.dto.response.administrative;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Province information response")
public class ProvinceResponse {

    @Schema(description = "Province code")
    private String code;

    @Schema(description = "Province name")
    private String name;

    @Schema(description = "Administrative region name")
    private String administrativeRegionName;
}
