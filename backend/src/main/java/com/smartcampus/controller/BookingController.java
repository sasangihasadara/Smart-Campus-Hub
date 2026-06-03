package com.smartcampus.controller;

import com.smartcampus.dto.AdminBookingActionDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService.JwtUser;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
@org.springframework.validation.annotation.Validated
public class BookingController {

    private final BookingService bookingService;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<ApiResponse<BookingResponseDTO>> createBooking(
            @Valid @RequestBody BookingRequestDTO dto,
            @AuthenticationPrincipal JwtUser jwtUser) {
        User user = requireCurrentUser(jwtUser);
        String userId = user.getEmail();
        String userName = user.getName();
        
        BookingResponseDTO response = bookingService.createBooking(dto, userId, userName);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Booking created successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookings(@AuthenticationPrincipal JwtUser jwtUser) {
        User user = requireCurrentUser(jwtUser);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookings(user.getEmail()), "Your bookings retrieved successfully"));
    }

    @GetMapping("/my/filter")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getMyBookingsByStatus(
            @RequestParam(required = false) BookingStatus status,
            @AuthenticationPrincipal JwtUser jwtUser) {
        User user = requireCurrentUser(jwtUser);
        return ResponseEntity.ok(ApiResponse.success(bookingService.getMyBookingsByStatus(user.getEmail(), status), "Filtered bookings retrieved successfully"));
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getPendingBookings() {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getPendingBookings(), "Pending bookings retrieved successfully"));
    }

    @GetMapping("/resource/{resourceId}")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getBookingsByResource(@PathVariable Long resourceId) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingsByResource(resourceId), "Resource bookings retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> getBookingById(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUser jwtUser) {
        User user = requireCurrentUser(jwtUser);
        boolean isAdmin = "ADMIN".equals(jwtUser.role().name());
        
        return ResponseEntity.ok(ApiResponse.success(bookingService.getBookingById(id, user.getEmail(), isAdmin), "Booking details retrieved successfully"));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingResponseDTO>>> getAllBookings(
            @RequestParam(required = false) BookingStatus status) {
        return ResponseEntity.ok(ApiResponse.success(bookingService.getAllBookings(status), "All bookings retrieved successfully"));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) AdminBookingActionDTO dto) {
        if (dto == null) dto = new AdminBookingActionDTO();
        return ResponseEntity.ok(ApiResponse.success(bookingService.approveBooking(id, dto), "Booking approved successfully"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> rejectBooking(
            @PathVariable Long id,
            @Valid @RequestBody AdminBookingActionDTO dto) {
        if (dto.getAdminNote() == null || dto.getAdminNote().isBlank()) {
            throw new com.smartcampus.exception.BadRequestException("Rejection reason (admin note) is required");
        }
        return ResponseEntity.ok(ApiResponse.success(bookingService.rejectBooking(id, dto), "Booking rejected successfully"));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<BookingResponseDTO>> cancelBooking(
            @PathVariable Long id,
            @AuthenticationPrincipal JwtUser jwtUser) {
        User user = requireCurrentUser(jwtUser);
        boolean isAdmin = "ADMIN".equals(jwtUser.role().name());
        
        return ResponseEntity.ok(ApiResponse.success(bookingService.cancelBooking(id, user.getEmail(), isAdmin), "Booking cancelled successfully"));
    }

    private User requireCurrentUser(JwtUser jwtUser) {
        if (jwtUser == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Login is required");
        }

        return userRepository.findById(jwtUser.id())
                .or(() -> userRepository.findByEmail(jwtUser.email()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User account was not found"));
    }
}
