package com.smartcampus.service;

import com.smartcampus.dto.AdminBookingActionDTO;
import com.smartcampus.dto.BookingRequestDTO;
import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.enums.BookingStatus;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ForbiddenException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.mapper.BookingMapper;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final ResourceRepository resourceRepository;
    private final BookingMapper bookingMapper;
    private final NotificationService notificationService;

    @Transactional
    public BookingResponseDTO createBooking(BookingRequestDTO dto, String userId, String userName) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + dto.getResourceId()));

        if (resource.getStatus() == ResourceStatus.OUT_OF_SERVICE) {
            throw new BadRequestException("Resource is not available for booking");
        }

        if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().equals(dto.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        boolean hasConflict = bookingRepository.existsConflictingBooking(
                dto.getResourceId(),
                dto.getDate(),
                dto.getStartTime(),
                dto.getEndTime()
        );

        if (hasConflict) {
            throw new BadRequestException("This resource is already booked for the selected time slot");
        }

        Booking booking = Booking.builder()
                .resource(resource)
                .userId(userId)
                .userName(userName)
                .date(dto.getDate())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .expectedAttendees(dto.getExpectedAttendees())
                .status(BookingStatus.PENDING)
                .build();

        Booking savedBooking = bookingRepository.save(booking);
        return bookingMapper.toResponseDTO(savedBooking);
    }

    public List<BookingResponseDTO> getMyBookings(String userId) {
        return bookingRepository.findByUserId(userId).stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getMyBookingsByStatus(String userId, BookingStatus status) {
        List<Booking> bookings;
        if (status == null) {
            bookings = bookingRepository.findByUserId(userId);
        } else {
            bookings = bookingRepository.findByUserIdAndStatus(userId, status);
        }
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getBookingsByResource(Long resourceId) {
        return bookingRepository.findByResourceId(resourceId).stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getAllBookings(BookingStatus status) {
        List<Booking> bookings;
        if (status == null) {
            bookings = bookingRepository.findAll();
        } else {
            bookings = bookingRepository.findByStatus(status);
        }
        return bookings.stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public List<BookingResponseDTO> getPendingBookings() {
        return bookingRepository.findByStatus(BookingStatus.PENDING).stream()
                .map(bookingMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    public BookingResponseDTO getBookingById(Long id, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to view this booking");
        }

        return bookingMapper.toResponseDTO(booking);
    }

    @Transactional
    public BookingResponseDTO approveBooking(Long id, AdminBookingActionDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        if (dto.getAdminNote() != null) {
            booking.setAdminNote(dto.getAdminNote());
        }

        Booking savedBooking = bookingRepository.save(booking);
        notificationService.createBookingStatusNotification(
                savedBooking.getUserId(),
                savedBooking.getResource().getName(),
                savedBooking.getStatus().name(),
                savedBooking.getAdminNote()
        );
        return bookingMapper.toResponseDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO rejectBooking(Long id, AdminBookingActionDTO dto) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setAdminNote(dto.getAdminNote());

        Booking savedBooking = bookingRepository.save(booking);
        notificationService.createBookingStatusNotification(
                savedBooking.getUserId(),
                savedBooking.getResource().getName(),
                savedBooking.getStatus().name(),
                savedBooking.getAdminNote()
        );
        return bookingMapper.toResponseDTO(savedBooking);
    }

    @Transactional
    public BookingResponseDTO cancelBooking(Long id, String userId, boolean isAdmin) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + id));

        if (!isAdmin && !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("You do not have permission to cancel this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.APPROVED) {
            throw new BadRequestException("Only PENDING or APPROVED bookings can be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingMapper.toResponseDTO(bookingRepository.save(booking));
    }
}
