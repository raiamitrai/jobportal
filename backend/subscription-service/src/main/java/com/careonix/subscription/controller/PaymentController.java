package com.careonix.subscription.controller;

import com.careonix.subscription.dto.CreateOrderRequest;
import com.careonix.subscription.dto.SubscriptionStatusResponse;
import com.careonix.subscription.dto.VerifyPaymentRequest;
import com.careonix.subscription.entity.PaymentRecord;
import com.careonix.subscription.service.PaymentService;
import com.razorpay.RazorpayException;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Payment API for Careonix Recruiter Subscriptions.
 *
 * Base URL: http://localhost:8087/payments
 *
 * Endpoints:
 *   POST  /payments/create-order   → Creates Razorpay order (step 1)
 *   POST  /payments/verify         → Verifies payment & activates subscription (step 2)
 *   GET   /payments/subscription   → Returns current subscription status
 *   GET   /payments/history        → Returns payment history for a recruiter
 */
@Slf4j
@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = {
    "http://localhost:3001",
    "http://localhost:3007",
    "http://localhost:5173",
    "http://localhost:3000"
})
public class PaymentController {

    private final PaymentService paymentService;

    /**
     * STEP 1: Create Razorpay Order.
     *
     * POST /payments/create-order
     * Body: { recruiterEmail, planId, planName, amount, durationDays, maxJobPosts }
     *
     * Returns: { orderId, amount (paise), currency, keyId }
     * Frontend uses orderId to open Razorpay Checkout.
     */
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(@Valid @RequestBody CreateOrderRequest req) {
        try {
            Map<String, Object> order = paymentService.createOrder(req);
            return ResponseEntity.ok(order);
        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                        "error", "Failed to create payment order",
                        "detail", e.getMessage()
                    ));
        } catch (Exception e) {
            log.error("Unexpected error creating order: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * STEP 2: Verify Payment & Activate Subscription.
     *
     * POST /payments/verify
     * Body: { razorpayPaymentId, razorpayOrderId, razorpaySignature, recruiterEmail,
     *         planId, planName, durationDays, amountPaid, maxJobPosts }
     *
     * Validates HMAC signature server-side (secure!).
     * Returns: SubscriptionStatusResponse with active subscription details.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(@Valid @RequestBody VerifyPaymentRequest req) {
        try {
            SubscriptionStatusResponse status = paymentService.verifyAndActivate(req);
            return ResponseEntity.ok(status);
        } catch (SecurityException e) {
            log.warn("Payment signature verification failed: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Payment verification failed", "detail", e.getMessage()));
        } catch (RazorpayException e) {
            log.error("Razorpay error during verification: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("error", "Payment gateway error", "detail", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error verifying payment: {}", e.getMessage());
            return ResponseEntity
                    .status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Internal server error"));
        }
    }

    /**
     * GET current subscription status for a recruiter.
     *
     * GET /payments/subscription?email=recruiter@example.com
     * Returns: SubscriptionStatusResponse { active, planName, daysRemaining, expiryDate, ... }
     */
    @GetMapping("/subscription")
    public ResponseEntity<SubscriptionStatusResponse> getSubscriptionStatus(
            @RequestParam String email) {
        SubscriptionStatusResponse status = paymentService.getStatus(email);
        return ResponseEntity.ok(status);
    }

    /**
     * GET payment history for a recruiter.
     *
     * GET /payments/history?email=recruiter@example.com
     * Returns: List of PaymentRecord
     */
    @GetMapping("/history")
    public ResponseEntity<List<PaymentRecord>> getPaymentHistory(
            @RequestParam String email) {
        return ResponseEntity.ok(paymentService.getPaymentHistory(email));
    }

    /**
     * Health check endpoint.
     * GET /payments/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "payment-service (subscription-service)",
            "port", "8087"
        ));
    }
}
