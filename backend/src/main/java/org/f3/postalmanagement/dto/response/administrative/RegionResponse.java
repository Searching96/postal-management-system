package org.f3.postalmanagement.dto.response.administrative;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
@Schema(description = "Administrative region information response")
public class RegionResponse {

    @Schema(description = "Region ID")
    private Integer id;

    @Schema(description = "Region name")
    private String name;
}
