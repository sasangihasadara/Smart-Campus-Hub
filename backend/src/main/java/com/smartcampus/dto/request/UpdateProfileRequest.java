package com.smartcampus.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    private String password;

    private String picture;

    @Pattern(regexp = "\\d{10}", message = "Mobile number must be exactly 10 digits")
    @NotBlank
    private String mobileNumber;

    @NotBlank
    private String address;

    @NotBlank
    private String faculty;

    @NotBlank
    private String campusYear;

    @NotBlank
    private String semester;
}
