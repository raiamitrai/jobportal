package com.careonix.auth.service;

import com.careonix.auth.dto.*;
import com.careonix.auth.entity.*;
import com.careonix.auth.enums.UserRole;
import com.careonix.auth.exception.*;
import com.careonix.auth.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepo;
    private final RefreshTokenRepository refreshRepo;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Value("${jwt.access.expiration-minutes:15}")
    private long accessExpMinutes;

    @Value("${jwt.refresh.expiration-days:7}")
    private long refreshExpDays;

    @Override
    public void register(RegisterRequest request) {
        if (userRepo.findByEmail(request.getEmail()).isPresent()) {
            throw new UserAlreadyExistsException(request.getEmail());
        }
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setRole(UserRole.CANDIDATE);
        userRepo.save(user);
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        User user = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException());
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }
        String accessToken = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        RefreshToken refreshToken = createRefreshToken(user);
        AuthResponse resp = new AuthResponse();
        resp.setAccessToken(accessToken);
        resp.setRefreshToken(refreshToken.getToken());
        resp.setExpiresIn(accessExpMinutes * 60);
        return resp;
    }

    @Override
    public AuthResponse refreshToken(RefreshRequest request) {
        RefreshToken stored = refreshRepo.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new InvalidRefreshTokenException());
        if (stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidRefreshTokenException();
        }
        User user = stored.getUser();
        String newAccess = jwtService.generateToken(user.getEmail(), user.getRole().name(), user.getId());
        AuthResponse resp = new AuthResponse();
        resp.setAccessToken(newAccess);
        resp.setRefreshToken(stored.getToken());
        resp.setExpiresIn(accessExpMinutes * 60);
        return resp;
    }

    @Override
    public void logout(String token) {
        refreshRepo.findByToken(token).ifPresent(refreshRepo::delete);
    }

    private RefreshToken createRefreshToken(User user) {
        RefreshToken token = new RefreshToken();
        token.setUser(user);
        token.setToken(java.util.UUID.randomUUID().toString());
        token.setExpiryDate(LocalDateTime.now().plusDays(refreshExpDays));
        return refreshRepo.save(token);
    }
}
