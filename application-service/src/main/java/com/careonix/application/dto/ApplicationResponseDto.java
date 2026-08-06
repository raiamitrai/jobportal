package com.careonix.application.dto;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationResponseDto {
    private Long applicationId;
    private Long jobId;
    private Long candidateId;
    private LocalDate appliedAt;
    private String status;
    private String coverLetter;
    private String resumeUrl;
}
