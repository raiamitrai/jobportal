package com.careonix.website;

import com.careonix.website.controller.HomeController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class WebsiteControllerApplicationTests {

    @Autowired
    private HomeController homeController;

    @Test
    void contextLoads() {
        assertNotNull(homeController, "HomeController context should load properly");
    }
}
