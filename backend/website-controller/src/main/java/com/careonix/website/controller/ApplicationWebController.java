package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/applications")
@RequiredArgsConstructor
public class ApplicationWebController {

    private final RestTemplate restTemplate;

    @Value("${services.application.url}")
    private String applicationServiceUrl;

    @PostMapping
    public ResponseEntity<Object> applyForJob(@RequestBody Object request) {
        return restTemplate.postForEntity(applicationServiceUrl + "/applications", request, Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getApplicationById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(applicationServiceUrl + "/applications/" + id, Object.class);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Object> getApplicationsByCandidate(@PathVariable("candidateId") Long candidateId) {
        return restTemplate.getForEntity(applicationServiceUrl + "/applications/candidate/" + candidateId, Object.class);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<Object> getApplicationsByJob(@PathVariable("jobId") Long jobId) {
        return restTemplate.getForEntity(applicationServiceUrl + "/applications/job/" + jobId, Object.class);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Object> updateStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return restTemplate.exchange(applicationServiceUrl + "/applications/" + id + "/status?status=" + status, HttpMethod.PUT, null, Object.class);
    }
}
