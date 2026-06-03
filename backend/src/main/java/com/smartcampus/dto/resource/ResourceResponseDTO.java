package com.smartcampus.dto.resource;

import java.time.LocalDateTime;
import java.time.LocalTime;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceResponseDTO {
    private Long id;
    private String name;
    private ResourceType type;
    private Integer capacity;
    private String location;
    private ResourceStatus status;
    private LocalTime availFrom;
    private LocalTime availUntil;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
