package com.smartcampus.dto.resource;

import java.util.Map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceSummaryDTO {
    private long totalResources;
    private long activeResources;
    private long outOfServiceResources;
    private long maintenanceResources;
    private Map<String, Long> resourcesByType;
}
