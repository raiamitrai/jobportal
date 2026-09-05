package com.careonix.analytics.service;

import com.careonix.analytics.dto.AnalyticsEventDto;
import com.careonix.analytics.dto.DashboardMetricsDto;
import com.careonix.analytics.dto.RecruiterAnalyticsDto;
import com.careonix.analytics.entity.AnalyticsEvent;
import com.careonix.analytics.exception.AnalyticsNotFoundException;
import com.careonix.analytics.repository.AnalyticsRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private static final Logger log = LoggerFactory.getLogger(AnalyticsServiceImpl.class);

    private final AnalyticsRepository analyticsRepository;

    @Override
    @Transactional
    public AnalyticsEventDto logEvent(AnalyticsEventDto dto) {
        log.info("Logging analytics event: {} for userId: {}", dto.getEventType(), dto.getUserId());

        AnalyticsEvent event = AnalyticsEvent.builder()
                .eventType(dto.getEventType().toUpperCase())
                .userId(dto.getUserId())
                .targetId(dto.getTargetId())
                .eventData(dto.getEventData())
                .timestamp(dto.getTimestamp() != null ? dto.getTimestamp() : LocalDateTime.now())
                .build();

        AnalyticsEvent saved = analyticsRepository.save(event);
        log.info("Analytics event saved with ID: {}", saved.getEventId());

        return mapToDto(saved);
    }

    @Override
    public AnalyticsEventDto getEventById(Long id) {
        log.info("Fetching analytics event by ID: {}", id);
        AnalyticsEvent event = analyticsRepository.findById(id)
                .orElseThrow(() -> new AnalyticsNotFoundException("Analytics event not found with ID: " + id));
        return mapToDto(event);
    }

    @Override
    public List<AnalyticsEventDto> getEventsByUserId(Long userId) {
        log.info("Fetching analytics events for userId: {}", userId);
        return analyticsRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AnalyticsEventDto> getEventsByType(String eventType) {
        log.info("Fetching analytics events by type: {}", eventType);
        return analyticsRepository.findByEventTypeIgnoreCase(eventType).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<AnalyticsEventDto> getAllEvents(Pageable pageable) {
        log.info("Fetching paginated analytics events");
        return analyticsRepository.findAll(pageable)
                .map(this::mapToDto);
    }

    @Override
    public DashboardMetricsDto getSystemDashboardMetrics() {
        log.info("Calculating system dashboard metrics");

        long totalEvents = analyticsRepository.count();
        long totalJobViews = analyticsRepository.countByEventTypeIgnoreCase("JOB_VIEW");
        long totalAppsSubmitted = analyticsRepository.countByEventTypeIgnoreCase("APPLICATION_SUBMITTED");
        long totalInterviews = analyticsRepository.countByEventTypeIgnoreCase("INTERVIEW_SCHEDULED");
        long totalSubs = analyticsRepository.countByEventTypeIgnoreCase("SUBSCRIPTION_PURCHASED");
        long totalUsers = analyticsRepository.countByEventTypeIgnoreCase("USER_REGISTERED");

        return DashboardMetricsDto.builder()
                .totalEvents(totalEvents)
                .totalJobViews(totalJobViews)
                .totalApplicationsSubmitted(totalAppsSubmitted)
                .totalInterviewsScheduled(totalInterviews)
                .totalSubscriptionsPurchased(totalSubs)
                .totalUsersRegistered(totalUsers)
                .build();
    }

    @Override
    public RecruiterAnalyticsDto getRecruiterAnalytics(Long recruiterId) {
        log.info("Calculating recruiter analytics for recruiterId: {}", recruiterId);

        long jobViews = analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("JOB_VIEW", recruiterId);
        long appsReceived = analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("APPLICATION_SUBMITTED", recruiterId);
        long interviews = analyticsRepository.countByEventTypeIgnoreCaseAndTargetId("INTERVIEW_SCHEDULED", recruiterId);

        return RecruiterAnalyticsDto.builder()
                .recruiterId(recruiterId)
                .totalJobViews(jobViews)
                .totalApplicationsReceived(appsReceived)
                .interviewsScheduled(interviews)
                .build();
    }

    @Override
    @Transactional
    public void deleteEvent(Long id) {
        log.info("Deleting analytics event ID: {}", id);
        if (!analyticsRepository.existsById(id)) {
            log.warn("Attempted to delete non-existent analytics event ID: {}", id);
            throw new AnalyticsNotFoundException("Analytics event not found with ID: " + id);
        }
        analyticsRepository.deleteById(id);
        log.info("Analytics event ID: {} deleted successfully", id);
    }

    private AnalyticsEventDto mapToDto(AnalyticsEvent event) {
        return AnalyticsEventDto.builder()
                .eventId(event.getEventId())
                .eventType(event.getEventType())
                .userId(event.getUserId())
                .targetId(event.getTargetId())
                .eventData(event.getEventData())
                .timestamp(event.getTimestamp())
                .build();
    }
}
