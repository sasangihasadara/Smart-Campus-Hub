package com.smartcampus.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.smartcampus.dto.resource.ResourceRequestDTO;
import com.smartcampus.dto.resource.ResourceResponseDTO;
import com.smartcampus.dto.resource.ResourceStatusUpdateDTO;
import com.smartcampus.dto.resource.ResourceSummaryDTO;
import com.smartcampus.dto.response.ApiResponse;
import com.smartcampus.enums.ResourceStatus;
import com.smartcampus.enums.ResourceType;
import com.smartcampus.service.ResourceService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponseDTO>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ResourceType type,
            @RequestParam(required = false) ResourceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity,
            @RequestParam(required = false) Integer maxCapacity) {
        return ResponseEntity.ok(ApiResponse.success(
                resourceService.getAllResources(search, type, status, location, minCapacity, maxCapacity),
                "Resources retrieved successfully"));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ResourceSummaryDTO>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getSummary(), "Resource summary retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.getById(id), "Resource retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> create(@Valid @RequestBody ResourceRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(resourceService.create(request), "Resource created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ResourceRequestDTO request) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.update(id, request), "Resource updated successfully"));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ResourceResponseDTO>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ResourceStatusUpdateDTO request) {
        return ResponseEntity.ok(ApiResponse.success(resourceService.updateStatus(id, request), "Resource status updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(null, "Resource deleted successfully"));
    }
}
