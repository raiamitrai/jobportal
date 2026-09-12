package com.careonix.job.dto;

import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobResponseDto {
    private Long jobId;
    private String title;
    private String category;
    private String type;
    private String location;
    private String companyName;
    private String description;
    private double salaryMin;
    private double salaryMax;
    private List<String> skills;
    private int experienceRequired;
    private Long postedBy;
    private String status;
    private LocalDate postedAt;
}


