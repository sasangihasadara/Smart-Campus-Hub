package com.smartcampus.controller;

import com.smartcampus.dto.NotificationResponseDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.security.JwtService.JwtUser;
import com.smartcampus.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<NotificationResponseDTO>>> myNotifications(
            @AuthenticationPrincipal JwtUser user
    ) {
        return ResponseEntity.ok(ApiResponse.success(
                notificationService.getForUser(user.email()),
                "Notifications loaded"
        ));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUser user
    ) {
        notificationService.markAsRead(id, user.email());
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal JwtUser user) {
        notificationService.markAllAsRead(user.email());
        return ResponseEntity.ok(ApiResponse.success(null, "Notifications marked as read"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUser user
    ) {
        notificationService.delete(id, user.email());
        return ResponseEntity.ok(ApiResponse.success(null, "Notification deleted"));
    }
}
