package com.careonix.auth.controller;
import com.careonix.auth.dto.*;
import com.careonix.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    @PostMapping("/register")
    public ResponseEntity<Void> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(@Valid @RequestBody RefreshRequest request) {
        return ResponseEntity.ok(authService.refreshToken(request));
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestParam String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/oauth/github")
    public ResponseEntity<?> githubOauthExchange(@RequestBody java.util.Map<String, String> payload) {
        String code = payload.get("code");
        String clientId = payload.get("clientId");
        String clientSecret = payload.get("clientSecret");

        if (code == null || code.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(java.util.Map.of("error", "Code is required"));
        }

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

            // 1. Request access_token from GitHub
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.Collections.singletonList(org.springframework.http.MediaType.APPLICATION_JSON));

            java.util.Map<String, String> body = new java.util.HashMap<>();
            body.put("client_id", clientId);
            body.put("client_secret", clientSecret);
            body.put("code", code);

            org.springframework.http.HttpEntity<java.util.Map<String, String>> request = new org.springframework.http.HttpEntity<>(body, headers);
            org.springframework.http.ResponseEntity<java.util.Map> tokenResponse = restTemplate.postForEntity(
                "https://github.com/login/oauth/access_token", request, java.util.Map.class
            );

            if (tokenResponse.getBody() == null || !tokenResponse.getBody().containsKey("access_token")) {
                return ResponseEntity.status(400).body(tokenResponse.getBody() != null ? tokenResponse.getBody() : java.util.Map.of("error", "Failed to retrieve access token"));
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // 2. Fetch User Profile from GitHub with accessToken
            org.springframework.http.HttpHeaders userHeaders = new org.springframework.http.HttpHeaders();
            userHeaders.set("Authorization", "Bearer " + accessToken);
            userHeaders.set("User-Agent", "Careonix-Job-Portal");

            org.springframework.http.HttpEntity<?> userRequest = new org.springframework.http.HttpEntity<>(userHeaders);
            org.springframework.http.ResponseEntity<java.util.Map> userResponse = restTemplate.exchange(
                "https://api.github.com/user", org.springframework.http.HttpMethod.GET, userRequest, java.util.Map.class
            );

            // 3. Fetch User primary email if missing in profile
            java.util.Map userData = userResponse.getBody();
            if (userData != null && (userData.get("email") == null || userData.get("email").toString().isEmpty())) {
                try {
                    org.springframework.http.ResponseEntity<java.util.List> emailsResponse = restTemplate.exchange(
                        "https://api.github.com/user/emails", org.springframework.http.HttpMethod.GET, userRequest, java.util.List.class
                    );
                    if (emailsResponse.getBody() != null) {
                        for (Object o : emailsResponse.getBody()) {
                            if (o instanceof java.util.Map) {
                                java.util.Map em = (java.util.Map) o;
                                if (Boolean.TRUE.equals(em.get("primary")) || Boolean.TRUE.equals(em.get("verified"))) {
                                    userData.put("email", em.get("email"));
                                    break;
                                }
                            }
                        }
                    }
                } catch (Exception ignored) {}
            }

            return ResponseEntity.ok(userData);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(java.util.Map.of("error", e.getMessage()));
        }
    }
}
