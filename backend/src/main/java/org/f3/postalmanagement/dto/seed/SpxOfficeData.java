package org.f3.postalmanagement.dto.seed;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.util.List;

@Data
public class SpxOfficeData {
    private int retcode;
    private String message;
    private SpxDataContainer data;

    @Data
    public static class SpxDataContainer {
        private int total;
        @JsonProperty("list")
        private List<SpxOfficeItem> list;
    }
}
