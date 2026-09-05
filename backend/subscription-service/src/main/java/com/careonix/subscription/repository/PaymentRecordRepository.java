package com.careonix.subscription.repository;

import com.careonix.subscription.entity.PaymentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, Long> {
    Optional<PaymentRecord> findByRazorpayPaymentId(String paymentId);
    List<PaymentRecord> findByRecruiterEmailOrderByCreatedAtDesc(String email);
}
