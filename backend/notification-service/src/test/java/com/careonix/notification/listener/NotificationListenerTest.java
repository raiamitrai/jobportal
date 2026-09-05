package com.careonix.notification.listener;

import com.careonix.notification.config.RabbitConfig;
import com.careonix.notification.entity.Notification;
import com.careonix.notification.repository.NotificationRepository;
import com.careonix.notification.service.SmsSender;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mockito;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@SpringBootTest
@Testcontainers
class NotificationListenerTest {

    @Container
    static RabbitMQContainer rabbitMQContainer = new RabbitMQContainer(DockerImageName.parse("rabbitmq:3-management"))
            .withExposedPorts(5672);

    @Configuration
    static class TestConfig {
        @Bean
        public RabbitTemplate rabbitTemplate() {
            // RabbitTemplate will be auto-configured by Spring Boot using the container properties via DynamicPropertySource
            return new RabbitTemplate();
        }
    }

    @Autowired
    private RabbitTemplate rabbitTemplate;

    @Autowired
    private NotificationListener notificationListener;

    @MockBean
    private NotificationRepository notificationRepository;

    @MockBean
    private JavaMailSender javaMailSender; // mocked email sender

    @MockBean
    private SmsSender smsSender; // we will use the real mock implementation but can verify interaction

    @Autowired
    private Queue notificationQueue;

    @org.springframework.test.context.DynamicPropertySource
    static void rabbitProperties(org.springframework.test.context.DynamicPropertyRegistry registry) {
        registry.add("spring.rabbitmq.host", rabbitMQContainer::getHost);
        registry.add("spring.rabbitmq.port", () -> rabbitMQContainer.getAmqpPort());
        registry.add("spring.rabbitmq.username", () -> "guest");
        registry.add("spring.rabbitmq.password", () -> "guest");
    }

    @Test
    void whenEmailChannel_thenEmailSent() {
        // given
        Notification notification = Notification.builder()
                .notificationId(1L)
                .recipientEmail("user@example.com")
                .channel("EMAIL")
                .title("Test")
                .message("Hello")
                .build();
        when(notificationRepository.findById(1L)).thenReturn(Optional.of(notification));

        // when: send message directly via RabbitTemplate to the queue
        rabbitTemplate.convertAndSend(RabbitConfig.NOTIFICATION_EXCHANGE,
                RabbitConfig.NOTIFICATION_ROUTING_KEY, 1L);

        // then: wait a short time for listener to process
        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
        verify(javaMailSender, times(1)).send(any());
        verify(smsSender, never()).sendSms(anyString(), anyString());
    }

    @Test
    void whenSmsChannel_thenSmsSent() {
        Notification notification = Notification.builder()
                .notificationId(2L)
                .phoneNumber("+1234567890")
                .channel("SMS")
                .message("OTP code")
                .build();
        when(notificationRepository.findById(2L)).thenReturn(Optional.of(notification));

        rabbitTemplate.convertAndSend(RabbitConfig.NOTIFICATION_EXCHANGE,
                RabbitConfig.NOTIFICATION_ROUTING_KEY, 2L);

        try { Thread.sleep(1000); } catch (InterruptedException ignored) {}
        verify(smsSender, times(1)).sendSms(eq("+1234567890"), eq("OTP code"));
        verify(javaMailSender, never()).send(any());
    }
}
