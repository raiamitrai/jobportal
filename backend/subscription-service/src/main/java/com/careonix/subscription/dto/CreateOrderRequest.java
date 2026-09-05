package com.careonix.subscription.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * Request body for POST /payments/create-order
 * Frontend sends this to create a Razorpay Order (server-side).
 */
@Data
public class CreateOrderRequest {

    /** Recruiter's email for linking the subscription */
    @NotBlank(message = "Recruiter email is required")
    private String recruiterEmail;

    /** Plan ID from frontend (e.g. "plan-30d") */
    @NotBlank(message = "Plan ID is required")
    private String planId;

    /** Plan name (e.g. "30-Day Monthly Pro") */
    @NotBlank(message = "Plan name is required")
    private String planName;

    /** Amount in INR (e.g. 1999) */
    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Amount must be at least 1")
    private Double amount;

    /** Duration in days (7, 30, 90, 365) */
    @NotNull(message = "Duration days is required")
    @Min(value = 1, message = "Duration must be at least 1 day")
    private Integer durationDays;

    /** Max job posts for this plan */
    private Integer maxJobPosts;
}
