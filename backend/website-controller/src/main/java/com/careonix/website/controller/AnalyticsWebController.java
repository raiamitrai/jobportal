package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/analytics")
@RequiredArgsConstructor
public class AnalyticsWebController {

    private final RestTemplate restTemplate;

    @Value("${services.analytics.url}")
    private String analyticsServiceUrl;

    @PostMapping("/events")
    public ResponseEntity<Object> logEvent(@RequestBody Object dto) {
        return restTemplate.postForEntity(analyticsServiceUrl + "/analytics/events", dto, Object.class);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Object> getSystemDashboardMetrics() {
        return restTemplate.getForEntity(analyticsServiceUrl + "/analytics/dashboard", Object.class);
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<Object> getRecruiterAnalytics(@PathVariable("recruiterId") Long recruiterId) {
        return restTemplate.getForEntity(analyticsServiceUrl + "/analytics/recruiter/" + recruiterId, Object.class);
    }
}
