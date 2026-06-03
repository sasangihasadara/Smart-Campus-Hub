package com.smartcampus.config;

import com.smartcampus.enums.UserRole;
import com.smartcampus.service.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {
    private final UserService userService;

    public DataSeeder(UserService userService) {
        this.userService = userService;
    }

    @Override
    public void run(String... args) {
        userService.createFixedUser("Admin", "admin@PAF.com", "Admin123", UserRole.ADMIN);
        userService.createFixedUser("Technician", "tech@PAF.com", "Tech@123", UserRole.TECHNICIAN);
    }
}
