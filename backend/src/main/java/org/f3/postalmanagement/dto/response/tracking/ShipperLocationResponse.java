package org.f3.postalmanagement.dto.response.tracking;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShipperLocationResponse {

    private UUID shipperId;
    private String shipperName;
    private String shipperPhone;
    
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Double accuracy;
    private Double heading;
    private Double speed;
    private LocalDateTime timestamp;
    
    private boolean isActive;
}
