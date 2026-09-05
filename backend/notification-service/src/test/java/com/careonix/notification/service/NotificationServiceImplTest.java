package com.careonix.notification.service;

import com.careonix.notification.dto.NotificationRequestDto;
import com.careonix.notification.dto.NotificationResponseDto;
import com.careonix.notification.entity.Notification;
import com.careonix.notification.exception.NotificationNotFoundException;
import com.careonix.notification.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class NotificationServiceImplTest {

    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private NotificationServiceImpl notificationService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void sendNotification_success() {
        NotificationRequestDto dto = NotificationRequestDto.builder()
                .recipientId(101L)
                .recipientEmail("user@example.com")
                .title("Interview Scheduled")
                .message("Your interview is scheduled for tomorrow at 10 AM.")
                .type("INTERVIEW_SCHEDULED")
                .status("SENT")
                .build();

        Notification saved = Notification.builder()
                .notificationId(1L)
                .recipientId(101L)
                .recipientEmail("user@example.com")
                .title("Interview Scheduled")
                .message("Your interview is scheduled for tomorrow at 10 AM.")
                .type("INTERVIEW_SCHEDULED")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        when(notificationRepository.save(any(Notification.class))).thenReturn(saved);

        NotificationResponseDto response = notificationService.sendNotification(dto);

        assertNotNull(response);
        assertEquals(1L, response.getNotificationId());
        assertEquals("user@example.com", response.getRecipientEmail());
        verify(notificationRepository, times(1)).save(any(Notification.class));
    }

    @Test
    void getNotificationById_found() {
        Long id = 1L;
        Notification notification = Notification.builder()
                .notificationId(id)
                .recipientId(101L)
                .recipientEmail("test@example.com")
                .title("Test")
                .message("Test Msg")
                .type("GENERAL")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        when(notificationRepository.findById(id)).thenReturn(Optional.of(notification));

        NotificationResponseDto response = notificationService.getNotificationById(id);

        assertNotNull(response);
        assertEquals(id, response.getNotificationId());
    }

    @Test
    void getNotificationById_notFound() {
        Long id = 99L;
        when(notificationRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(NotificationNotFoundException.class, () -> notificationService.getNotificationById(id));
    }

    @Test
    void markAsRead_success() {
        Long id = 1L;
        Notification existing = Notification.builder()
                .notificationId(id)
                .recipientId(101L)
                .recipientEmail("test@example.com")
                .title("Test")
                .message("Test Msg")
                .type("GENERAL")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        Notification updated = Notification.builder()
                .notificationId(id)
                .recipientId(101L)
                .recipientEmail("test@example.com")
                .title("Test")
                .message("Test Msg")
                .type("GENERAL")
                .status("READ")
                .sentAt(existing.getSentAt())
                .build();

        when(notificationRepository.findById(id)).thenReturn(Optional.of(existing));
        when(notificationRepository.save(existing)).thenReturn(updated);

        NotificationResponseDto response = notificationService.markAsRead(id);

        assertNotNull(response);
        assertEquals("READ", response.getStatus());
    }

    @Test
    void deleteNotification_exists() {
        Long id = 1L;
        when(notificationRepository.existsById(id)).thenReturn(true);
        doNothing().when(notificationRepository).deleteById(id);

        notificationService.deleteNotification(id);

        verify(notificationRepository, times(1)).deleteById(id);
    }

    @Test
    void getNotificationsByRecipientId_paginated() {
        Long recipientId = 101L;
        Pageable pageable = mock(Pageable.class);
        Notification notification = Notification.builder()
                .notificationId(1L)
                .recipientId(recipientId)
                .recipientEmail("test@example.com")
                .title("Test")
                .message("Msg")
                .type("GENERAL")
                .status("SENT")
                .sentAt(LocalDateTime.now())
                .build();

        Page<Notification> page = new PageImpl<>(List.of(notification));
        when(notificationRepository.findByRecipientId(recipientId, pageable)).thenReturn(page);

        Page<NotificationResponseDto> result = notificationService.getNotificationsByRecipientId(recipientId, pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
    }
}
