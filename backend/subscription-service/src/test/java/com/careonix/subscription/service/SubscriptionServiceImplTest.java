package com.careonix.subscription.service;

import com.careonix.subscription.dto.SubscriptionRequestDto;
import com.careonix.subscription.dto.SubscriptionResponseDto;
import com.careonix.subscription.entity.Subscription;
import com.careonix.subscription.exception.SubscriptionNotFoundException;
import com.careonix.subscription.repository.SubscriptionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

class SubscriptionServiceImplTest {

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @Mock
    private RabbitTemplate rabbitTemplate;

    @InjectMocks
    private SubscriptionServiceImpl subscriptionService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void create_success() {
        SubscriptionRequestDto dto = SubscriptionRequestDto.builder()
                .name("Monthly Pro")
                .description("30-Day Pro Plan")
                .price(1999.0)
                .durationInMonths(1)
                .build();

        Subscription saved = Subscription.builder()
                .id(1L)
                .name("Monthly Pro")
                .description("30-Day Pro Plan")
                .price(1999.0)
                .durationInMonths(1)
                .build();

        when(subscriptionRepository.save(any(Subscription.class))).thenReturn(saved);

        SubscriptionResponseDto response = subscriptionService.create(dto);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("Monthly Pro", response.getName());
        assertEquals(1999.0, response.getPrice());
        verify(subscriptionRepository, times(1)).save(any(Subscription.class));
        verify(rabbitTemplate, times(1)).convertAndSend(eq("subscription.events"), eq("subscription.created"), eq(1L));
    }

    @Test
    void get_found() {
        Long id = 1L;
        Subscription subscription = Subscription.builder()
                .id(id)
                .name("Monthly Pro")
                .description("30-Day Pro Plan")
                .price(1999.0)
                .durationInMonths(1)
                .build();

        when(subscriptionRepository.findById(id)).thenReturn(Optional.of(subscription));

        SubscriptionResponseDto response = subscriptionService.get(id);

        assertNotNull(response);
        assertEquals(id, response.getId());
        assertEquals("Monthly Pro", response.getName());
    }

    @Test
    void get_notFound() {
        Long id = 99L;
        when(subscriptionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(SubscriptionNotFoundException.class, () -> subscriptionService.get(id));
    }

    @Test
    void list_paginated() {
        Pageable pageable = mock(Pageable.class);
        Subscription subscription = Subscription.builder()
                .id(1L)
                .name("Monthly Pro")
                .description("30-Day Pro Plan")
                .price(1999.0)
                .durationInMonths(1)
                .build();

        Page<Subscription> page = new PageImpl<>(List.of(subscription));
        when(subscriptionRepository.findAll(pageable)).thenReturn(page);

        Page<SubscriptionResponseDto> result = subscriptionService.list(pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("Monthly Pro", result.getContent().get(0).getName());
    }

    @Test
    void update_success() {
        Long id = 1L;
        Subscription existing = Subscription.builder()
                .id(id)
                .name("Old Plan")
                .description("Old Description")
                .price(999.0)
                .durationInMonths(1)
                .build();

        SubscriptionRequestDto updateDto = SubscriptionRequestDto.builder()
                .name("Updated Plan")
                .description("Updated Description")
                .price(1499.0)
                .durationInMonths(2)
                .build();

        Subscription saved = Subscription.builder()
                .id(id)
                .name("Updated Plan")
                .description("Updated Description")
                .price(1499.0)
                .durationInMonths(2)
                .build();

        when(subscriptionRepository.findById(id)).thenReturn(Optional.of(existing));
        when(subscriptionRepository.save(existing)).thenReturn(saved);

        SubscriptionResponseDto response = subscriptionService.update(id, updateDto);

        assertNotNull(response);
        assertEquals("Updated Plan", response.getName());
        assertEquals(1499.0, response.getPrice());
        verify(subscriptionRepository, times(1)).save(existing);
    }

    @Test
    void update_notFound() {
        Long id = 99L;
        SubscriptionRequestDto updateDto = SubscriptionRequestDto.builder()
                .name("Updated Plan")
                .price(1499.0)
                .durationInMonths(2)
                .build();

        when(subscriptionRepository.findById(id)).thenReturn(Optional.empty());

        assertThrows(SubscriptionNotFoundException.class, () -> subscriptionService.update(id, updateDto));
    }

    @Test
    void delete_success() {
        Long id = 1L;
        when(subscriptionRepository.existsById(id)).thenReturn(true);
        doNothing().when(subscriptionRepository).deleteById(id);

        subscriptionService.delete(id);

        verify(subscriptionRepository, times(1)).deleteById(id);
    }

    @Test
    void delete_notFound() {
        Long id = 99L;
        when(subscriptionRepository.existsById(id)).thenReturn(false);

        assertThrows(SubscriptionNotFoundException.class, () -> subscriptionService.delete(id));
    }
}
