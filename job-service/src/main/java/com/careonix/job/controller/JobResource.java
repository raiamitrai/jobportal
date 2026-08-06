package com.careonix.job.controller;

import com.careonix.job.dto.JobRequestDto;
import com.careonix.job.dto.JobResponseDto;
import com.careonix.job.service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs")
@RequiredArgsConstructor
public class JobResource {

    private final JobService jobService;

    @PostMapping
    public ResponseEntity<JobResponseDto> createJob(@Valid @RequestBody JobRequestDto dto) {
        return ResponseEntity.ok(jobService.addJob(dto));
    }

    @GetMapping
    public ResponseEntity<List<JobResponseDto>> getAllJobs() {
        return ResponseEntity.ok(jobService.getAllJobs());
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDto> getJobById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(jobService.getJobById(id));
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<List<JobResponseDto>> getJobsByRecruiter(@PathVariable("recruiterId") Long recruiterId) {
        return ResponseEntity.ok(jobService.getJobsByPostedBy(recruiterId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobResponseDto>> searchJobs(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "salaryMin", required = false) Double salaryMin,
            @RequestParam(value = "salaryMax", required = false) Double salaryMax,
            @RequestParam(value = "experience", required = false) Integer experience) {
        return ResponseEntity.ok(jobService.searchJobs(title, category, location, salaryMin, salaryMax, experience));
    }

    @PutMapping("/{id}")
    public ResponseEntity<JobResponseDto> updateJob(@PathVariable("id") Long id, @Valid @RequestBody JobRequestDto dto) {
        return ResponseEntity.ok(jobService.updateJob(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteJob(@PathVariable("id") Long id) {
        jobService.deleteJob(id);
        Map<String, String> response = Map.of("message", "Job listing deleted successfully");
        return ResponseEntity.ok(response);
    }
}

