package com.smartcampus.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalTime;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.smartcampus.dto.resource.ResourceRequestDTO;
import com.smartcampus.dto.resource.ResourceStatusUpdateDTO;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    private ResourceService resourceService;

    @BeforeEach
    void setUp() {
        resourceService = new ResourceService(resourceRepository);
    }

    @Test
    void createResourceShouldRejectDuplicateNameAndLocation() {
        ResourceRequestDTO request = validRequest();
        when(resourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCase("Lab 101", "Block A, Level 2"))
                .thenReturn(true);

        assertThrows(ResourceConflictException.class, () -> resourceService.create(request));
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void createResourceShouldRejectInvalidAvailabilityWindow() {
        ResourceRequestDTO request = validRequest();
        request.setAvailFrom(LocalTime.of(10, 0));
        request.setAvailUntil(LocalTime.of(10, 20));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> resourceService.create(request));
        assertTrue(exception.getMessage().contains("Availability window"));
        verify(resourceRepository, never()).save(any(Resource.class));
    }

    @Test
    void createResourceShouldPersistTrimmedFields() {
        ResourceRequestDTO request = validRequest();
        request.setName("  Lab 101  ");
        request.setLocation("  Block A, Level 2  ");

        Resource saved = new Resource();
        saved.setId(11L);
        saved.setName("Lab 101");
        saved.setLocation("Block A, Level 2");
        saved.setType(ResourceType.LAB);
        saved.setCapacity(40);
        saved.setStatus(ResourceStatus.ACTIVE);
        saved.setAvailFrom(LocalTime.of(8, 0));
        saved.setAvailUntil(LocalTime.of(16, 0));
        saved.setDescription("Windows lab");

        when(resourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCase("Lab 101", "Block A, Level 2"))
                .thenReturn(false);
        when(resourceRepository.save(any(Resource.class))).thenReturn(saved);

        resourceService.create(request);

        ArgumentCaptor<Resource> resourceCaptor = ArgumentCaptor.forClass(Resource.class);
        verify(resourceRepository).save(resourceCaptor.capture());
        assertEquals("Lab 101", resourceCaptor.getValue().getName());
        assertEquals("Block A, Level 2", resourceCaptor.getValue().getLocation());
    }

    @Test
    void updateStatusShouldThrowWhenResourceMissing() {
        when(resourceRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> resourceService.updateStatus(999L, new ResourceStatusUpdateDTO(ResourceStatus.MAINTENANCE, "Needs inspection")));
    }

    private ResourceRequestDTO validRequest() {
        return ResourceRequestDTO.builder()
                .name("Lab 101")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Block A, Level 2")
                .status(ResourceStatus.ACTIVE)
                .availFrom(LocalTime.of(8, 0))
                .availUntil(LocalTime.of(16, 0))
                .description("Windows lab")
                .build();
    }
}
