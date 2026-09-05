package com.careonix.notification.service.impl;

import com.careonix.notification.service.SmsSender;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * SMS Gateway Service implementation.
 * Ready for Fast2SMS / SMS Gateway provider integration upon live deployment.
 */
@Slf4j
@Component
public class MockSmsSender implements SmsSender {

    @Override
    public void sendSms(String phoneNumber, String text) {
        log.info("[SMS GATEWAY DISPATCH] Target Mobile Phone: {} | Payload: {}", phoneNumber, text);
    }
}
