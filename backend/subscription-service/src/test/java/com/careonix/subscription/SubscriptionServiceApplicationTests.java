package com.careonix.subscription;

import com.careonix.subscription.service.SubscriptionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class SubscriptionServiceApplicationTests {

    @Autowired
    private SubscriptionService subscriptionService;

    @Test
    void contextLoads() {
        assertNotNull(subscriptionService, "SubscriptionService context should load properly");
    }
}
