package com.careonix.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdateRequestDto {

    @NotBlank(message = "Status cannot be blank")
    private String status; // SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, REJECTED
}
