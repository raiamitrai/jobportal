package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/interviews")
@RequiredArgsConstructor
public class InterviewWebController {

    private final RestTemplate restTemplate;

    @Value("${services.interview.url}")
    private String interviewServiceUrl;

    @PostMapping
    public ResponseEntity<Object> scheduleInterview(@RequestBody Object dto) {
        return restTemplate.postForEntity(interviewServiceUrl + "/interviews", dto, Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getInterviewById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(interviewServiceUrl + "/interviews/" + id, Object.class);
    }

    @GetMapping("/candidate/{candidateId}")
    public ResponseEntity<Object> getInterviewsByCandidate(@PathVariable("candidateId") Long candidateId) {
        return restTemplate.getForEntity(interviewServiceUrl + "/interviews/candidate/" + candidateId, Object.class);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Object> updateInterviewStatus(@PathVariable("id") Long id, @RequestParam("status") String status) {
        return restTemplate.exchange(interviewServiceUrl + "/interviews/" + id + "/status?status=" + status, HttpMethod.PUT, null, Object.class);
    }
}
