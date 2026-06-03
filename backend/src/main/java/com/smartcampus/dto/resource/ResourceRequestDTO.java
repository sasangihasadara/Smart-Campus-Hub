package com.smartcampus.dto.resource;

import java.time.LocalTime;

import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceRequestDTO {

    @NotBlank(message = "Resource name is required")
    @Size(min = 3, max = 80, message = "Resource name must be between 3 and 80 characters")
    private String name;

    @NotNull(message = "Resource type is required")
    private ResourceType type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be greater than zero")
    @Max(value = 500, message = "Capacity must not exceed 500")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    @Size(min = 3, max = 80, message = "Location must be between 3 and 80 characters")
    private String location;

    @NotNull(message = "Resource status is required")
    private ResourceStatus status;

    @NotNull(message = "Available from time is required")
    private LocalTime availFrom;

    @NotNull(message = "Available until time is required")
    private LocalTime availUntil;

    @Size(max = 240, message = "Description must not exceed 240 characters")
    private String description;
}
