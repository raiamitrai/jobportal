package com.careonix.gateway;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Admin Health Aggregation Controller
 *
 * Exposes a single endpoint: GET /admin/health/all
 * that pings all microservices internally (no CORS issues)
 * and returns a consolidated health JSON to the frontend.
 *
 * Only accessible via the API Gateway — no direct browser→microservice calls needed.
 */
@RestController
@RequestMapping("/admin/health")
public class AdminHealthController {

    private final WebClient webClient;

    // Internal Docker network service URLs
    private static final List<Map<String, String>> SERVICES = List.of(
        Map.of("id", "api-gateway",          "name", "API Gateway",              "url", "http://localhost:8080/actuator/health",              "port", "8080",  "category", "Core"),
        Map.of("id", "eureka-server",         "name", "Eureka Discovery",         "url", "http://eureka-server:8761/actuator/health",           "port", "8761",  "category", "Core"),
        Map.of("id", "auth-service",          "name", "Auth & Security Service",  "url", "http://auth-service:8085/v3/api-docs",                "port", "8085",  "category", "Security"),
        Map.of("id", "job-service",           "name", "Job Service",              "url", "http://job-service:8081/actuator/health",             "port", "8081",  "category", "Business"),
        Map.of("id", "profile-service",       "name", "Profile Service",          "url", "http://profile-service:8082/actuator/health",         "port", "8082",  "category", "Business"),
        Map.of("id", "application-service",   "name", "Application Service",      "url", "http://application-service:8083/actuator/health",     "port", "8083",  "category", "Business"),
        Map.of("id", "notification-service",  "name", "Notification Service",     "url", "http://notification-service:8086/actuator/health",    "port", "8086",  "category", "Business"),
        Map.of("id", "subscription-service",  "name", "Subscription Service",     "url", "http://subscription-service:8087/v3/api-docs",         "port", "8087",  "category", "Business"),
        Map.of("id", "interview-service",     "name", "Interview Service",        "url", "http://interview-service:8089/actuator/health",       "port", "8089",  "category", "Business"),
        Map.of("id", "analytics-service",     "name", "Analytics Service",        "url", "http://analytics-service:8088/actuator/health",       "port", "8088",  "category", "Analytics"),
        Map.of("id", "rabbitmq",              "name", "RabbitMQ Message Broker",  "url", System.getenv("RABBITMQ_HEALTH_URL") != null ? System.getenv("RABBITMQ_HEALTH_URL") : "http://guest:guest@rabbitmq:15672/api/healthchecks/node", "port", "15672", "category", "Infrastructure"),
        Map.of("id", "mailhog",               "name", "Email Service (MailHog)",  "url", "http://mailhog:8025/api/v2/messages?limit=1",         "port", "8025",  "category", "Infrastructure")
    );

    // Services NOT running container in Docker (empty)
    private static final List<Map<String, String>> NOT_DEPLOYED = List.of();

    public AdminHealthController(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder
            .codecs(config -> config.defaultCodecs().maxInMemorySize(512 * 1024))
            .build();
    }

    @GetMapping("/all")
    public Mono<Map<String, Object>> getAllServiceHealth() {
        long startAll = System.currentTimeMillis();

        List<Mono<Map<String, Object>>> checks = SERVICES.stream().map(svc -> {
            long startTime = System.currentTimeMillis();
            String url = svc.get("url");

            return webClient.get()
                .uri(url)
                .retrieve()
                .onStatus(status -> true, response -> {
                    // Accept any HTTP status — we'll interpret it ourselves
                    return Mono.empty();
                })
                .toBodilessEntity()
                .timeout(Duration.ofSeconds(6))
                .flatMap(entity -> {
                    long rt = System.currentTimeMillis() - startTime;
                    int httpCode = entity.getStatusCode().value();
                    // MailHog returns 200 with JSON array — treat any 2xx as healthy
                    String status;
                    if (httpCode >= 200 && httpCode < 300) {
                        status = rt > 3000 ? "warning" : "healthy";
                    } else if (httpCode == 401 || httpCode == 404) {
                        // 401/404 means service container is UP and responding to HTTP
                        status = rt > 3000 ? "warning" : "healthy";
                    } else if (httpCode >= 500) {
                        status = "critical";
                    } else {
                        status = rt > 2000 ? "warning" : "healthy";
                    }

                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("id",           svc.get("id"));
                    result.put("name",         svc.get("name"));
                    result.put("port",         svc.get("port"));
                    result.put("category",     svc.get("category"));
                    result.put("status",       status);
                    result.put("responseTime", rt);
                    result.put("httpStatus",   httpCode);
                    result.put("checkedAt",    Instant.now().toString());
                    return Mono.just((Map<String, Object>) result);
                })
                .onErrorResume(ex -> {
                    long rt = System.currentTimeMillis() - startTime;
                    // Connection refused = service is DOWN; DNS resolve fail = not deployed
                    boolean notDeployed = ex.getMessage() != null && ex.getMessage().contains("Failed to resolve");
                    Map<String, Object> result = new LinkedHashMap<>();
                    result.put("id",           svc.get("id"));
                    result.put("name",         svc.get("name"));
                    result.put("port",         svc.get("port"));
                    result.put("category",     svc.get("category"));
                    result.put("status",       notDeployed ? "not-deployed" : "critical");
                    result.put("responseTime", rt);
                    result.put("httpStatus",   0);
                    result.put("error",        notDeployed ? "Service not deployed in Docker" : ex.getMessage());
                    result.put("checkedAt",    Instant.now().toString());
                    return Mono.just(result);
                });
        }).toList();

        return Mono.zip(checks, results -> Arrays.stream(results)
                .map(r -> (Map<String, Object>) r)
                .toList())
            .map(serviceList -> {
                long healthy  = serviceList.stream().filter(s -> "healthy".equals(s.get("status"))).count();
                long warning  = serviceList.stream().filter(s -> "warning".equals(s.get("status"))).count();
                long critical = serviceList.stream().filter(s -> "critical".equals(s.get("status"))).count();

                // Also add DB services (no actuator — just mark as no-endpoint)
                List<Map<String, Object>> allServices = new ArrayList<>(serviceList);

                // Append NOT_DEPLOYED services
                NOT_DEPLOYED.forEach(svc -> allServices.add(Map.of(
                    "id",       svc.get("id"),
                    "name",     svc.get("name"),
                    "port",     svc.get("port"),
                    "category", svc.get("category"),
                    "status",   "not-deployed",
                    "error",    "Container not running in Docker Compose",
                    "checkedAt",Instant.now().toString()
                )));

                allServices.add(Map.of("id","mysql-wamp","name","MySQL Database","port","3306","category","Database","status","no-endpoint","checkedAt",Instant.now().toString()));
                allServices.add(Map.of("id","postgresql","name","PostgreSQL Database","port","5432","category","Database","status","no-endpoint","checkedAt",Instant.now().toString()));

                long criticalFinal = allServices.stream().filter(s -> "critical".equals(s.get("status"))).count();
                long warningFinal  = allServices.stream().filter(s -> "warning".equals(s.get("status"))).count();
                long healthyFinal  = allServices.stream().filter(s -> "healthy".equals(s.get("status"))).count();
                String overall = criticalFinal > 0 ? "critical" : warningFinal > 0 ? "warning" : "healthy";

                Map<String, Object> response = new LinkedHashMap<>();
                response.put("overall",        overall);
                response.put("healthyCount",   healthy);
                response.put("warningCount",   warning);
                response.put("criticalCount",  critical);
                response.put("totalServices",  allServices.size());
                response.put("checkDurationMs", System.currentTimeMillis() - startAll);
                response.put("timestamp",      Instant.now().toString());
                response.put("services",       allServices);
                return response;
            });
    }

    /**
     * Simple self-health check for the gateway itself.
     * Always returns UP since if this responds, the gateway is running.
     */
    @GetMapping("/gateway")
    public Map<String, Object> gatewayHealth() {
        return Map.of(
            "id",     "api-gateway",
            "status", "healthy",
            "responseTime", 1,
            "httpStatus",   200,
            "checkedAt",    Instant.now().toString()
        );
    }
}
