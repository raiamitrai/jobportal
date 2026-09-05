package com.careonix.subscription.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Stores every Razorpay payment transaction for audit / refund / history.
 */
@Entity
@Table(name = "payment_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Razorpay payment_id (e.g. pay_PiLkFqXYZ123) */
    @Column(nullable = false, unique = true, length = 100)
    private String razorpayPaymentId;

    /** Razorpay order_id (e.g. order_PiLkABC456) */
    @Column(nullable = false, length = 100)
    private String razorpayOrderId;

    /** HMAC signature returned by Razorpay on success */
    @Column(length = 200)
    private String razorpaySignature;

    /** Recruiter's email — links payment to account */
    @Column(nullable = false, length = 200)
    private String recruiterEmail;

    /** Plan ID from RECRUITER_PLANS (e.g. plan-30d) */
    @Column(nullable = false, length = 50)
    private String planId;

    /** Human-readable plan name */
    @Column(nullable = false, length = 100)
    private String planName;

    /** Amount paid in INR (e.g. 1999.0) */
    @Column(nullable = false)
    private Double amountPaid;

    /** "PAID" | "FAILED" | "PENDING" */
    @Column(nullable = false, length = 20)
    private String status;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
