package com.careonix.job.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobRequestDto {

    @NotBlank(message = "Job title is required")
    private String title;

    @NotBlank(message = "Job category is required")
    private String category;

    @NotBlank(message = "Job type is required")
    private String type; // FULL_TIME, PART_TIME, etc.

    @NotBlank(message = "Job location is required")
    private String location;

    private String companyName;
    private String description;

    private double salaryMin;
    private double salaryMax;
    private List<String> skills;
    private int experienceRequired;

    private Long postedBy;

    private String status; // ACTIVE, PAUSED, CLOSED
}


