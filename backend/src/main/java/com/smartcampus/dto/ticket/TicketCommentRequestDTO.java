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
public class TicketCommentRequestDTO {

    @NotBlank(message = "Author name is required")
    @Size(max = 120, message = "Author name must not exceed 120 characters")
    private String authorName;

    @NotBlank(message = "Author email is required")
    @Email(message = "Provide a valid author email")
    @Size(max = 160, message = "Author email must not exceed 160 characters")
    private String authorEmail;

    @Size(max = 30, message = "Author role must not exceed 30 characters")
    private String authorRole;

    @NotBlank(message = "Comment message is required")
    @Size(max = 1000, message = "Comment message must not exceed 1000 characters")
    private String message;
}
