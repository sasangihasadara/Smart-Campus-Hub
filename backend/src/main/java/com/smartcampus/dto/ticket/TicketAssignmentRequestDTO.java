package com.smartcampus.dto.ticket;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TicketAssignmentRequestDTO {

    @NotBlank(message = "Technician id is required")
    @Size(max = 120, message = "Technician id must not exceed 120 characters")
    private String assignedTo;

    @NotBlank(message = "Technician name is required")
    @Size(max = 120, message = "Technician name must not exceed 120 characters")
    private String assignedToName;

    @NotBlank(message = "Technician email is required")
    @Email(message = "Provide a valid technician email")
    @Size(max = 160, message = "Technician email must not exceed 160 characters")
    private String assignedToEmail;

    @NotBlank(message = "Actor role is required")
    @Size(max = 30, message = "Actor role must not exceed 30 characters")
    private String actorRole;
}
