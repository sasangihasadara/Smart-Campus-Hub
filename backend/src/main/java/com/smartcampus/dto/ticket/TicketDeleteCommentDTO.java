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
public class TicketDeleteCommentDTO {

    @NotBlank(message = "Actor email is required")
    @Email(message = "Provide a valid actor email")
    @Size(max = 160, message = "Actor email must not exceed 160 characters")
    private String actorEmail;

    @Size(max = 30, message = "Actor role must not exceed 30 characters")
    private String actorRole;
}
