package com.smartcampus.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import com.smartcampus.dto.response.ApiResponse;
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
import com.smartcampus.service.TicketService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<TicketResponseDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) String priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) String assignedToEmail,
            @RequestParam(required = false) String reporterEmail) {
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.getAllTickets(search, status, priority, category, resourceId, assignedToEmail, reporterEmail),
                "Tickets retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getById(id), "Ticket retrieved successfully"));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TicketResponseDTO>> create(
            @Valid @ModelAttribute TicketCreateRequestDTO request,
            @RequestParam(required = false) List<MultipartFile> attachments) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticketService.create(request, attachments), "Ticket created successfully"));
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> assign(
            @PathVariable Long id,
            @Valid @RequestBody TicketAssignmentRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.assign(id, request), "Ticket assigned successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody TicketStatusUpdateDTO request) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.updateStatus(id, request), "Ticket status updated successfully"));
    }

    @PatchMapping("/{id}/resolution")
    public ResponseEntity<ApiResponse<TicketResponseDTO>> addResolution(
            @PathVariable Long id,
            @Valid @ModelAttribute TicketResolutionRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.addResolution(id, request), "Ticket resolution updated successfully"));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TicketCommentResponseDTO>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody TicketCommentRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticketService.addComment(id, request), "Comment added successfully"));
    }

    @PatchMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<TicketCommentResponseDTO>> updateComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @Valid @ModelAttribute TicketCommentUpdateDTO request) {
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.updateComment(ticketId, commentId, request),
                "Comment updated successfully"));
    }

    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<ApiResponse<Void>> deleteComment(
            @PathVariable Long ticketId,
            @PathVariable Long commentId,
            @RequestParam String actorEmail,
            @RequestParam(required = false) String actorRole) {
        TicketDeleteCommentDTO request = TicketDeleteCommentDTO.builder()
                .actorEmail(actorEmail)
                .actorRole(actorRole)
                .build();
        ticketService.deleteComment(ticketId, commentId, request);
        return ResponseEntity.ok(ApiResponse.success(null, "Comment deleted successfully"));
    }

    @PostMapping(path = "/{id}/attachments", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<TicketAttachmentResponseDTO>> addAttachment(
            @PathVariable Long id,
            @RequestParam MultipartFile attachment) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(ticketService.addAttachment(id, attachment), "Attachment added successfully"));
    }

    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<ApiResponse<Void>> deleteAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        ticketService.deleteAttachment(ticketId, attachmentId);
        return ResponseEntity.ok(ApiResponse.success(null, "Attachment deleted successfully"));
    }

    @GetMapping("/{ticketId}/attachments/{attachmentId}/content")
    public ResponseEntity<Resource> downloadAttachment(
            @PathVariable Long ticketId,
            @PathVariable Long attachmentId) {
        Resource resource = ticketService.loadAttachment(ticketId, attachmentId);
        String fileName = ticketService.getAttachmentFileName(ticketId, attachmentId);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(fileName).build().toString())
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteTicket(
            @PathVariable Long id,
            @RequestParam String actorRole) {
        ticketService.deleteTicket(id, actorRole);
        return ResponseEntity.ok(ApiResponse.success(null, "Ticket deleted successfully"));
    }
}
