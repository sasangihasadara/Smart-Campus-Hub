package com.smartcampus.model;

import com.smartcampus.enums.UserRole;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String picture;

    private String mobileNumber;

    private String address;

    private String faculty;

    private String campusYear;

    private String semester;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;
}
