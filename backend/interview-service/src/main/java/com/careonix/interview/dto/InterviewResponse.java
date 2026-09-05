package com.careonix.interview.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewResponse {
    private Long id;
    private String candidateName;
    private String position;
    private LocalDate interviewDate;
    private LocalTime interviewTime;
    private String status;
}
