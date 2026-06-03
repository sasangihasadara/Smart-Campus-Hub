package com.smartcampus.mapper;

import com.smartcampus.dto.BookingResponseDTO;
import com.smartcampus.model.Booking;
import org.springframework.stereotype.Component;

@Component
public class BookingMapper {

    public BookingResponseDTO toResponseDTO(Booking booking) {
        if (booking == null) {
            return null;
        }

        return BookingResponseDTO.builder()
                .id(booking.getId())
                .resourceId(booking.getResource().getId())
                .resourceName(booking.getResource().getName())
                .resourceLocation(booking.getResource().getLocation())
                .userId(booking.getUserId())
                .userName(booking.getUserName())
                .date(booking.getDate())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .purpose(booking.getPurpose())
                .expectedAttendees(booking.getExpectedAttendees())
                .status(booking.getStatus().name())
                .adminNote(booking.getAdminNote())
                .createdAt(booking.getCreatedAt())
                .updatedAt(booking.getUpdatedAt())
                .build();
    }
}
