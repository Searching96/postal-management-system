package org.f3.postalmanagement.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
@Schema(description = "Paginated response wrapper")
public class PageResponse<T> {

    @Schema(description = "List of items in current page")
    private List<T> content;

    @Schema(description = "Current page number (0-indexed)")
    private int pageNumber;

    @Schema(description = "Number of items per page")
    private int pageSize;

    @Schema(description = "Total number of items")
    private long totalElements;

    @Schema(description = "Total number of pages")
    private int totalPages;

    @Schema(description = "Whether this is the first page")
    private boolean first;

    @Schema(description = "Whether this is the last page")
    private boolean last;

    @Schema(description = "Whether there is a next page")
    private boolean hasNext;

    @Schema(description = "Whether there is a previous page")
    private boolean hasPrevious;
}
