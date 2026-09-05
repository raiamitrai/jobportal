package com.careonix.subscription.controller;

import com.careonix.subscription.dto.SubscriptionRequestDto;
import com.careonix.subscription.dto.SubscriptionResponseDto;
import com.careonix.subscription.service.SubscriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/subscriptions")
@RequiredArgsConstructor
public class SubscriptionResource {

    private final SubscriptionService subscriptionService;

    @PostMapping
    public ResponseEntity<SubscriptionResponseDto> create(@Valid @RequestBody SubscriptionRequestDto dto) {
        return ResponseEntity.ok(subscriptionService.create(dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDto> get(@PathVariable Long id) {
        return ResponseEntity.ok(subscriptionService.get(id));
    }

    @GetMapping
    public ResponseEntity<Page<SubscriptionResponseDto>> list(Pageable pageable) {
        return ResponseEntity.ok(subscriptionService.list(pageable));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SubscriptionResponseDto> update(@PathVariable Long id, @Valid @RequestBody SubscriptionRequestDto dto) {
        return ResponseEntity.ok(subscriptionService.update(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        subscriptionService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Subscription deleted successfully"));
    }
}
