package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/subscriptions")
@RequiredArgsConstructor
public class SubscriptionWebController {

    private final RestTemplate restTemplate;

    @Value("${services.subscription.url}")
    private String subscriptionServiceUrl;

    @PostMapping
    public ResponseEntity<Object> createSubscription(@RequestBody Object dto) {
        return restTemplate.postForEntity(subscriptionServiceUrl + "/subscriptions", dto, Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getSubscriptionById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(subscriptionServiceUrl + "/subscriptions/" + id, Object.class);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<Object> getSubscriptionsByUserId(@PathVariable("userId") Long userId) {
        return restTemplate.getForEntity(subscriptionServiceUrl + "/subscriptions/user/" + userId, Object.class);
    }

    @GetMapping("/user/{userId}/active")
    public ResponseEntity<Object> getActiveSubscriptionByUserId(@PathVariable("userId") Long userId) {
        return restTemplate.getForEntity(subscriptionServiceUrl + "/subscriptions/user/" + userId + "/active", Object.class);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Object> cancelSubscription(@PathVariable("id") Long id) {
        return restTemplate.exchange(subscriptionServiceUrl + "/subscriptions/" + id + "/cancel", HttpMethod.PUT, null, Object.class);
    }
}
