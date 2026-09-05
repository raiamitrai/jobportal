package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/profiles")
@RequiredArgsConstructor
public class ProfileWebController {

    private final RestTemplate restTemplate;

    @Value("${services.profile.url}")
    private String profileServiceUrl;

    @PostMapping("/candidate")
    public ResponseEntity<Object> createCandidateProfile(@RequestBody Object dto) {
        return restTemplate.postForEntity(profileServiceUrl + "/profiles/candidate", dto, Object.class);
    }

    @PostMapping("/recruiter")
    public ResponseEntity<Object> createRecruiterProfile(@RequestBody Object dto) {
        return restTemplate.postForEntity(profileServiceUrl + "/profiles/recruiter", dto, Object.class);
    }

    @GetMapping
    public ResponseEntity<Object> getAllProfiles() {
        return restTemplate.getForEntity(profileServiceUrl + "/profiles", Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getProfileById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(profileServiceUrl + "/profiles/" + id, Object.class);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateProfile(@PathVariable("id") Long id, @RequestBody Object updates) {
        HttpEntity<Object> entity = new HttpEntity<>(updates);
        return restTemplate.exchange(profileServiceUrl + "/profiles/" + id, HttpMethod.PUT, entity, Object.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteProfile(@PathVariable("id") Long id) {
        return restTemplate.exchange(profileServiceUrl + "/profiles/" + id, HttpMethod.DELETE, null, Object.class);
    }
}
