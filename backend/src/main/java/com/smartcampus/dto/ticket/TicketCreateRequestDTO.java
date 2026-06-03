package com.smartcampus.dto.ticket;

import com.smartcampus.enums.TicketCategory;
import com.smartcampus.enums.TicketPriority;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketCreateRequestDTO {

    private Long resourceId;

    @NotNull(message = "Category is required")
    private TicketCategory category;

    @Size(max = 80, message = "Location must not exceed 80 characters")
    private String location;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private TicketPriority priority;

    @NotBlank(message = "Preferred contact name is required")
    @Size(max = 120, message = "Preferred contact name must not exceed 120 characters")
    private String preferredContactName;

    @NotBlank(message = "Preferred contact email is required")
    @Email(message = "Provide a valid preferred contact email")
    @Size(max = 160, message = "Preferred contact email must not exceed 160 characters")
    private String preferredContactEmail;

    @Size(max = 30, message = "Preferred contact phone must not exceed 30 characters")
    private String preferredContactPhone;

    @NotBlank(message = "Reporter name is required")
    @Size(max = 120, message = "Reporter name must not exceed 120 characters")
    private String reporterName;

    @NotBlank(message = "Reporter email is required")
    @Email(message = "Provide a valid reporter email")
    @Size(max = 160, message = "Reporter email must not exceed 160 characters")
    private String reporterEmail;
}
