package com.careonix.subscription.controller;

import com.careonix.subscription.dto.SubscriptionRequestDto;
import com.careonix.subscription.dto.SubscriptionResponseDto;
import com.careonix.subscription.service.SubscriptionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

/**
 * MVC tests for SubscriptionResource (controller) covering the create endpoint.
 */
@WebMvcTest(SubscriptionResource.class)
public class SubscriptionResourceTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SubscriptionService subscriptionService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void createSubscription_success() throws Exception {
        // Prepare request DTO
        SubscriptionRequestDto request = new SubscriptionRequestDto();
        request.setName("Basic");
        request.setDescription("Basic plan");
        request.setPrice(9.99);
        request.setDurationInMonths(1);

        // Expected response DTO
        SubscriptionResponseDto response = new SubscriptionResponseDto();
        response.setId(1L);
        response.setName("Basic");
        response.setDescription("Basic plan");
        response.setPrice(9.99);
        response.setDurationInMonths(1);

        Mockito.when(subscriptionService.create(Mockito.any(SubscriptionRequestDto.class)))
                .thenReturn(response);

        mockMvc.perform(post("/subscriptions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.name").value("Basic"));
    }
}
