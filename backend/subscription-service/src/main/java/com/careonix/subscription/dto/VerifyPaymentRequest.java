package com.careonix.subscription.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /payments/verify
 * Frontend sends Razorpay's response after successful payment.
 */
@Data
public class VerifyPaymentRequest {

    /** Razorpay payment_id from checkout response */
    @NotBlank(message = "Payment ID is required")
    private String razorpayPaymentId;

    /** Razorpay order_id from checkout response */
    @NotBlank(message = "Order ID is required")
    private String razorpayOrderId;

    /** HMAC SHA256 signature from Razorpay for verification */
    @NotBlank(message = "Signature is required")
    private String razorpaySignature;

    /** Recruiter's email to activate subscription for */
    @NotBlank(message = "Recruiter email is required")
    private String recruiterEmail;

    /** Plan ID (e.g. "plan-30d") */
    @NotBlank(message = "Plan ID is required")
    private String planId;

    /** Plan name */
    @NotBlank(message = "Plan name is required")
    private String planName;

    /** Duration in days */
    private Integer durationDays;

    /** Amount paid in INR */
    private Double amountPaid;

    /** Max job posts */
    private Integer maxJobPosts;
}
