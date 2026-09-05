package com.careonix.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequestDto {

    @NotNull(message = "Recipient ID is required")
    private Long recipientId;

    @NotBlank(message = "Recipient email is required")
    @Email(message = "Invalid email format")
    private String recipientEmail;

    @Pattern(regexp = "^\\+?[0-9]{7,15}$", message = "Invalid phone number")
    private String phoneNumber; // optional for SMS

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Message content is required")
    private String message;

    public enum Channel { EMAIL, SMS }

    @NotNull(message = "Channel is required")
    private Channel channel; // EMAIL or SMS

    private String type; // e.g., APPLICATION_STATUS, INTERVIEW_SCHEDULED, JOB_ALERT, GENERAL
    private String status; // e.g., SENT, PENDING, FAILED, READ
}
