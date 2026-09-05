package com.careonix.notification.controller;

import com.careonix.notification.dto.NotificationRequestDto;
import com.careonix.notification.dto.NotificationResponseDto;
import com.careonix.notification.service.NotificationService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationResource.class)
class NotificationResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    @DisplayName("POST /notifications creates a notification and returns 201")
    void testCreateNotification() throws Exception {
        NotificationRequestDto request = new NotificationRequestDto();
        request.setRecipientId(1L);
        request.setRecipientEmail("user@example.com");
        request.setTitle("Test");
        request.setMessage("Hello");
        request.setChannel(NotificationRequestDto.Channel.EMAIL);
        request.setStatus("PENDING");
        request.setType("GENERAL");

        NotificationResponseDto response = NotificationResponseDto.builder()
                .notificationId(100L)
                .recipientId(1L)
                .recipientEmail("user@example.com")
                .channel("EMAIL")
                .title("Test")
                .message("Hello")
                .type("GENERAL")
                .status("PENDING")
                .build();

        Mockito.when(notificationService.sendNotification(Mockito.any()))
                .thenReturn(response);

        mockMvc.perform(post("/notifications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.notificationId").value(100))
                .andExpect(jsonPath("$.recipientEmail").value("user@example.com"));
    }
}
