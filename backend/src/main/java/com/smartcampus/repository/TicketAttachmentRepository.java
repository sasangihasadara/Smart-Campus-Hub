package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.model.TicketAttachment;

public interface TicketAttachmentRepository extends JpaRepository<TicketAttachment, Long> {
    List<TicketAttachment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
