package com.careonix.interview.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewRequest {

    @NotBlank(message = "Candidate name is required")
    private String candidateName;

    @NotBlank(message = "Position is required")
    private String position;

    @NotNull(message = "Interview date is required")
    @FutureOrPresent(message = "Interview date must be today or in the future")
    private LocalDate interviewDate;

    @NotNull(message = "Interview time is required")
    private LocalTime interviewTime;

    // Status is optional on creation; defaults to SCHEDULED in service
    private String status;
}
