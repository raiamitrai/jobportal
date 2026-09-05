package com.careonix.notification.controller;

import com.careonix.notification.dto.NotificationRequestDto;
import com.careonix.notification.dto.NotificationResponseDto;
import com.careonix.notification.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationResource {

    private final NotificationService notificationService;

    @PostMapping
    public ResponseEntity<NotificationResponseDto> sendNotification(@Valid @RequestBody NotificationRequestDto dto) {
        return ResponseEntity.ok(notificationService.sendNotification(dto));
    }

    @PostMapping("/otp")
    public ResponseEntity<com.careonix.notification.dto.OtpSendResponseDto> sendOtp(@Valid @RequestBody com.careonix.notification.dto.OtpSendRequestDto dto) {
        return ResponseEntity.ok(notificationService.sendOtp(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<NotificationResponseDto> getNotificationById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(notificationService.getNotificationById(id));
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByRecipientId(@PathVariable("recipientId") Long recipientId) {
        return ResponseEntity.ok(notificationService.getNotificationsByRecipientId(recipientId));
    }

    @GetMapping("/recipient/{recipientId}/page")
    public ResponseEntity<Page<NotificationResponseDto>> getPaginatedNotificationsByRecipientId(
            @PathVariable("recipientId") Long recipientId,
            Pageable pageable) {
        return ResponseEntity.ok(notificationService.getNotificationsByRecipientId(recipientId, pageable));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<NotificationResponseDto>> getNotificationsByStatus(@PathVariable("status") String status) {
        return ResponseEntity.ok(notificationService.getNotificationsByStatus(status));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationResponseDto> markAsRead(@PathVariable("id") Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteNotification(@PathVariable("id") Long id) {
        notificationService.deleteNotification(id);
        Map<String, String> response = Map.of("message", "Notification deleted successfully");
        return ResponseEntity.ok(response);
    }
}
