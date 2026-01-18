package org.f3.postalmanagement.dto.response.route;

import lombok.Builder;
import lombok.Data;
import org.f3.postalmanagement.enums.OfficeType;

import java.util.List;
import java.util.UUID;

/**
 * Response DTO for package transfer route calculation.
 */
@Data
@Builder
public class RouteResponse {
    
    /**
     * Ordered list of stops in the route.
     */
    private List<RouteStop> stops;
    
    /**
     * Total number of stops in the route.
     */
    private int totalStops;
    
    /**
     * Estimated total transit time in hours.
     */
    private int estimatedHours;
    
    /**
     * Total distance in kilometers.
     */
    private int totalDistanceKm;
    
    /**
     * Whether the route stays within the same region.
     */
    private boolean sameRegion;
    
    /**
     * Whether the route stays within the same province.
     */
    private boolean sameProvince;

    @Data
    @Builder
    public static class RouteStop {
        /**
         * Office ID for this stop.
         */
        private UUID officeId;
        
        /**
         * Office name for display.
         */
        private String officeName;
        
        /**
         * Type of office at this stop.
         */
        private OfficeType officeType;
        
        /**
         * Province name (if applicable).
         */
        private String provinceName;
        
        /**
         * Region name.
         */
        private String regionName;
        
        /**
         * Order of this stop in the route (1-indexed).
         */
        private int stopOrder;
        
        /**
         * Estimated arrival time in hours from the start.
         */
        private int estimatedHoursFromStart;
    }
}
