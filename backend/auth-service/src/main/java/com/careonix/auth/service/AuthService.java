package com.careonix.auth.service;
import com.careonix.auth.dto.*;
public interface AuthService {
    void register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse refreshToken(RefreshRequest request);
    void logout(String refreshToken);
}
