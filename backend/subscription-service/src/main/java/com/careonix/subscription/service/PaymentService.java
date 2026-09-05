package com.careonix.subscription.service;

import com.careonix.subscription.dto.CreateOrderRequest;
import com.careonix.subscription.dto.SubscriptionStatusResponse;
import com.careonix.subscription.dto.VerifyPaymentRequest;
import com.careonix.subscription.entity.PaymentRecord;
import com.careonix.subscription.entity.RecruiterSubscription;
import com.careonix.subscription.repository.PaymentRecordRepository;
import com.careonix.subscription.repository.RecruiterSubscriptionRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRecordRepository paymentRepo;
    private final RecruiterSubscriptionRepository subscriptionRepo;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    /**
     * STEP 1: Create Razorpay Order (server-side).
     * Frontend calls this, gets order_id, then opens Razorpay Checkout.
     *
     * @return Map with orderId, amount, currency, keyId
     */
    public Map<String, Object> createOrder(CreateOrderRequest req) throws RazorpayException {
        RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

        // Amount must be in paise (₹1 = 100 paise)
        int amountPaise = (int) Math.round(req.getAmount() * 100);

        JSONObject orderRequest = new JSONObject();
        orderRequest.put("amount", amountPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());
        orderRequest.put("notes", new JSONObject()
                .put("recruiter_email", req.getRecruiterEmail())
                .put("plan_id", req.getPlanId())
                .put("plan_name", req.getPlanName())
                .put("duration_days", req.getDurationDays())
        );

        Order order = razorpay.orders.create(orderRequest);
        log.info("Razorpay Order created: {} for recruiter: {}", order.get("id"), req.getRecruiterEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.get("id").toString());
        response.put("amount", amountPaise);
        response.put("currency", "INR");
        response.put("keyId", razorpayKeyId);
        response.put("planName", req.getPlanName());
        response.put("recruiterEmail", req.getRecruiterEmail());
        return response;
    }

    /**
     * STEP 2: Verify Razorpay Payment (server-side HMAC check).
     * Called after user completes payment on Razorpay Checkout.
     * If valid → saves PaymentRecord + activates/renews RecruiterSubscription.
     *
     * @return SubscriptionStatusResponse with full subscription details
     */
    @Transactional
    public SubscriptionStatusResponse verifyAndActivate(VerifyPaymentRequest req) throws RazorpayException {
        // ── 1. Verify HMAC Signature ─────────────────────────────────────────
        String payload = req.getRazorpayOrderId() + "|" + req.getRazorpayPaymentId();
        boolean isValid = Utils.verifySignature(payload, req.getRazorpaySignature(), razorpayKeySecret);

        if (!isValid) {
            log.warn("Invalid Razorpay signature for payment: {}", req.getRazorpayPaymentId());
            throw new SecurityException("Payment signature verification failed. Possible tampered request.");
        }

        log.info("✅ Razorpay payment verified: {} for {}", req.getRazorpayPaymentId(), req.getRecruiterEmail());

        // ── 2. Prevent duplicate processing ──────────────────────────────────
        Optional<PaymentRecord> existing = paymentRepo.findByRazorpayPaymentId(req.getRazorpayPaymentId());
        if (existing.isPresent()) {
            log.warn("Duplicate payment attempt ignored: {}", req.getRazorpayPaymentId());
            // Return current subscription state without re-activating
            return buildStatusResponse(req.getRecruiterEmail());
        }

        // ── 3. Save Payment Record ────────────────────────────────────────────
        PaymentRecord record = PaymentRecord.builder()
                .razorpayPaymentId(req.getRazorpayPaymentId())
                .razorpayOrderId(req.getRazorpayOrderId())
                .razorpaySignature(req.getRazorpaySignature())
                .recruiterEmail(req.getRecruiterEmail().toLowerCase().trim())
                .planId(req.getPlanId())
                .planName(req.getPlanName())
                .amountPaid(req.getAmountPaid() != null ? req.getAmountPaid() : 0.0)
                .status("PAID")
                .build();
        paymentRepo.save(record);

        // ── 4. Activate / Renew Subscription ─────────────────────────────────
        String email = req.getRecruiterEmail().toLowerCase().trim();
        int durationDays = req.getDurationDays() != null ? req.getDurationDays() : 30;
        int maxPosts = req.getMaxJobPosts() != null ? req.getMaxJobPosts() : 25;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiry = now.plusDays(durationDays);

        Optional<RecruiterSubscription> existingSub = subscriptionRepo.findByRecruiterEmail(email);
        RecruiterSubscription sub;

        if (existingSub.isPresent()) {
            // Renew existing
            sub = existingSub.get();
            sub.setPlanId(req.getPlanId());
            sub.setPlanName(req.getPlanName());
            sub.setDurationDays(durationDays);
            sub.setStartDate(now);
            sub.setExpiryDate(expiry);
            sub.setStatus("ACTIVE");
            sub.setLastPaymentId(req.getRazorpayPaymentId());
            sub.setMaxJobPosts(maxPosts);
            log.info("🔄 Subscription renewed for {}, expires: {}", email, expiry);
        } else {
            // Create new
            sub = RecruiterSubscription.builder()
                    .recruiterEmail(email)
                    .planId(req.getPlanId())
                    .planName(req.getPlanName())
                    .durationDays(durationDays)
                    .startDate(now)
                    .expiryDate(expiry)
                    .status("ACTIVE")
                    .lastPaymentId(req.getRazorpayPaymentId())
                    .maxJobPosts(maxPosts)
                    .build();
            log.info("🆕 Subscription created for {}, expires: {}", email, expiry);
        }
        subscriptionRepo.save(sub);

        // ── 5. Return subscription status ─────────────────────────────────────
        return buildStatusResponse(email);
    }

    /**
     * GET subscription status for a recruiter.
     * Frontend checks this on login / dashboard load to determine feature lock.
     */
    public SubscriptionStatusResponse getStatus(String email) {
        return buildStatusResponse(email.toLowerCase().trim());
    }

    /**
     * GET payment history for a recruiter.
     */
    public List<PaymentRecord> getPaymentHistory(String email) {
        return paymentRepo.findByRecruiterEmailOrderByCreatedAtDesc(email.toLowerCase().trim());
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private SubscriptionStatusResponse buildStatusResponse(String email) {
        Optional<RecruiterSubscription> subOpt = subscriptionRepo.findByRecruiterEmail(email);

        if (subOpt.isEmpty()) {
            return SubscriptionStatusResponse.builder()
                    .active(false)
                    .recruiterEmail(email)
                    .status("NONE")
                    .message("No subscription found for this account.")
                    .build();
        }

        RecruiterSubscription sub = subOpt.get();

        // Auto-update expired status
        if ("ACTIVE".equals(sub.getStatus()) && LocalDateTime.now().isAfter(sub.getExpiryDate())) {
            sub.setStatus("EXPIRED");
            subscriptionRepo.save(sub);
        }

        boolean isActive = sub.isCurrentlyActive();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd, yyyy hh:mm a");

        return SubscriptionStatusResponse.builder()
                .active(isActive)
                .recruiterEmail(email)
                .planId(sub.getPlanId())
                .planName(sub.getPlanName())
                .durationDays(sub.getDurationDays())
                .daysRemaining(sub.getDaysRemaining())
                .startDate(sub.getStartDate())
                .expiryDate(sub.getExpiryDate())
                .status(sub.getStatus())
                .lastPaymentId(sub.getLastPaymentId())
                .maxJobPosts(sub.getMaxJobPosts())
                .formattedExpiry(sub.getExpiryDate() != null ? sub.getExpiryDate().format(fmt) : null)
                .message(isActive
                        ? "Subscription is ACTIVE. All recruiter features unlocked."
                        : "Subscription has expired. Please renew to continue.")
                .build();
    }
}
