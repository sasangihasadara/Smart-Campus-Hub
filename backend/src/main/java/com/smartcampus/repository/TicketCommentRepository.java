package com.smartcampus.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.smartcampus.model.TicketComment;

public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {
    List<TicketComment> findByTicketIdOrderByCreatedAtAsc(Long ticketId);
}
