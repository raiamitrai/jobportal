package com.careonix.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Tracks an active / expired recruiter subscription.
 * One row per recruiter — updated on each new payment.
 */
@Entity
@Table(name = "recruiter_subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecruiterSubscription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Recruiter email — unique identifier */
    @Column(nullable = false, unique = true, length = 200)
    private String recruiterEmail;

    @Column(nullable = false, length = 50)
    private String planId;

    @Column(nullable = false, length = 100)
    private String planName;

    /** Duration in days (7 / 30 / 90 / 365) */
    @Column(nullable = false)
    private Integer durationDays;

    @Column(nullable = false)
    private LocalDateTime startDate;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    /** "ACTIVE" | "EXPIRED" | "CANCELLED" */
    @Column(nullable = false, length = 20)
    private String status;

    /** Razorpay payment ID for this activation */
    @Column(length = 100)
    private String lastPaymentId;

    /** Max job posts allowed for this plan */
    @Column(nullable = false)
    private Integer maxJobPosts;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    /** Convenience: check if subscription is currently active */
    @Transient
    public boolean isCurrentlyActive() {
        return "ACTIVE".equals(status) && LocalDateTime.now().isBefore(expiryDate);
    }

    /** Days remaining (0 if expired) */
    @Transient
    public long getDaysRemaining() {
        if (!isCurrentlyActive()) return 0L;
        return java.time.Duration.between(LocalDateTime.now(), expiryDate).toDays();
    }
}
