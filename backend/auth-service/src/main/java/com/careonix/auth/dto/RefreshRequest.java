package com.careonix.auth.dto;
import lombok.Data;
import jakarta.validation.constraints.NotBlank;
@Data
public class RefreshRequest {
    @NotBlank
    private String refreshToken;
}
