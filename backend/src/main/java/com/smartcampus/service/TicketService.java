package com.smartcampus.service;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.InvalidPathException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.dto.ticket.TicketAssignmentRequestDTO;
import com.smartcampus.dto.ticket.TicketAttachmentResponseDTO;
import com.smartcampus.dto.ticket.TicketCommentRequestDTO;
import com.smartcampus.dto.ticket.TicketCommentResponseDTO;
import com.smartcampus.dto.ticket.TicketCommentUpdateDTO;
import com.smartcampus.dto.ticket.TicketCreateRequestDTO;
import com.smartcampus.dto.ticket.TicketDeleteCommentDTO;
import com.smartcampus.dto.ticket.TicketResolutionRequestDTO;
import com.smartcampus.dto.ticket.TicketResponseDTO;
import com.smartcampus.dto.ticket.TicketStatusUpdateDTO;
import com.smartcampus.enums.TicketStatus;
import com.smartcampus.exception.ForbiddenOperationException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.TicketNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.TicketAttachment;
import com.smartcampus.model.TicketComment;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketAttachmentRepository;
import com.smartcampus.repository.TicketCommentRepository;
import com.smartcampus.repository.TicketRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class TicketService {

    private static final int MAX_ATTACHMENTS = 3;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp");
    private static final Set<String> STAFF_ROLES = Set.of("ADMIN", "STAFF", "TECHNICIAN");

    private final TicketRepository ticketRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketAttachmentRepository ticketAttachmentRepository;
    private final ResourceRepository resourceRepository;

    @Value("${app.upload.ticket-images-dir:backend/uploads/tickets}")
    private String uploadDirectory;

    @Transactional(readOnly = true)
    public List<TicketResponseDTO> getAllTickets(
            String search,
            TicketStatus status,
            String priority,
            String category,
            Long resourceId,
            String assignedToEmail,
            String reporterEmail) {
        Specification<Ticket> specification = buildSpecification(
                search,
                status,
                priority,
                category,
                resourceId,
                assignedToEmail,
                reporterEmail);
        return ticketRepository.findAll(specification).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public TicketResponseDTO getById(Long id) {
        return mapToResponse(findTicket(id));
    }

    public TicketResponseDTO create(TicketCreateRequestDTO request, List<MultipartFile> attachments) {
        validateCreateRequest(request);
        validateAttachmentBatch(attachments);

        Resource resource = null;
        String location = safeTrim(request.getLocation());
        if (request.getResourceId() != null) {
            resource = resourceRepository.findById(request.getResourceId())
                    .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id " + request.getResourceId()));
            if (location.isEmpty()) {
                location = resource.getLocation();
            }
        }

        if (location.isEmpty()) {
            throw new IllegalArgumentException("Location is required when no resource is selected");
        }

        Ticket ticket = Ticket.builder()
                .resource(resource)
                .category(request.getCategory())
                .location(location)
                .description(safeTrim(request.getDescription()))
                .priority(request.getPriority())
                .status(TicketStatus.OPEN)
                .preferredContactName(safeTrim(request.getPreferredContactName()))
                .preferredContactEmail(safeTrim(request.getPreferredContactEmail()).toLowerCase(Locale.ROOT))
                .preferredContactPhone(safeTrim(request.getPreferredContactPhone()))
                .reporterName(safeTrim(request.getReporterName()))
                .reporterEmail(safeTrim(request.getReporterEmail()).toLowerCase(Locale.ROOT))
                .build();

        Ticket savedTicket = ticketRepository.save(ticket);
        saveAttachments(savedTicket, attachments);
        return mapToResponse(findTicket(savedTicket.getId()));
    }

    public TicketResponseDTO assign(Long id, TicketAssignmentRequestDTO request) {
        requireAdminRole(request.getActorRole(), "Only admins can assign tickets");
        Ticket ticket = findTicket(id);
        ticket.setAssignedTo(safeTrim(request.getAssignedTo()));
        ticket.setAssignedToName(safeTrim(request.getAssignedToName()));
        ticket.setAssignedToEmail(safeTrim(request.getAssignedToEmail()).toLowerCase(Locale.ROOT));
        ticket.setAssignedStaffName(ticket.getAssignedToName());
        ticket.setAssignedStaffEmail(ticket.getAssignedToEmail());
        if (ticket.getStatus() == TicketStatus.OPEN) {
            ticket.setStatus(TicketStatus.IN_PROGRESS);
        }
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponseDTO updateStatus(Long id, TicketStatusUpdateDTO request) {
        requireStaffRole(request.getActorRole(), "Only staff or admins can update ticket status");
        Ticket ticket = findTicket(id);
        String actorRole = normalizeRole(request.getActorRole());
        String actorEmail = safeTrim(request.getActorEmail()).toLowerCase(Locale.ROOT);

        if (ticket.getStatus() == request.getStatus()) {
            return mapToResponse(ticket);
        }

        validateStatusTransition(ticket, request.getStatus(), actorRole, actorEmail);

        if (request.getStatus() == TicketStatus.RESOLVED) {
            if (safeTrim(request.getResolutionNotes()).isEmpty()) {
                throw new IllegalArgumentException("Resolution notes are required when resolving a ticket");
            }
            ticket.setResolutionNotes(request.getResolutionNotes().trim());
            ticket.setResolvedAt(LocalDateTime.now());
            ticket.setClosedAt(null);
            ticket.setRejectedAt(null);
        }

        if (request.getStatus() == TicketStatus.CLOSED) {
            ticket.setClosedAt(LocalDateTime.now());
        }

        if (request.getStatus() == TicketStatus.REJECTED) {
            if (safeTrim(request.getRejectionReason()).isEmpty()) {
                throw new IllegalArgumentException("Rejection reason is required when rejecting a ticket");
            }
            ticket.setRejectionReason(request.getRejectionReason().trim());
            ticket.setRejectedAt(LocalDateTime.now());
        }

        if (request.getStatus() != TicketStatus.REJECTED) {
            ticket.setRejectedAt(null);
            ticket.setRejectionReason(null);
        }
        ticket.setStatus(request.getStatus());
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketResponseDTO addResolution(Long id, TicketResolutionRequestDTO request) {
        requireStaffRole(request.getActorRole(), "Only staff or admins can save resolution notes");
        Ticket ticket = findTicket(id);
        String actorRole = normalizeRole(request.getActorRole());
        String actorEmail = safeTrim(request.getActorEmail()).toLowerCase(Locale.ROOT);
        if ("TECHNICIAN".equals(actorRole) || "STAFF".equals(actorRole)) {
            if (safeTrim(ticket.getAssignedToEmail()).isEmpty()
                    || (!ticket.getAssignedToEmail().equalsIgnoreCase(actorEmail)
                            && !safeTrim(ticket.getAssignedStaffEmail()).equalsIgnoreCase(actorEmail))) {
                throw new ForbiddenOperationException("Only the assigned technician can save resolution notes");
            }
        }
        ticket.setResolutionNotes(request.getResolutionNotes().trim());
        return mapToResponse(ticketRepository.save(ticket));
    }

    public TicketCommentResponseDTO addComment(Long ticketId, TicketCommentRequestDTO request) {
        Ticket ticket = findTicket(ticketId);
        TicketComment saved = ticketCommentRepository.save(TicketComment.builder()
                .ticket(ticket)
                .authorName(request.getAuthorName().trim())
                .authorEmail(request.getAuthorEmail().trim().toLowerCase(Locale.ROOT))
                .authorRole(safeTrim(request.getAuthorRole()).toUpperCase(Locale.ROOT))
                .body(request.getMessage().trim())
                .build());
        return mapComment(saved);
    }

    public TicketCommentResponseDTO updateComment(Long ticketId, Long commentId, TicketCommentUpdateDTO request) {
        TicketComment comment = findComment(ticketId, commentId);
        ensureCommentOwnership(comment, request.getActorEmail(), request.getActorRole());
        comment.setBody(request.getBody().trim());
        return mapComment(ticketCommentRepository.save(comment));
    }

    public void deleteComment(Long ticketId, Long commentId, TicketDeleteCommentDTO request) {
        TicketComment comment = findComment(ticketId, commentId);
        ensureCommentOwnership(comment, request.getActorEmail(), request.getActorRole());
        ticketCommentRepository.delete(comment);
    }

    public TicketAttachmentResponseDTO addAttachment(Long ticketId, MultipartFile attachment) {
        Ticket ticket = findTicket(ticketId);
        if (ticket.getAttachments().size() >= MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("A ticket can include up to 3 attachments");
        }
        validateAttachment(attachment);
        TicketAttachment saved = storeAttachment(ticket, attachment);
        return mapAttachment(saved);
    }

    public void deleteAttachment(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = findAttachment(ticketId, attachmentId);

        try {
            Files.deleteIfExists(Paths.get(attachment.getFilePath()));
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to delete attachment file from storage");
        }
        ticketAttachmentRepository.delete(attachment);
    }

    @Transactional(readOnly = true)
    public org.springframework.core.io.Resource loadAttachment(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = findAttachment(ticketId, attachmentId);
        try {
            org.springframework.core.io.Resource resource = new UrlResource(Paths.get(attachment.getFilePath()).toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new IllegalArgumentException("Attachment file is not available");
            }
            return resource;
        } catch (IOException | InvalidPathException ex) {
            throw new IllegalArgumentException("Unable to read attachment file");
        }
    }

    @Transactional(readOnly = true)
    public String getAttachmentFileName(Long ticketId, Long attachmentId) {
        return findAttachment(ticketId, attachmentId).getOriginalFileName();
    }

    public void deleteTicket(Long id, String actorRole) {
        requireAdminRole(actorRole, "Only admins can delete tickets");
        Ticket ticket = findTicket(id);

        ticketAttachmentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId()).stream()
                .map(TicketAttachment::getFilePath)
                .filter(path -> path != null && !path.isBlank())
                .map(Paths::get)
                .forEach(path -> {
                    try {
                        Files.deleteIfExists(path);
                    } catch (IOException ignored) {
                        // The database delete still removes the ticket; dangling files can be cleaned up later.
                    }
                });

        ticketRepository.delete(ticket);
    }

    private void validateCreateRequest(TicketCreateRequestDTO request) {
        if (safeTrim(request.getLocation()).isEmpty() && request.getResourceId() == null) {
            throw new IllegalArgumentException("Select a resource or provide a location");
        }
    }

    private void validateAttachmentBatch(List<MultipartFile> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return;
        }
        if (attachments.size() > MAX_ATTACHMENTS) {
            throw new IllegalArgumentException("A ticket can include up to 3 attachments");
        }
        attachments.stream()
                .filter(file -> file != null && !file.isEmpty())
                .forEach(this::validateAttachment);
    }

    private void validateAttachment(MultipartFile attachment) {
        if (attachment == null || attachment.isEmpty()) {
            throw new IllegalArgumentException("Attachment cannot be empty");
        }
        String contentType = safeTrim(attachment.getContentType()).toLowerCase(Locale.ROOT);
        if (!ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Only JPG, PNG, or WEBP images are allowed");
        }
    }

    private void saveAttachments(Ticket ticket, List<MultipartFile> attachments) {
        if (attachments == null) {
            return;
        }
        attachments.stream()
                .filter(file -> file != null && !file.isEmpty())
                .forEach(file -> storeAttachment(ticket, file));
    }

    private TicketAttachment storeAttachment(Ticket ticket, MultipartFile file) {
        try {
            Path uploadPath = Paths.get(uploadDirectory).toAbsolutePath().normalize();
            Files.createDirectories(uploadPath);

            String storedFileName = UUID.randomUUID() + "-" + sanitizeFileName(file.getOriginalFilename());
            Path target = uploadPath.resolve(storedFileName);
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, target, StandardCopyOption.REPLACE_EXISTING);
            }

            TicketAttachment attachment = TicketAttachment.builder()
                    .ticket(ticket)
                    .originalFileName(sanitizeFileName(file.getOriginalFilename()))
                    .storedFileName(storedFileName)
                    .filePath(target.toString())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .build();
            return ticketAttachmentRepository.save(attachment);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Unable to store attachment");
        }
    }

    private void validateStatusTransition(Ticket ticket, TicketStatus nextStatus, String actorRole, String actorEmail) {
        TicketStatus currentStatus = ticket.getStatus();
        switch (currentStatus) {
            case OPEN -> {
                if (nextStatus != TicketStatus.IN_PROGRESS && nextStatus != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("OPEN tickets can only move to IN_PROGRESS or REJECTED");
                }
            }
            case IN_PROGRESS -> {
                if (nextStatus != TicketStatus.RESOLVED && nextStatus != TicketStatus.REJECTED) {
                    throw new IllegalArgumentException("IN_PROGRESS tickets can only move to RESOLVED or REJECTED");
                }
            }
            case RESOLVED -> {
                if (nextStatus != TicketStatus.CLOSED) {
                    throw new IllegalArgumentException("RESOLVED tickets can only move to CLOSED");
                }
            }
            case CLOSED, REJECTED -> throw new IllegalArgumentException("Closed or rejected tickets cannot be changed");
            default -> throw new IllegalArgumentException("Unsupported ticket status transition");
        }

        if (nextStatus == TicketStatus.REJECTED && !"ADMIN".equals(actorRole)) {
            throw new ForbiddenOperationException("Only admins can reject a ticket");
        }

        if ("TECHNICIAN".equals(actorRole) || "STAFF".equals(actorRole)) {
            if (safeTrim(ticket.getAssignedToEmail()).isEmpty()) {
                throw new ForbiddenOperationException("Only the assigned technician can update this ticket");
            }
            if (!ticket.getAssignedToEmail().equalsIgnoreCase(actorEmail)
                    && !safeTrim(ticket.getAssignedStaffEmail()).equalsIgnoreCase(actorEmail)) {
                throw new ForbiddenOperationException("Only the assigned technician can update this ticket");
            }
        }
    }

    private Ticket findTicket(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new TicketNotFoundException("Ticket not found for id " + id));
    }

    private TicketComment findComment(Long ticketId, Long commentId) {
        TicketComment comment = ticketCommentRepository.findById(commentId)
                .orElseThrow(() -> new TicketNotFoundException("Comment not found for id " + commentId));
        if (!comment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Comment does not belong to the selected ticket");
        }
        return comment;
    }

    private TicketAttachment findAttachment(Long ticketId, Long attachmentId) {
        TicketAttachment attachment = ticketAttachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new TicketNotFoundException("Attachment not found for id " + attachmentId));
        if (!attachment.getTicket().getId().equals(ticketId)) {
            throw new IllegalArgumentException("Attachment does not belong to the selected ticket");
        }
        return attachment;
    }

    private void ensureCommentOwnership(TicketComment comment, String actorEmail, String actorRole) {
        String normalizedEmail = safeTrim(actorEmail).toLowerCase(Locale.ROOT);
        String normalizedRole = normalizeRole(actorRole);
        boolean owner = comment.getAuthorEmail().equalsIgnoreCase(normalizedEmail);
        boolean admin = "ADMIN".equals(normalizedRole);
        if (!owner && !admin) {
            throw new ForbiddenOperationException("Only the comment owner or an admin can modify this comment");
        }
    }

    private void requireStaffRole(String actorRole, String message) {
        if (!STAFF_ROLES.contains(normalizeRole(actorRole))) {
            throw new ForbiddenOperationException(message);
        }
    }

    private void requireAdminRole(String actorRole, String message) {
        if (!"ADMIN".equals(normalizeRole(actorRole))) {
            throw new ForbiddenOperationException(message);
        }
    }

    private TicketResponseDTO mapToResponse(Ticket ticket) {
        if (ticket == null) return null;
        
        List<TicketAttachmentResponseDTO> attachments = new ArrayList<>();
        try {
            attachments = ticketAttachmentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                    .stream()
                    .map(this::mapAttachment)
                    .toList();
        } catch (Exception e) {
            // Log error or handle gracefully
        }

        List<TicketCommentResponseDTO> comments = new ArrayList<>();
        try {
            comments = ticketCommentRepository.findByTicketIdOrderByCreatedAtAsc(ticket.getId())
                    .stream()
                    .map(this::mapComment)
                    .toList();
        } catch (Exception e) {
            // Log error or handle gracefully
        }

        return TicketResponseDTO.builder()
                .id(ticket.getId())
                .resourceId(ticket.getResource() != null ? ticket.getResource().getId() : null)
                .resourceName(ticket.getResource() != null ? ticket.getResource().getName() : null)
                .category(ticket.getCategory())
                .location(ticket.getLocation() != null ? ticket.getLocation() : "Unknown")
                .description(ticket.getDescription() != null ? ticket.getDescription() : "")
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .preferredContactName(ticket.getPreferredContactName())
                .preferredContactEmail(ticket.getPreferredContactEmail())
                .preferredContactPhone(ticket.getPreferredContactPhone())
                .reporterName(ticket.getReporterName())
                .reporterEmail(ticket.getReporterEmail())
                .assignedTo(ticket.getAssignedTo())
                .assignedToName(ticket.getAssignedToName())
                .assignedToEmail(ticket.getAssignedToEmail())
                .assignedStaffName(ticket.getAssignedStaffName())
                .assignedStaffEmail(ticket.getAssignedStaffEmail())
                .resolutionNotes(ticket.getResolutionNotes())
                .rejectionReason(ticket.getRejectionReason())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .rejectedAt(ticket.getRejectedAt())
                .createdAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt() : LocalDateTime.now())
                .updatedAt(ticket.getUpdatedAt() != null ? ticket.getUpdatedAt() : LocalDateTime.now())
                .attachments(attachments)
                .comments(comments)
                .build();
    }

    private TicketAttachmentResponseDTO mapAttachment(TicketAttachment attachment) {
        return TicketAttachmentResponseDTO.builder()
                .id(attachment.getId())
                .originalFileName(attachment.getOriginalFileName())
                .storedFileName(attachment.getStoredFileName())
                .filePath(attachment.getFilePath())
                .downloadUrl("/api/tickets/" + attachment.getTicket().getId() + "/attachments/" + attachment.getId() + "/content")
                .contentType(attachment.getContentType())
                .fileSize(attachment.getFileSize())
                .createdAt(attachment.getCreatedAt())
                .build();
    }

    private TicketCommentResponseDTO mapComment(TicketComment comment) {
        return TicketCommentResponseDTO.builder()
                .id(comment.getId())
                .authorName(comment.getAuthorName())
                .authorEmail(comment.getAuthorEmail())
                .authorRole(comment.getAuthorRole())
                .message(comment.getBody())
                .body(comment.getBody())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .editableByRequester(false)
                .build();
    }

    private Specification<Ticket> buildSpecification(
            String search,
            TicketStatus status,
            String priority,
            String category,
            Long resourceId,
            String assignedToEmail,
            String reporterEmail) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (search != null && !search.isBlank()) {
                String searchValue = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchValue),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), searchValue),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("reporterName")), searchValue),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("assignedToName")), searchValue)));
            }

            if (status != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("status"), status));
            }

            if (priority != null && !priority.isBlank()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("priority"), Enum.valueOf(com.smartcampus.enums.TicketPriority.class, priority.toUpperCase(Locale.ROOT))));
            }

            if (category != null && !category.isBlank()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(root.get("category"), Enum.valueOf(com.smartcampus.enums.TicketCategory.class, category.toUpperCase(Locale.ROOT))));
            }

            if (resourceId != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("resource").get("id"), resourceId));
            }

            if (assignedToEmail != null && !assignedToEmail.isBlank()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("assignedToEmail")),
                                "%" + assignedToEmail.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (reporterEmail != null && !reporterEmail.isBlank()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.equal(criteriaBuilder.lower(root.get("reporterEmail")),
                                reporterEmail.trim().toLowerCase(Locale.ROOT)));
            }

            query.orderBy(criteriaBuilder.desc(root.get("createdAt")));
            return predicate;
        };
    }

    private String sanitizeFileName(String fileName) {
        String safeFileName = safeTrim(fileName);
        if (safeFileName.isEmpty()) {
            return "attachment";
        }
        return safeFileName.replaceAll("[\\\\/:*?\"<>|\\s]+", "-");
    }

    private String safeTrim(String value) {
        return value == null ? "" : value.trim();
    }

    private String normalizeRole(String role) {
        return safeTrim(role).toUpperCase(Locale.ROOT);
    }
}
