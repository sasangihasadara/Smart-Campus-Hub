package com.smartcampus.controller;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateProfileRequest;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.enums.UserRole;
import com.smartcampus.security.JwtService;
import com.smartcampus.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.register(request), "Registration successful"));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(userService.login(request), "Login successful"));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<ApiResponse<AuthResponse>> adminLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.loginForRoles(request, Set.of(UserRole.ADMIN), "admin"),
                "Admin login successful"
        ));
    }

    @PostMapping("/technician/login")
    public ResponseEntity<ApiResponse<AuthResponse>> technicianLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.loginForRoles(request, Set.of(UserRole.TECHNICIAN), "technician"),
                "Technician login successful"
        ));
    }

    @PostMapping("/user/login")
    public ResponseEntity<ApiResponse<AuthResponse>> userLogin(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.loginForRoles(request, Set.of(UserRole.STUDENT, UserRole.FACULTY, UserRole.STAFF), "user"),
                "User login successful"
        ));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<AuthResponse>> googleLogin(@RequestBody Map<String, String> request) {
        return ResponseEntity.ok(ApiResponse.success(
                userService.loginWithGoogleToken(request.get("idToken")),
                "Google login successful"
        ));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtUser jwtUser)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        return ResponseEntity.ok(ApiResponse.success(userService.getByEmail(jwtUser.email()), "Current user loaded"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<AuthResponse>> updateMe(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtUser jwtUser)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        return ResponseEntity.ok(ApiResponse.success(
                userService.updateProfile(jwtUser.email(), request),
                "Profile updated"
        ));
    }

    @DeleteMapping("/me")
    public ResponseEntity<ApiResponse<Void>> deleteMe(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtService.JwtUser jwtUser)) {
            return ResponseEntity.status(401).body(ApiResponse.error("Authentication required"));
        }

        userService.deleteProfile(jwtUser.email());
        return ResponseEntity.ok(ApiResponse.success(null, "Profile deleted"));
    }
}
