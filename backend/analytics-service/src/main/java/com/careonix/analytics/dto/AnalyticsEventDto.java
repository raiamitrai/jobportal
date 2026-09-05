package com.careonix.analytics.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnalyticsEventDto {

    private Long eventId;

    @NotBlank(message = "Event type is required")
    private String eventType;

    @NotNull(message = "User ID is required")
    private Long userId;

    private Long targetId;
    private String eventData;
    private LocalDateTime timestamp;
}
