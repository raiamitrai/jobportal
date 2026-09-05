package com.careonix.analytics.service;

import com.careonix.analytics.dto.AnalyticsEventDto;
import com.careonix.analytics.dto.DashboardMetricsDto;
import com.careonix.analytics.dto.RecruiterAnalyticsDto;
import com.careonix.analytics.entity.AnalyticsEvent;
import com.careonix.analytics.exception.AnalyticsNotFoundException;
import com.careonix.analytics.repository.AnalyticsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AnalyticsServiceImplTest {

    @Mock
    private AnalyticsRepository analyticsRepository;

    @InjectMocks
    private AnalyticsServiceImpl analyticsService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void logEvent_success() {
        AnalyticsEventDto dto = AnalyticsEventDto.builder()
                .eventType("JOB_VIEW")
                .userId(101L)
                .targetId(501L)
                .eventData("Viewed Software Developer Job")
                .timestamp(LocalDateTime.now())
                .build();

        AnalyticsEvent saved = AnalyticsEvent.builder()
                .eventId(1L)
                .eventType("JOB_VIEW")
                .userId(101L)
                .targetId(501L)
                .eventData("Viewed Software Developer Job")
                .timestamp(LocalDateTime.now())
                .build();

        when(analyticsRepository.save(any(AnalyticsEvent.class))).thenReturn(saved);

        AnalyticsEventDto result = analyticsService.logEvent(dto);

        assertNotNull(result);
        assertEquals(1L, result.getEventId());
        assertEquals("JOB_VIEW", result.getEventType());
        verify(analyticsRepository, times(1)).save(any(AnalyticsEvent.class));
    }

    @Test
    void getEventById_found() {
        Long id = 1L;
        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventId(id)
                .eventType("JOB_VIEW")
                .userId(101L)
                .targetId(501L)
                .timestamp(LocalDateTime.now())
                .build();

        when(analyticsRepository.findById(id)).thenReturn(Optional.of(event));

        AnalyticsEventDto response = analyticsService.getEventById(id);

        assertNotNull(response);
        assertEquals(id, response.getEventId());
    }

    @Test
    void getEventById_notFound() {
        Long id = 99L;
        when(analyticsRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(AnalyticsNotFoundException.class, () -> analyticsService.getEventById(id));
    }

    @Test
    void getSystemDashboardMetrics_success() {
        when(analyticsRepository.count()).thenReturn(100L);
        when(analyticsRepository.countByEventTypeIgnoreCase("JOB_VIEW")).thenReturn(50L);
        when(analyticsRepository.countByEventTypeIgnoreCase("APPLICATION_SUBMITTED")).thenReturn(20L);
        when(analyticsRepository.countByEventTypeIgnoreCase("INTERVIEW_SCHEDULED")).thenReturn(10L);
        when(analyticsRepository.countByEventTypeIgnoreCase("SUBSCRIPTION_PURCHASED")).thenReturn(5L);
        when(analyticsRepository.countByEventTypeIgnoreCase("USER_REGISTERED")).thenReturn(15L);

        DashboardMetricsDto metrics = analyticsService.getSystemDashboardMetrics();

        assertNotNull(metrics);
        assertEquals(100L, metrics.getTotalEvents());
        assertEquals(50L, metrics.getTotalJobViews());
        assertEquals(20L, metrics.getTotalApplicationsSubmitted());
    }

    @Test
    void getRecruiterAnalytics_success() {
        Long recruiterId = 201L;
        when(analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("JOB_VIEW", recruiterId)).thenReturn(30L);
        when(analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("APPLICATION_SUBMITTED", recruiterId)).thenReturn(12L);
        when(analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("INTERVIEW_SCHEDULED", recruiterId)).thenReturn(5L);

        RecruiterAnalyticsDto dto = analyticsService.getRecruiterAnalytics(recruiterId);

        assertNotNull(dto);
        assertEquals(recruiterId, dto.getRecruiterId());
        assertEquals(30L, dto.getTotalJobViews());
        assertEquals(12L, dto.getTotalApplicationsReceived());
    }

    @Test
    void deleteEvent_exists() {
        Long id = 1L;
        when(analyticsRepository.existsById(id)).thenReturn(true);
        doNothing().when(analyticsRepository).deleteById(id);

        analyticsService.deleteEvent(id);

        verify(analyticsRepository, times(1)).deleteById(id);
    }

    @Test
    void getAllEvents_paginated() {
        Pageable pageable = mock(Pageable.class);
        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventId(1L)
                .eventType("JOB_VIEW")
                .userId(101L)
                .timestamp(LocalDateTime.now())
                .build();

        Page<AnalyticsEvent> page = new PageImpl<>(List.of(event));
        when(analyticsRepository.findAll(pageable)).thenReturn(page);

        Page<AnalyticsEventDto> result = analyticsService.getAllEvents(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
