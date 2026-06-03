package com.smartcampus.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponseDTO {
    private Long id;
    private String title;
    private String message;
    private String category;
    private String tone;
    private boolean read;
    private LocalDateTime createdAt;
}
