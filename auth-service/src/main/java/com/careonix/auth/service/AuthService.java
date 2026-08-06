package com.careonix.auth.service;

import com.careonix.auth.dto.AuthResponse;
import com.careonix.auth.dto.LoginRequest;
import com.careonix.auth.dto.RegisterRequest;
import com.careonix.auth.entity.UserCredential;

public interface AuthService {
    UserCredential register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    void logout(String token);
    boolean validateToken(String token);
    AuthResponse refreshToken(String refreshToken);
    UserCredential getByEmail(String email);
}

