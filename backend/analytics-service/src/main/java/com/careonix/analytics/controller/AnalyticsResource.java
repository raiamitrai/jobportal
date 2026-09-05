package com.careonix.analytics.controller;

import com.careonix.analytics.dto.AnalyticsEventDto;
import com.careonix.analytics.dto.DashboardMetricsDto;
import com.careonix.analytics.dto.RecruiterAnalyticsDto;
import com.careonix.analytics.service.AnalyticsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
public class AnalyticsResource {

    private final AnalyticsService analyticsService;

    @PostMapping("/events")
    public ResponseEntity<AnalyticsEventDto> logEvent(@Valid @RequestBody AnalyticsEventDto dto) {
        return ResponseEntity.ok(analyticsService.logEvent(dto));
    }

    @GetMapping("/events/{id}")
    public ResponseEntity<AnalyticsEventDto> getEventById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(analyticsService.getEventById(id));
    }

    @GetMapping("/events/user/{userId}")
    public ResponseEntity<List<AnalyticsEventDto>> getEventsByUserId(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(analyticsService.getEventsByUserId(userId));
    }

    @GetMapping("/events/type/{eventType}")
    public ResponseEntity<List<AnalyticsEventDto>> getEventsByType(@PathVariable("eventType") String eventType) {
        return ResponseEntity.ok(analyticsService.getEventsByType(eventType));
    }

    @GetMapping("/events")
    public ResponseEntity<Page<AnalyticsEventDto>> getAllEvents(Pageable pageable) {
        return ResponseEntity.ok(analyticsService.getAllEvents(pageable));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardMetricsDto> getSystemDashboardMetrics() {
        return ResponseEntity.ok(analyticsService.getSystemDashboardMetrics());
    }

    @GetMapping("/recruiter/{recruiterId}")
    public ResponseEntity<RecruiterAnalyticsDto> getRecruiterAnalytics(@PathVariable("recruiterId") Long recruiterId) {
        return ResponseEntity.ok(analyticsService.getRecruiterAnalytics(recruiterId));
    }

    @DeleteMapping("/events/{id}")
    public ResponseEntity<Map<String, String>> deleteEvent(@PathVariable("id") Long id) {
        analyticsService.deleteEvent(id);
        Map<String, String> response = Map.of("message", "Analytics event deleted successfully");
        return ResponseEntity.ok(response);
    }
}
