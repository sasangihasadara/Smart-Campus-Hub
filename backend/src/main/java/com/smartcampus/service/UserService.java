package com.smartcampus.service;

import com.smartcampus.dto.request.LoginRequest;
import com.smartcampus.dto.request.RegisterRequest;
import com.smartcampus.dto.request.UpdateProfileRequest;
import com.smartcampus.dto.response.AuthResponse;
import com.smartcampus.dto.response.UserResponse;
import com.smartcampus.enums.UserRole;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class UserService {
    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();
    private static final HttpClient HTTP_CLIENT = HttpClient.newHttpClient();
    private static final String GOOGLE_TOKEN_INFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token=";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User user = User.builder()
                .name(request.getName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .mobileNumber(clean(request.getMobileNumber()))
                .address(clean(request.getAddress()))
                .faculty(clean(request.getFaculty()))
                .campusYear(clean(request.getCampusYear()))
                .semester(clean(request.getSemester()))
                .role(UserRole.STUDENT)
                .build();

        return toAuthResponse(userRepository.save(user));
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email or password");
        }

        return toAuthResponse(user);
    }

    public AuthResponse loginForRoles(LoginRequest request, Set<UserRole> allowedRoles, String portalName) {
        AuthResponse authResponse = login(request);
        if (!allowedRoles.contains(authResponse.getUser().getRole())) {
            throw new IllegalArgumentException("This account cannot access the " + portalName + " login");
        }

        return authResponse;
    }

    public AuthResponse loginWithGoogleToken(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new IllegalArgumentException("Google sign-in token is required");
        }

        GoogleProfile profile = verifyGoogleToken(idToken.trim());
        String email = profile.email().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .map(existing -> {
                    if (existing.getRole() == UserRole.ADMIN || existing.getRole() == UserRole.TECHNICIAN) {
                        throw new IllegalArgumentException("Google sign-in is available for user accounts only");
                    }
                    return existing;
                })
                .orElseGet(() -> userRepository.save(User.builder()
                        .name(resolveDisplayName(profile))
                        .email(email)
                        .password(passwordEncoder.encode(UUID.randomUUID().toString()))
                        .picture(profile.picture())
                        .role(UserRole.STUDENT)
                        .build()));

        return toAuthResponse(user);
    }

    public UserResponse getByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(this::toUserResponse)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }

    public AuthResponse updateProfile(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        String newEmail = request.getEmail().trim().toLowerCase();

        userRepository.findByEmail(newEmail)
                .filter(existing -> !existing.getId().equals(user.getId()))
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("Email is already registered");
                });

        user.setName(request.getName().trim());
        user.setEmail(newEmail);
        user.setPicture(request.getPicture());
        user.setMobileNumber(clean(request.getMobileNumber()));
        user.setAddress(clean(request.getAddress()));
        user.setFaculty(clean(request.getFaculty()));
        user.setCampusYear(clean(request.getCampusYear()));
        user.setSemester(clean(request.getSemester()));

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            if (request.getPassword().length() < 6) {
                throw new IllegalArgumentException("Password must be at least 6 characters");
            }
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        return toAuthResponse(userRepository.save(user));
    }

    public void deleteProfile(String currentEmail) {
        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        userRepository.delete(user);
    }

    public User createFixedUser(String name, String email, String password, UserRole role) {
        String normalizedEmail = email.trim().toLowerCase();
        return userRepository.findByEmail(normalizedEmail)
                .orElseGet(() -> userRepository.save(User.builder()
                        .name(name)
                        .email(normalizedEmail)
                        .password(passwordEncoder.encode(password))
                        .role(role)
                        .build()));
    }

    private AuthResponse toAuthResponse(User user) {
        return AuthResponse.builder()
                .token(jwtService.generateToken(user.getId(), user.getEmail(), user.getRole()))
                .user(toUserResponse(user))
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .picture(user.getPicture())
                .mobileNumber(user.getMobileNumber())
                .address(user.getAddress())
                .faculty(user.getFaculty())
                .campusYear(user.getCampusYear())
                .semester(user.getSemester())
                .role(user.getRole())
                .build();
    }

    private String clean(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private GoogleProfile verifyGoogleToken(String idToken) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(GOOGLE_TOKEN_INFO_URL + idToken))
                    .GET()
                    .build();

            HttpResponse<String> response = HTTP_CLIENT.send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() != 200) {
                throw new IllegalArgumentException("Google sign-in could not be verified");
            }

            Map<String, Object> payload = OBJECT_MAPPER.readValue(response.body(), Map.class);
            Object verifiedValue = payload.get("email_verified");
            boolean emailVerified = verifiedValue instanceof Boolean bool
                    ? bool
                    : Boolean.parseBoolean(String.valueOf(verifiedValue));

            if (!emailVerified) {
                throw new IllegalArgumentException("Google account email is not verified");
            }

            String email = stringValue(payload.get("email"));
            if (email == null || email.isBlank()) {
                throw new IllegalArgumentException("Google account email is missing");
            }

            return new GoogleProfile(
                    email,
                    stringValue(payload.get("name")),
                    stringValue(payload.get("picture"))
            );
        } catch (IllegalArgumentException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new IllegalArgumentException("Google sign-in failed. Please try again.");
        }
    }

    private String stringValue(Object value) {
        return value == null ? null : String.valueOf(value).trim();
    }

    private String resolveDisplayName(GoogleProfile profile) {
        if (profile.name() != null && !profile.name().isBlank()) {
            return profile.name();
        }

        String email = profile.email();
        int atIndex = email.indexOf('@');
        return atIndex > 0 ? email.substring(0, atIndex) : email;
    }

    private record GoogleProfile(String email, String name, String picture) {
    }
}
