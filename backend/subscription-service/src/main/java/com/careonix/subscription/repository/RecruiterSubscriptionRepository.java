package com.careonix.subscription.repository;

import com.careonix.subscription.entity.RecruiterSubscription;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RecruiterSubscriptionRepository extends JpaRepository<RecruiterSubscription, Long> {
    Optional<RecruiterSubscription> findByRecruiterEmail(String email);
}
