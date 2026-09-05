package com.careonix.notification.listener;

import com.careonix.notification.config.RabbitConfig;
import com.careonix.notification.entity.Notification;
import com.careonix.notification.exception.NotificationNotFoundException;
import com.careonix.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import com.careonix.notification.service.SmsSender;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class NotificationListener {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;
    private final SmsSender smsSender;

    @RabbitListener(queues = RabbitConfig.NOTIFICATION_QUEUE)
    public void handleNotification(Long notificationId) {
        log.info("Received notification ID {} from queue", notificationId);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with ID: " + notificationId));

        // Process based on channel
        String channel = notification.getChannel();
        if (channel == null) {
            channel = "EMAIL"; // default
        }
        if ("EMAIL".equalsIgnoreCase(channel)) {
            sendEmail(notification);
        } else if ("SMS".equalsIgnoreCase(channel)) {
        smsSender.sendSms(notification.getPhoneNumber(), notification.getMessage());
    } else {
            log.warn("Unsupported notification channel '{}' for ID {}", channel, notificationId);
        }

        // Update status to SENT if not already
        if (!"SENT".equalsIgnoreCase(notification.getStatus())) {
            notification.setStatus("SENT");
            notificationRepository.save(notification);
            log.info("Notification ID {} status updated to SENT", notificationId);
        }
    }

    private void sendEmail(Notification notification) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("careonixteam@gmail.com");
            message.setTo(notification.getRecipientEmail());
            message.setSubject(notification.getTitle());
            message.setText(notification.getMessage());
            mailSender.send(message);
            log.info("Email sent successfully for notification ID {}", notification.getNotificationId());
        } catch (Exception e) {
            log.error("Failed to send email for notification ID {}: {}", notification.getNotificationId(), e.getMessage(), e);
            notification.setStatus("FAILED");
            notificationRepository.save(notification);
        }
    }

    // Stub implementation for SMS – can be replaced with an real SMS provider
    private void sendSmsStub(Notification notification) {
        log.info("[SMS STUB] Sending SMS to {} with message: {}", notification.getPhoneNumber(), notification.getMessage());
        // In real implementation, integrate with an SMS gateway here.
    }
}
