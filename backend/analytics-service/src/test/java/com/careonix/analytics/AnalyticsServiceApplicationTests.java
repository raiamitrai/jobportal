package com.careonix.analytics;

import com.careonix.analytics.service.AnalyticsService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class AnalyticsServiceApplicationTests {

    @Autowired
    private AnalyticsService analyticsService;

    @Test
    void contextLoads() {
        assertNotNull(analyticsService, "AnalyticsService context should load properly");
    }
}
