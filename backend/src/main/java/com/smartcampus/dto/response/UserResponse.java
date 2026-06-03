package com.smartcampus.dto.response;

import com.smartcampus.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String picture;
    private String mobileNumber;
    private String address;
    private String faculty;
    private String campusYear;
    private String semester;
    private UserRole role;
}
