package com.careonix.profile.service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.beans.factory.annotation.Autowired;
import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class ProfileServiceTest {

    @Autowired
    private ProfileService profileService;

    @Test
    void contextLoads() {
        assertNotNull(profileService, "ProfileService should be loaded in the Spring context");
    }
}
