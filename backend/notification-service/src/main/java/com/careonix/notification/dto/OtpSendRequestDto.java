package com.careonix.notification.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OtpSendRequestDto {
    @NotBlank(message = "Recipient (email or phone) is required")
    private String recipient;

    private String type; // "EMAIL" or "PHONE"
}
