package com.careonix.subscription.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Response DTO for subscription status — returned to frontend after
 * payment verification OR when checking active subscription.
 */
@Data
@Builder
public class SubscriptionStatusResponse {

    private boolean active;
    private String recruiterEmail;
    private String planId;
    private String planName;
    private Integer durationDays;
    private Long daysRemaining;
    private LocalDateTime startDate;
    private LocalDateTime expiryDate;
    private String status;           // "ACTIVE" | "EXPIRED" | "NONE"
    private String lastPaymentId;
    private Integer maxJobPosts;

    /** Human-readable expiry (for UI display) */
    private String formattedExpiry;

    /** Message for UI toast / alert */
    private String message;
}
