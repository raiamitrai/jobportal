package com.careonix.analytics.service;

import com.careonix.analytics.dto.AnalyticsEventDto;
import com.careonix.analytics.dto.DashboardMetricsDto;
import com.careonix.analytics.dto.RecruiterAnalyticsDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AnalyticsService {

    AnalyticsEventDto logEvent(AnalyticsEventDto dto);

    AnalyticsEventDto getEventById(Long id);

    List<AnalyticsEventDto> getEventsByUserId(Long userId);

    List<AnalyticsEventDto> getEventsByType(String eventType);

    Page<AnalyticsEventDto> getAllEvents(Pageable pageable);

    DashboardMetricsDto getSystemDashboardMetrics();

    RecruiterAnalyticsDto getRecruiterAnalytics(Long recruiterId);

    void deleteEvent(Long id);
}
