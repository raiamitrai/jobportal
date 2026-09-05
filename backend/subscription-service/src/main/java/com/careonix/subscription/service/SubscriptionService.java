package com.careonix.subscription.service;

import com.careonix.subscription.dto.SubscriptionRequestDto;
import com.careonix.subscription.dto.SubscriptionResponseDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SubscriptionService {
    SubscriptionResponseDto create(SubscriptionRequestDto dto);
    SubscriptionResponseDto get(Long id);
    Page<SubscriptionResponseDto> list(Pageable pageable);
    SubscriptionResponseDto update(Long id, SubscriptionRequestDto dto);
    void delete(Long id);
}
