package com.careonix.analytics.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardMetricsDto {

    private long totalEvents;
    private long totalJobViews;
    private long totalApplicationsSubmitted;
    private long totalInterviewsScheduled;
    private long totalSubscriptionsPurchased;
    private long totalUsersRegistered;
}
