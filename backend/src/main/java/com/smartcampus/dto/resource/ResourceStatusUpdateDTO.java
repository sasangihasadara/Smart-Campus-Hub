package com.smartcampus.dto.resource;

import com.smartcampus.enums.ResourceStatus;

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
public class ResourceStatusUpdateDTO {

    @NotNull(message = "Resource status is required")
    private ResourceStatus status;

    @Size(max = 240, message = "Status note must not exceed 240 characters")
    private String note;
}
