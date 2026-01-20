package org.f3.postalmanagement.dto.seed;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SpxOfficeItem {
    @JsonProperty("id")
    private Long id;

    @JsonProperty("address")
    private String address;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("latitude")
    private Double latitude;

    @JsonProperty("longitude")
    private Double longitude;

    @JsonProperty("address_data")
    private String addressDataInfo; // This is a JSON string, might need parsing manually or separate DTO

    @JsonProperty("alias")
    private String alias;
    
    @JsonProperty("open_hours")
    private String openHours; 
    
    // Helper to extract District/City names parsing the address_data json string if needed
    // or we just trust the text in 'address' or 'alias' for now.
    // The address_data string looks like: "{\"state\":\"TP. Hồ Chí Minh\",\"city\":\"Quận Bình Thạnh\",\"district\":\"Phường 12\"...}"
}
