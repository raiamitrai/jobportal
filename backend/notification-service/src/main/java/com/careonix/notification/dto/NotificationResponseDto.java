package com.careonix.notification.dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationResponseDto {

    private Long notificationId;
    private Long recipientId;
    private String recipientEmail;
    private String phoneNumber;
    private String channel;
    private String title;
    private String message;
    private String type;
    private String status;
    private LocalDateTime sentAt;
}
