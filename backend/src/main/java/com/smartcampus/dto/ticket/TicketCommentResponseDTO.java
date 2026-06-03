package com.smartcampus.dto.ticket;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCommentResponseDTO {
    private Long id;
    private String authorName;
    private String authorEmail;
    private String authorRole;
    private String message;
    private String body;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private boolean editableByRequester;
}
