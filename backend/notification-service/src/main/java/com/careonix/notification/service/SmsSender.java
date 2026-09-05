package com.careonix.notification.service;

public interface SmsSender {
    /**
     * Sends an SMS message.
     *
     * @param phoneNumber destination phone number (in international format)
     * @param text        message body
     */
    void sendSms(String phoneNumber, String text);
}
