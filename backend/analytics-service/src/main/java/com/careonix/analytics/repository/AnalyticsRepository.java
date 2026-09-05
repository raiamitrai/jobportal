package com.careonix.analytics.repository;

import com.careonix.analytics.entity.AnalyticsEvent;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalyticsRepository extends JpaRepository<AnalyticsEvent, Long> {

    List<AnalyticsEvent> findByUserId(Long userId);

    List<AnalyticsEvent> findByEventTypeIgnoreCase(String eventType);

    Page<AnalyticsEvent> findByEventTypeIgnoreCase(String eventType, Pageable pageable);

    long countByEventTypeIgnoreCase(String eventType);

    long countByEventTypeIgnoreCaseAndTargetId(String eventType, Long targetId);
}
