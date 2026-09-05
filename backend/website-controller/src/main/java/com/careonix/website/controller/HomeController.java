package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/web")
@RequiredArgsConstructor
public class HomeController {

    private final RestTemplate restTemplate;

    @Value("${services.job.url}")
    private String jobServiceUrl;

    @Value("${services.profile.url}")
    private String profileServiceUrl;

    @Value("${services.application.url}")
    private String applicationServiceUrl;

    @Value("${services.interview.url}")
    private String interviewServiceUrl;

    @Value("${services.notification.url}")
    private String notificationServiceUrl;

    @Value("${services.subscription.url}")
    private String subscriptionServiceUrl;

    @Value("${services.analytics.url}")
    private String analyticsServiceUrl;

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> getSystemHealth() {
        Map<String, String> healthStatus = new HashMap<>();
        healthStatus.put("website-controller", "UP (Port 8080)");
        healthStatus.put("job-service", checkServiceHealth(jobServiceUrl));
        healthStatus.put("profile-service", checkServiceHealth(profileServiceUrl));
        healthStatus.put("application-service", checkServiceHealth(applicationServiceUrl));
        healthStatus.put("interview-service", checkServiceHealth(interviewServiceUrl));
        healthStatus.put("notification-service", checkServiceHealth(notificationServiceUrl));
        healthStatus.put("subscription-service", checkServiceHealth(subscriptionServiceUrl));
        healthStatus.put("analytics-service", checkServiceHealth(analyticsServiceUrl));

        return ResponseEntity.ok(healthStatus);
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getAggregatedDashboard() {
        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("portalName", "Careonix Job Portal Platform");
        dashboard.put("version", "1.0.0");
        dashboard.put("activeServicesCount", 8);
        dashboard.put("status", "OPERATIONAL");

        return ResponseEntity.ok(dashboard);
    }

    private String checkServiceHealth(String serviceUrl) {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(serviceUrl + "/actuator/health", String.class);
            return response.getStatusCode().is2xxSuccessful() ? "UP" : "DOWN";
        } catch (Exception e) {
            return "UNKNOWN (Configured at " + serviceUrl + ")";
        }
    }
}
