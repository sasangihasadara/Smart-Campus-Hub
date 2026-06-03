package com.smartcampus.controller;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.dto.resource.ResourceSummaryDTO;
import com.smartcampus.exception.GlobalExceptionHandler;
import com.smartcampus.service.ResourceService;

@ExtendWith(MockitoExtension.class)
class ResourceControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        ResourceController controller = new ResourceController(resourceService);
        LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
        validator.afterPropertiesSet();

        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .setValidator(validator)
                .build();
    }

    @Test
    void createResourceShouldReturnBadRequestWhenValidationFails() throws Exception {
        String payload = """
                {
                  "name": "",
                  "type": "LAB",
                  "capacity": 0,
                  "location": "",
                  "status": "ACTIVE",
                  "availFrom": "08:00:00",
                  "availUntil": "09:00:00",
                  "description": ""
                }
                """;

        mockMvc.perform(post("/api/resources")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.name").exists())
                .andExpect(jsonPath("$.data.location").exists());
    }

    @Test
    void getSummaryShouldReturnWrappedPayload() throws Exception {
        ResourceSummaryDTO summary = ResourceSummaryDTO.builder()
                .totalResources(4)
                .activeResources(2)
                .outOfServiceResources(1)
                .maintenanceResources(1)
                .resourcesByType(Map.of("LAB", 2L))
                .build();

        when(resourceService.getSummary()).thenReturn(summary);

        mockMvc.perform(get("/api/resources/summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalResources").value(4))
                .andExpect(jsonPath("$.data.resourcesByType.LAB").value(2));
    }
}
