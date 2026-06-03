package com.smartcampus.service;

import com.smartcampus.dto.NotificationResponseDTO;
import com.smartcampus.model.Notification;
import com.smartcampus.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final NotificationRepository notificationRepository;

    @Transactional
    public void createBookingStatusNotification(String recipientEmail, String resourceName, String status, String adminNote) {
        String normalizedStatus = status.toUpperCase();
        boolean approved = "APPROVED".equals(normalizedStatus);
        String title = approved ? "Booking approved" : "Booking rejected";
        String message = approved
                ? "Your booking for " + resourceName + " has been approved."
                : "Your booking for " + resourceName + " has been rejected.";

        if (adminNote != null && !adminNote.isBlank()) {
            message += " Admin note: " + adminNote;
        }

        notificationRepository.save(Notification.builder()
                .recipientEmail(recipientEmail)
                .title(title)
                .message(message)
                .category("Bookings")
                .tone(approved ? "#2fbf96" : "#ef4444")
                .readFlag(false)
                .build());
    }

    public List<NotificationResponseDTO> getForUser(String recipientEmail) {
        return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(recipientEmail).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void markAsRead(Long id, String recipientEmail) {
        notificationRepository.findById(id)
                .filter(notification -> notification.getRecipientEmail().equalsIgnoreCase(recipientEmail))
                .ifPresent(notification -> notification.setReadFlag(true));
    }

    @Transactional
    public void markAllAsRead(String recipientEmail) {
        notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(recipientEmail)
                .forEach(notification -> notification.setReadFlag(true));
    }

    @Transactional
    public void delete(Long id, String recipientEmail) {
        notificationRepository.findById(id)
                .filter(notification -> notification.getRecipientEmail().equalsIgnoreCase(recipientEmail))
                .ifPresent(notificationRepository::delete);
    }

    private NotificationResponseDTO toResponse(Notification notification) {
        return NotificationResponseDTO.builder()
                .id(notification.getId())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .category(notification.getCategory())
                .tone(notification.getTone())
                .read(notification.isReadFlag())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
