package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/jobs")
@RequiredArgsConstructor
public class JobWebController {

    private final RestTemplate restTemplate;

    @Value("${services.job.url}")
    private String jobServiceUrl;

    @PostMapping
    public ResponseEntity<Object> createJob(@RequestBody Object jobRequest) {
        return restTemplate.postForEntity(jobServiceUrl + "/jobs", jobRequest, Object.class);
    }

    @GetMapping
    public ResponseEntity<Object> getAllJobs() {
        return restTemplate.getForEntity(jobServiceUrl + "/jobs", Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getJobById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(jobServiceUrl + "/jobs/" + id, Object.class);
    }

    @GetMapping("/search")
    public ResponseEntity<Object> searchJobs(
            @RequestParam(value = "title", required = false) String title,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "salaryMin", required = false) Double salaryMin,
            @RequestParam(value = "salaryMax", required = false) Double salaryMax,
            @RequestParam(value = "experience", required = false) Integer experience) {

        StringBuilder url = new StringBuilder(jobServiceUrl + "/jobs/search?");
        if (title != null) url.append("title=").append(title).append("&");
        if (category != null) url.append("category=").append(category).append("&");
        if (location != null) url.append("location=").append(location).append("&");
        if (salaryMin != null) url.append("salaryMin=").append(salaryMin).append("&");
        if (salaryMax != null) url.append("salaryMax=").append(salaryMax).append("&");
        if (experience != null) url.append("experience=").append(experience).append("&");

        return restTemplate.getForEntity(url.toString(), Object.class);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Object> updateJob(@PathVariable("id") Long id, @RequestBody Object jobRequest) {
        HttpEntity<Object> entity = new HttpEntity<>(jobRequest);
        return restTemplate.exchange(jobServiceUrl + "/jobs/" + id, HttpMethod.PUT, entity, Object.class);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Object> deleteJob(@PathVariable("id") Long id) {
        return restTemplate.exchange(jobServiceUrl + "/jobs/" + id, HttpMethod.DELETE, null, Object.class);
    }
}
