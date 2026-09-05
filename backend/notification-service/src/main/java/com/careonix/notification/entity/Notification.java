package com.careonix.notification.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long notificationId;

    @Column(nullable = true)
    private Long recipientId;

    @Column(nullable = true)
    private String recipientEmail;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String message;

    @Column(nullable = true)
    private String phoneNumber; // optional for SMS

    @Column(nullable = false)
    private String channel; // EMAIL or SMS

    @Column(nullable = false)
    private String type; // e.g., APPLICATION_STATUS, INTERVIEW_SCHEDULED, JOB_ALERT, GENERAL, OTP

    @Column(nullable = false)
    private String status; // SENT, PENDING, FAILED, READ

    @Column(nullable = false)
    private LocalDateTime sentAt;
}
