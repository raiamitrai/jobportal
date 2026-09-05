package com.careonix.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecruiterAnalyticsDto {

    private Long recruiterId;
    private long totalJobViews;
    private long totalApplicationsReceived;
    private long interviewsScheduled;
}
