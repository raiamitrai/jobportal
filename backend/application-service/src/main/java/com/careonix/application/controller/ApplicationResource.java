package com.careonix.application.controller;

import com.careonix.application.dto.ApplicationRequestDto;
import com.careonix.application.dto.ApplicationResponseDto;
import com.careonix.application.dto.StatusUpdateRequestDto;
import com.careonix.application.service.ApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/applications")
@RequiredArgsConstructor
public class ApplicationResource {

    private final ApplicationService applicationService;

    @PostMapping
    public ResponseEntity<ApplicationResponseDto> submitApplication(@Valid @RequestBody ApplicationRequestDto dto) {
        return ResponseEntity.ok(applicationService.submitApplication(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApplicationResponseDto> getApplicationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(applicationService.getById(id));
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Page<ApplicationResponseDto>> getApplicationsByCandidate(@PathVariable("candidateId") Long candidateId,
                                                                                       @RequestParam(defaultValue = "0") int page,
                                                                                       @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(applicationService.getByCandidate(candidateId, pageable));
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Page<ApplicationResponseDto>> getApplicationsByJob(@PathVariable("jobId") Long jobId,
                                                                             @RequestParam(defaultValue = "0") int page,
                                                                             @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        return ResponseEntity.ok(applicationService.getByJob(jobId, pageable));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApplicationResponseDto> updateStatus(
            @PathVariable("id") Long id,
            @Valid @RequestBody StatusUpdateRequestDto dto) {
        return ResponseEntity.ok(applicationService.updateStatus(id, dto.getStatus()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> withdrawApplication(@PathVariable("id") Long id) {
        applicationService.withdrawApplication(id);
        Map<String, String> response = Map.of("message", "Application withdrawn successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/job/{jobId}/count")
    public ResponseEntity<Map<String, Object>> countApplicationsByJob(@PathVariable("jobId") Long jobId) {
        int count = applicationService.countByJob(jobId);
        return ResponseEntity.ok(Map.of("jobId", jobId, "applicationCount", count));
    }
}
