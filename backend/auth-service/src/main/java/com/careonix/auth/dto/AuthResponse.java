package com.careonix.auth.dto;
import lombok.Data;
@Data
public class AuthResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn; // seconds
}
