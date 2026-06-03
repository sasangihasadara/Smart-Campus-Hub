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
public class TicketAttachmentResponseDTO {
    private Long id;
    private String originalFileName;
    private String storedFileName;
    private String filePath;
    private String downloadUrl;
    private String contentType;
    private long fileSize;
    private LocalDateTime createdAt;
}
