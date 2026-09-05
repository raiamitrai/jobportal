package com.careonix.notification.service;

import com.careonix.notification.dto.NotificationRequestDto;
import com.careonix.notification.dto.NotificationResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    NotificationResponseDto sendNotification(NotificationRequestDto dto);

    NotificationResponseDto getNotificationById(Long id);

    List<NotificationResponseDto> getNotificationsByRecipientId(Long recipientId);

    Page<NotificationResponseDto> getNotificationsByRecipientId(Long recipientId, Pageable pageable);

    List<NotificationResponseDto> getNotificationsByStatus(String status);

    NotificationResponseDto markAsRead(Long id);

    void deleteNotification(Long id);

    com.careonix.notification.dto.OtpSendResponseDto sendOtp(com.careonix.notification.dto.OtpSendRequestDto dto);
}
