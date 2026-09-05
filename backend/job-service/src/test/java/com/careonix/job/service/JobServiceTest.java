package com.careonix.job.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class JobServiceTest {

    @Autowired
    private JobService jobService;

    @Test
    void contextLoads() {
        assertNotNull(jobService, "JobService should be loaded in the Spring context");
    }
}
