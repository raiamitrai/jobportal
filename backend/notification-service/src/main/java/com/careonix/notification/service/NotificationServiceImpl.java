package com.careonix.notification.service;

import com.careonix.notification.dto.NotificationRequestDto;
import com.careonix.notification.dto.NotificationResponseDto;
import com.careonix.notification.dto.OtpSendRequestDto;
import com.careonix.notification.dto.OtpSendResponseDto;
import com.careonix.notification.entity.Notification;
import com.careonix.notification.exception.NotificationNotFoundException;
import com.careonix.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notificationRepository;
    private final EmailDispatchService emailDispatchService;
    private final SmsSender smsSender;

    @Override
    @Transactional
    public NotificationResponseDto sendNotification(NotificationRequestDto dto) {
        log.info("Sending notification for recipientId: {}", dto.getRecipientId());

        Notification notification = Notification.builder()
                .recipientId(dto.getRecipientId())
                .recipientEmail(dto.getRecipientEmail())
                .phoneNumber(dto.getPhoneNumber())
                .channel(dto.getChannel() != null ? dto.getChannel().name() : "EMAIL")
                .title(dto.getTitle())
                .message(dto.getMessage())
                .type(dto.getType())
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        Notification saved = null;
        try {
            saved = notificationRepository.save(notification);
        } catch (Exception ex) {
            log.warn("Database save notice (running in standalone mode): {}", ex.getMessage());
            saved = notification;
            saved.setNotificationId(System.currentTimeMillis());
        }

        // Dispatch Email via Gmail SMTP + MailHog Inbox if channel is EMAIL
        if (dto.getChannel() == null || dto.getChannel() == NotificationRequestDto.Channel.EMAIL) {
            try {
                emailDispatchService.sendNotificationEmailAsync(dto.getRecipientEmail(), dto.getTitle(), dto.getMessage());
            } catch (Exception ex) {
                log.warn("Email dispatch execution warning: {}", ex.getMessage());
            }
        }

        return mapToResponseDto(saved);
    }

    @Override
    public NotificationResponseDto getNotificationById(Long id) {
        log.info("Fetching notification by ID: {}", id);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with ID: " + id));
        return mapToResponseDto(notification);
    }

    @Override
    public List<NotificationResponseDto> getNotificationsByRecipientId(Long recipientId) {
        return notificationRepository.findByRecipientId(recipientId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public Page<NotificationResponseDto> getNotificationsByRecipientId(Long recipientId, Pageable pageable) {
        return notificationRepository.findByRecipientId(recipientId, pageable)
                .map(this::mapToResponseDto);
    }

    @Override
    public List<NotificationResponseDto> getNotificationsByStatus(String status) {
        return notificationRepository.findByStatusIgnoreCase(status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public NotificationResponseDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new NotificationNotFoundException("Notification not found with ID: " + id));
        notification.setStatus("READ");
        return mapToResponseDto(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public void deleteNotification(Long id) {
        log.info("Deleting notification ID: {}", id);
        if (!notificationRepository.existsById(id)) {
            throw new NotificationNotFoundException("Notification not found with ID: " + id);
        }
        notificationRepository.deleteById(id);
    }

    @Override
    public OtpSendResponseDto sendOtp(OtpSendRequestDto dto) {
        String code = String.valueOf((int) (100000 + Math.random() * 900000));
        log.info("Generating OTP [{}] for recipient: {}", code, dto.getRecipient());

        boolean isEmail = dto.getRecipient() != null && dto.getRecipient().contains("@");
        if (isEmail) {
            emailDispatchService.sendHtmlEmailAsync(dto.getRecipient(), code);
        } else {
            smsSender.sendSms(dto.getRecipient(), "Your Careonix 6-digit verification code is: " + code);
        }

        Notification notification = Notification.builder()
                .recipientEmail(isEmail ? dto.getRecipient() : null)
                .phoneNumber(isEmail ? null : dto.getRecipient())
                .channel(isEmail ? "EMAIL" : "SMS")
                .title("Registration Verification OTP")
                .message("Your verification code is: " + code)
                .type("OTP")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();
        notificationRepository.save(notification);

        return new OtpSendResponseDto(
                dto.getRecipient(),
                "SENT",
                "OTP verification code dispatched successfully via " + (isEmail ? "Email" : "SMS"),
                code
        );
    }

    private NotificationResponseDto mapToResponseDto(Notification notification) {
        return NotificationResponseDto.builder()
                .notificationId(notification.getNotificationId())
                .recipientId(notification.getRecipientId())
                .recipientEmail(notification.getRecipientEmail())
                .phoneNumber(notification.getPhoneNumber())
                .channel(notification.getChannel())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .type(notification.getType())
                .status(notification.getStatus())
                .sentAt(notification.getSentAt())
                .build();
    }
}
