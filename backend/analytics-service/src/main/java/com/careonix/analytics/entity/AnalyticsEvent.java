package com.careonix.analytics.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "analytics_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    @Column(nullable = false)
    private String eventType; // e.g., JOB_VIEW, APPLICATION_SUBMITTED, INTERVIEW_SCHEDULED, USER_REGISTERED, SUBSCRIPTION_PURCHASED

    @Column(nullable = false)
    private Long userId;

    private Long targetId; // e.g., Job ID, Application ID, Recruiter ID

    @Column(length = 2000)
    private String eventData; // Metadata JSON or event description

    @Column(nullable = false)
    private LocalDateTime timestamp;
}
