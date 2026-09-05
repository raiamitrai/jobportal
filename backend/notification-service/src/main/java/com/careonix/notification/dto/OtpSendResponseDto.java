package com.careonix.notification.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpSendResponseDto {
    private String recipient;
    private String status;
    private String message;
    private String otpCode;
}
