package com.careonix.auth.service;

import com.careonix.auth.dto.AuthResponse;
import com.careonix.auth.dto.LoginRequest;
import com.careonix.auth.dto.RegisterRequest;
import com.careonix.auth.entity.UserCredential;
import com.careonix.auth.exception.AuthException;
import com.careonix.auth.repository.AuthRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthRepository authRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    // Simple in-memory set to blacklist logged out tokens for verification
    private final Set<String> blacklistedTokens = new HashSet<>();

    @Override
    public UserCredential register(RegisterRequest request) {
        if (authRepository.existsByEmail(request.getEmail())) {
            throw new AuthException("User with this email already exists");
        }

        UserCredential user = UserCredential.builder()
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole().toUpperCase())
                .provider("LOCAL")
                .build();

        return authRepository.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        UserCredential user = authRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new AuthException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole(), user.getUserId());
        String refreshToken = jwtService.generateRefreshToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .email(user.getEmail())
                .role(user.getRole())
                .userId(user.getUserId())
                .build();
    }

    @Override
    public void logout(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        blacklistedTokens.add(token);
    }

    @Override
    public boolean validateToken(String token) {
        if (token != null && token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        if (blacklistedTokens.contains(token)) {
            return false;
        }
        try {
            String email = jwtService.extractEmail(token);
            return jwtService.isTokenValid(token, email);
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    public AuthResponse refreshToken(String refreshToken) {
        if (refreshToken != null && refreshToken.startsWith("Bearer ")) {
            refreshToken = refreshToken.substring(7);
        }
        try {
            String email = jwtService.extractEmail(refreshToken);
            if (jwtService.isTokenValid(refreshToken, email)) {
                UserCredential user = authRepository.findByEmail(email)
                        .orElseThrow(() -> new AuthException("User not found"));

                String newAccessToken = jwtService.generateToken(user.getEmail(), user.getRole(), user.getUserId());
                String newRefreshToken = jwtService.generateRefreshToken(user.getEmail());

                return AuthResponse.builder()
                        .token(newAccessToken)
                        .refreshToken(newRefreshToken)
                        .email(user.getEmail())
                        .role(user.getRole())
                        .userId(user.getUserId())
                        .build();
            }
        } catch (Exception e) {
            throw new AuthException("Invalid refresh token");
        }
        throw new AuthException("Invalid refresh token");
    }

    @Override
    public UserCredential getByEmail(String email) {
        return authRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("User not found"));
    }
}

