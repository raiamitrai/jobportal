package com.careonix.auth.service;

import com.careonix.auth.dto.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.*;

@SpringBootTest
@Testcontainers
class AuthServiceIntegrationTest {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("authdb")
            .withUsername("careonix_user")
            .withPassword("Password123");

    @DynamicPropertySource
    static void setProps(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", mysql::getJdbcUrl);
        r.add("spring.datasource.username", mysql::getUsername);
        r.add("spring.datasource.password", mysql::getPassword);
    }

    @Autowired
    AuthService service;

    @Test
    void registerAndLoginFlow() {
        RegisterRequest reg = new RegisterRequest();
        reg.setEmail("test@example.com");
        reg.setPassword("Secret123!");
        service.register(reg);

        LoginRequest login = new LoginRequest();
        login.setEmail("test@example.com");
        login.setPassword("Secret123!");
        AuthResponse resp = service.login(login);

        assertThat(resp.getAccessToken()).isNotBlank();
        assertThat(resp.getRefreshToken()).isNotBlank();
    }
}
