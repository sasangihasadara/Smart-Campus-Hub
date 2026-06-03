package com.smartcampus.service;

import java.time.Duration;
import java.time.LocalTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.smartcampus.dto.resource.ResourceRequestDTO;
import com.smartcampus.dto.resource.ResourceResponseDTO;
import com.smartcampus.dto.resource.ResourceStatusUpdateDTO;
import com.smartcampus.dto.resource.ResourceSummaryDTO;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.exception.ResourceConflictException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class ResourceService {

    private static final long MINIMUM_AVAILABILITY_MINUTES = 30;

    private final ResourceRepository resourceRepository;

    public List<ResourceResponseDTO> getAllResources(
            String search,
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity) {
        validateCapacityRange(minCapacity, maxCapacity);

        Specification<Resource> specification = buildSpecification(search, type, status, location, minCapacity, maxCapacity);
        return resourceRepository.findAll(specification).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public ResourceResponseDTO getById(Long id) {
        return mapToResponse(findResource(id));
    }

    public ResourceResponseDTO create(ResourceRequestDTO request) {
        validateBusinessRules(request);

        if (resourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCase(
                request.getName().trim(),
                request.getLocation().trim())) {
            throw new ResourceConflictException("A resource with the same name and location already exists");
        }

        Resource resource = mapToEntity(request, new Resource());
        return mapToResponse(resourceRepository.save(resource));
    }

    public ResourceResponseDTO update(Long id, ResourceRequestDTO request) {
        validateBusinessRules(request);

        if (resourceRepository.existsByNameIgnoreCaseAndLocationIgnoreCaseAndIdNot(
                request.getName().trim(),
                request.getLocation().trim(),
                id)) {
            throw new ResourceConflictException("A resource with the same name and location already exists");
        }

        Resource existing = findResource(id);
        return mapToResponse(resourceRepository.save(mapToEntity(request, existing)));
    }

    public ResourceResponseDTO updateStatus(Long id, ResourceStatusUpdateDTO request) {
        Resource existing = findResource(id);
        existing.setStatus(request.getStatus());

        if (request.getNote() != null && !request.getNote().isBlank()) {
            existing.setDescription(request.getNote().trim());
        }

        return mapToResponse(resourceRepository.save(existing));
    }

    public void delete(Long id) {
        Resource existing = findResource(id);

        if (resourceRepository.hasAssociatedTickets(id)) {
            throw new IllegalArgumentException("Cannot delete resource as it has associated tickets. Remove or reassign tickets first.");
        }

        resourceRepository.delete(existing);
    }

    @Transactional(readOnly = true)
    public ResourceSummaryDTO getSummary() {
        List<Resource> resources = resourceRepository.findAll();

        Map<String, Long> resourcesByType = new LinkedHashMap<>();
        for (ResourceType resourceType : ResourceType.values()) {
            long count = resources.stream().filter(resource -> resource.getType() == resourceType).count();
            resourcesByType.put(resourceType.name(), count);
        }

        return ResourceSummaryDTO.builder()
                .totalResources(resources.size())
                .activeResources(resources.stream().filter(resource -> resource.getStatus() == ResourceStatus.ACTIVE).count())
                .outOfServiceResources(resources.stream().filter(resource -> resource.getStatus() == ResourceStatus.OUT_OF_SERVICE).count())
                .maintenanceResources(resources.stream().filter(resource -> resource.getStatus() == ResourceStatus.MAINTENANCE).count())
                .resourcesByType(resourcesByType)
                .build();
    }

    private Resource findResource(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found for id " + id));
    }

    private Resource mapToEntity(ResourceRequestDTO request, Resource resource) {
        resource.setName(request.getName().trim());
        resource.setType(request.getType());
        resource.setCapacity(request.getCapacity());
        resource.setLocation(request.getLocation().trim());
        resource.setStatus(request.getStatus());
        resource.setAvailFrom(request.getAvailFrom());
        resource.setAvailUntil(request.getAvailUntil());
        resource.setDescription(request.getDescription() == null ? "" : request.getDescription().trim());
        return resource;
    }

    private ResourceResponseDTO mapToResponse(Resource resource) {
        return ResourceResponseDTO.builder()
                .id(resource.getId())
                .name(resource.getName())
                .type(resource.getType())
                .capacity(resource.getCapacity())
                .location(resource.getLocation())
                .status(resource.getStatus())
                .availFrom(resource.getAvailFrom())
                .availUntil(resource.getAvailUntil())
                .description(resource.getDescription())
                .createdAt(resource.getCreatedAt())
                .updatedAt(resource.getUpdatedAt())
                .build();
    }

    private void validateBusinessRules(ResourceRequestDTO request) {
        validateAvailability(request.getAvailFrom(), request.getAvailUntil());
        validateTypeCapacity(request.getType(), request.getCapacity());

        if (request.getStatus() == ResourceStatus.OUT_OF_SERVICE
                && (request.getDescription() == null || request.getDescription().trim().isEmpty())) {
            throw new IllegalArgumentException("Provide a short description when a resource is out of service");
        }
    }

    private void validateAvailability(LocalTime availFrom, LocalTime availUntil) {
        if (!availUntil.isAfter(availFrom)) {
            throw new IllegalArgumentException("Availability end time must be later than start time");
        }

        if (Duration.between(availFrom, availUntil).toMinutes() < MINIMUM_AVAILABILITY_MINUTES) {
            throw new IllegalArgumentException("Availability window must be at least 30 minutes");
        }
    }

    private void validateTypeCapacity(ResourceType type, Integer capacity) {
        int min;
        int max;

        switch (type) {
            case LECTURE_HALL -> {
                min = 20;
                max = 500;
            }
            case LAB -> {
                min = 10;
                max = 120;
            }
            case MEETING_ROOM -> {
                min = 2;
                max = 50;
            }
            case EQUIPMENT -> {
                min = 1;
                max = 20;
            }
            default -> throw new IllegalArgumentException("Unsupported resource type");
        }

        if (capacity < min || capacity > max) {
            throw new IllegalArgumentException(
                    "Capacity for " + type.name().toLowerCase(Locale.ROOT).replace('_', ' ')
                            + " must be between " + min + " and " + max);
        }
    }

    private void validateCapacityRange(Integer minCapacity, Integer maxCapacity) {
        if (minCapacity != null && minCapacity < 1) {
            throw new IllegalArgumentException("Minimum capacity must be greater than zero");
        }

        if (maxCapacity != null && maxCapacity < 1) {
            throw new IllegalArgumentException("Maximum capacity must be greater than zero");
        }

        if (minCapacity != null && maxCapacity != null && minCapacity > maxCapacity) {
            throw new IllegalArgumentException("Minimum capacity cannot be greater than maximum capacity");
        }
    }

    private Specification<Resource> buildSpecification(
            String search,
            ResourceType type,
            ResourceStatus status,
            String location,
            Integer minCapacity,
            Integer maxCapacity) {
        return (root, query, criteriaBuilder) -> {
            Predicate predicate = criteriaBuilder.conjunction();

            if (search != null && !search.isBlank()) {
                String searchValue = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), searchValue),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")), searchValue),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), searchValue)));
            }

            if (type != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("type"), type));
            }

            if (status != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.equal(root.get("status"), status));
            }

            if (location != null && !location.isBlank()) {
                predicate = criteriaBuilder.and(predicate,
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("location")),
                                "%" + location.trim().toLowerCase(Locale.ROOT) + "%"));
            }

            if (minCapacity != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.greaterThanOrEqualTo(root.get("capacity"), minCapacity));
            }

            if (maxCapacity != null) {
                predicate = criteriaBuilder.and(predicate, criteriaBuilder.lessThanOrEqualTo(root.get("capacity"), maxCapacity));
            }

            query.orderBy(criteriaBuilder.asc(root.get("name")));
            return predicate;
        };
    }
}
