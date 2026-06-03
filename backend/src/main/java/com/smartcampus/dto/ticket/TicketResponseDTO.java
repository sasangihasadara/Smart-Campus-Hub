package com.smartcampus.dto.ticket;

import java.time.LocalDateTime;
import java.util.List;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;
import com.smartcampus.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketResponseDTO {
    private Long id;
    private Long resourceId;
    private String resourceName;
    private TicketCategory category;
    private String location;
    private String description;
    private TicketPriority priority;
    private TicketStatus status;
    private String preferredContactName;
    private String preferredContactEmail;
    private String preferredContactPhone;
    private String reporterName;
    private String reporterEmail;
    private String assignedTo;
    private String assignedToName;
    private String assignedToEmail;
    private String assignedStaffName;
    private String assignedStaffEmail;
    private String resolutionNotes;
    private String rejectionReason;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private LocalDateTime rejectedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<TicketAttachmentResponseDTO> attachments;
    private List<TicketCommentResponseDTO> comments;
}
