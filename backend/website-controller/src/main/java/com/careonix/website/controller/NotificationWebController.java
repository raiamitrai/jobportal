package com.careonix.website.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

@RestController
@RequestMapping("/web/notifications")
@RequiredArgsConstructor
public class NotificationWebController {

    private final RestTemplate restTemplate;

    @Value("${services.notification.url}")
    private String notificationServiceUrl;

    @PostMapping
    public ResponseEntity<Object> sendNotification(@RequestBody Object dto) {
        return restTemplate.postForEntity(notificationServiceUrl + "/notifications", dto, Object.class);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Object> getNotificationById(@PathVariable("id") Long id) {
        return restTemplate.getForEntity(notificationServiceUrl + "/notifications/" + id, Object.class);
    }

    @GetMapping("/recipient/{recipientId}")
    public ResponseEntity<Object> getNotificationsByRecipientId(@PathVariable("recipientId") Long recipientId) {
        return restTemplate.getForEntity(notificationServiceUrl + "/notifications/recipient/" + recipientId, Object.class);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Object> markAsRead(@PathVariable("id") Long id) {
        return restTemplate.exchange(notificationServiceUrl + "/notifications/" + id + "/read", HttpMethod.PUT, null, Object.class);
    }
}
