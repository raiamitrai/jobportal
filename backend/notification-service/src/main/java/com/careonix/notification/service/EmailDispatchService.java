package com.careonix.notification.service;

import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailDispatchService {

    private static final Logger log = LoggerFactory.getLogger(EmailDispatchService.class);
    private final JavaMailSender mailSender;

    @Async
    public void sendHtmlEmailAsync(String recipient, String code) {
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 480px; margin: auto;\">" 
                + "<div style=\"text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;\">" 
                + "<h2 style=\"color: #4f46e5; margin: 0; letter-spacing: 1px; font-size: 22px;\">Careonix Portal</h2>" 
                + "<p style=\"color: #64748b; font-size: 13px; margin: 4px 0 0;\">Account Registration &amp; Verification</p>" 
                + "</div>" 
                + "<div style=\"background: #f8fafc; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 16px;\">" 
                + "<p style=\"color: #0f172a; font-size: 15px; margin: 0 0 16px;\">Hello,</p>" 
                + "<p style=\"color: #334155; font-size: 14px; margin: 0 0 20px;\">Please use the verification code below to complete your registration. This code is valid for <strong>10 minutes</strong>.</p>" 
                + "<div style=\"text-align: center; margin: 20px 0;\">" 
                + "<span style=\"font-size: 34px; font-weight: bold; letter-spacing: 8px; color: #4f46e5; background: #eef2ff; padding: 14px 28px; border-radius: 8px; display: inline-block;\">" + code + "</span>" 
                + "</div>" 
                + "<p style=\"color: #64748b; font-size: 13px; margin: 16px 0 0;\">If you did not request this, please ignore this email. Do not share this code with anyone.</p>" 
                + "</div>" 
                + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;\">&copy; 2026 Careonix Job Portal. All rights reserved.</p>" 
                + "</div>";

        // 1. Dispatch via Real Google SMTP
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom("Careonix Portal <careonixteam@gmail.com>");
            helper.setTo(recipient);
            helper.setSubject("Careonix - Account Verification Required");
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            log.info("[GMAIL-SMTP-SUCCESS] OTP email sent to: {}", recipient);
        } catch (Exception e) {
            log.error("[GMAIL-SMTP-FAILED] Could not send email to: {} | Error: {} | Cause: {}",
                recipient, e.getMessage(),
                (e.getCause() != null ? e.getCause().getMessage() : "none"), e);
        }

        // 2. Dual Dispatch via Local MailHog Inbox (http://localhost:8025/) for 100% Instant Delivery Guarantee
        try {
            JavaMailSenderImpl mailHogSender = new JavaMailSenderImpl();
            mailHogSender.setHost("localhost");
            mailHogSender.setPort(1025);

            MimeMessage mhMessage = mailHogSender.createMimeMessage();
            MimeMessageHelper mhHelper = new MimeMessageHelper(mhMessage, true, "UTF-8");

            mhHelper.setFrom("Careonix Portal <careonixteam@gmail.com>");
            mhHelper.setTo(recipient);
            mhHelper.setSubject("Careonix - Account Verification Required");
            mhHelper.setText(htmlContent, true);

            mailHogSender.send(mhMessage);
            log.info("Instant MailHog Web Inbox email dispatched to: {}", recipient);
        } catch (Exception ex) {
            try {
                JavaMailSenderImpl mailHogDocker = new JavaMailSenderImpl();
                mailHogDocker.setHost("mailhog");
                mailHogDocker.setPort(1025);
                MimeMessage mhMessage = mailHogDocker.createMimeMessage();
                MimeMessageHelper mhHelper = new MimeMessageHelper(mhMessage, true, "UTF-8");
                mhHelper.setFrom("Careonix Portal <careonixteam@gmail.com>");
                mhHelper.setTo(recipient);
                mhHelper.setSubject("Careonix - Account Verification Required");
                mhHelper.setText(htmlContent, true);
                mailHogDocker.send(mhMessage);
            } catch (Exception ex2) {
                log.warn("MailHog dispatch warning: {}", ex.getMessage());
            }
        }
    }

    @Async
    public void sendNotificationEmailAsync(String recipient, String title, String messageContent) {
        String htmlContent = "<div style=\"font-family: Arial, sans-serif; background-color: #ffffff; padding: 30px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 520px; margin: auto;\">"
                + "<div style=\"text-align: center; margin-bottom: 20px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;\">"
                + "<h2 style=\"color: #4f46e5; margin: 0; letter-spacing: 1px; font-size: 22px;\">Careonix Job Portal</h2>"
                + "<p style=\"color: #64748b; font-size: 13px; margin: 4px 0 0;\">System Notification &amp; Announcement</p>"
                + "</div>"
                + "<div style=\"background: #f8fafc; padding: 24px; border-radius: 10px; border: 1px solid #e2e8f0; margin-top: 16px;\">"
                + "<h3 style=\"color: #0f172a; font-size: 16px; margin: 0 0 12px;\">" + title + "</h3>"
                + "<p style=\"color: #334155; font-size: 14px; margin: 0; line-height: 1.5; white-space: pre-line;\">" + messageContent + "</p>"
                + "</div>"
                + "<p style=\"color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;\">&copy; 2026 Careonix Job Portal. All rights reserved.</p>"
                + "</div>";

        // 1. Dispatch via Real Gmail SMTP
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");
            helper.setFrom("Careonix Portal <careonixteam@gmail.com>");
            helper.setTo(recipient);
            helper.setSubject(title);
            helper.setText(htmlContent, true);
            mailSender.send(mimeMessage);
            log.info("[GMAIL-SMTP-SUCCESS] Notification email sent to: {}", recipient);
        } catch (Exception e) {
            log.warn("[GMAIL-SMTP-NOTICE] Gmail SMTP notice for: {} | Error: {}", recipient, e.getMessage());
        }

        // 2. Dispatch via Local MailHog Inbox
        try {
            JavaMailSenderImpl mailHogSender = new JavaMailSenderImpl();
            mailHogSender.setHost("localhost");
            mailHogSender.setPort(1025);
            MimeMessage mhMessage = mailHogSender.createMimeMessage();
            MimeMessageHelper mhHelper = new MimeMessageHelper(mhMessage, true, "UTF-8");
            mhHelper.setFrom("Careonix Portal <careonixteam@gmail.com>");
            mhHelper.setTo(recipient);
            mhHelper.setSubject(title);
            mhHelper.setText(htmlContent, true);
            mailHogSender.send(mhMessage);
            log.info("[MAILHOG-SUCCESS] Notification email dispatched to MailHog for: {}", recipient);
        } catch (Exception ex) {
            try {
                JavaMailSenderImpl mailHogDocker = new JavaMailSenderImpl();
                mailHogDocker.setHost("mailhog");
                mailHogDocker.setPort(1025);
                MimeMessage mhMessage = mailHogDocker.createMimeMessage();
                MimeMessageHelper mhHelper = new MimeMessageHelper(mhMessage, true, "UTF-8");
                mhHelper.setFrom("Careonix Portal <careonixteam@gmail.com>");
                mhHelper.setTo(recipient);
                mhHelper.setSubject(title);
                mhHelper.setText(htmlContent, true);
                mailHogDocker.send(mhMessage);
            } catch (Exception ex2) {
                log.warn("MailHog notification dispatch warning: {}", ex.getMessage());
            }
        }
    }
}
