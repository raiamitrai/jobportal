package com.careonix.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

/**
 * Global CORS configuration for the API Gateway.
 * Supports environment-configurable allowed origins with safe wildcard fallback for production.
 */
@Configuration
public class GatewayCorsConfig {

    @Value("${cors.allowed.origins:${CORS_ALLOWED_ORIGINS:}}")
    private String customOrigins;

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();

        if (customOrigins != null && !customOrigins.trim().isEmpty()) {
            List<String> origins = Arrays.stream(customOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
            if (origins.contains("*")) {
                config.addAllowedOriginPattern("*");
            } else {
                config.setAllowedOrigins(origins);
            }
        } else {
            // Default dev & container origin patterns (supports any local dev or docker host)
            config.setAllowedOriginPatterns(List.of(
                "http://localhost:*",
                "http://127.0.0.1:*",
                "*"
            ));
        }

        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"));
        config.setAllowedHeaders(List.of("*"));
        config.setExposedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Total-Count", "X-Requested-With"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return new CorsWebFilter(source);
    }
}

