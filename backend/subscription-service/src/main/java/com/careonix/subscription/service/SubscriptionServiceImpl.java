package com.careonix.subscription.service;

import com.careonix.subscription.dto.SubscriptionRequestDto;
import com.careonix.subscription.dto.SubscriptionResponseDto;
import com.careonix.subscription.entity.Subscription;
import com.careonix.subscription.exception.SubscriptionNotFoundException;
import com.careonix.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository repository;
    private final ModelMapper mapper = new ModelMapper();
    private final RabbitTemplate rabbitTemplate;

    @Override
    @Transactional
    public SubscriptionResponseDto create(SubscriptionRequestDto dto) {
        Subscription entity = mapper.map(dto, Subscription.class);
        Subscription saved = repository.save(entity);
        rabbitTemplate.convertAndSend("subscription.events", "subscription.created", saved.getId());
        return mapper.map(saved, SubscriptionResponseDto.class);
    }

    @Override
    public SubscriptionResponseDto get(Long id) {
        Subscription entity = repository.findById(id)
                .orElseThrow(() -> new SubscriptionNotFoundException(id));
        return mapper.map(entity, SubscriptionResponseDto.class);
    }

    @Override
    public Page<SubscriptionResponseDto> list(Pageable pageable) {
        Page<Subscription> page = repository.findAll(pageable);
        List<SubscriptionResponseDto> content = page.getContent()
                .stream()
                .map(s -> mapper.map(s, SubscriptionResponseDto.class))
                .collect(Collectors.toList());
        return new PageImpl<>(content, pageable, page.getTotalElements());
    }

    @Override
    @Transactional
    public SubscriptionResponseDto update(Long id, SubscriptionRequestDto dto) {
        Subscription existing = repository.findById(id)
                .orElseThrow(() -> new SubscriptionNotFoundException(id));
        existing.setName(dto.getName());
        existing.setDescription(dto.getDescription());
        existing.setPrice(dto.getPrice());
        existing.setDurationInMonths(dto.getDurationInMonths());
        Subscription saved = repository.save(existing);
        return mapper.map(saved, SubscriptionResponseDto.class);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new SubscriptionNotFoundException(id);
        }
        repository.deleteById(id);
    }
}
