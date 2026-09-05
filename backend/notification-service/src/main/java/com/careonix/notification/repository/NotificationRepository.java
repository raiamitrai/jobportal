package com.careonix.notification.repository;

import com.careonix.notification.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByRecipientId(Long recipientId);

    Page<Notification> findByRecipientId(Long recipientId, Pageable pageable);

    List<Notification> findByRecipientEmailIgnoreCase(String recipientEmail);

    List<Notification> findByStatusIgnoreCase(String status);

    List<Notification> findByTypeIgnoreCase(String type);
}
