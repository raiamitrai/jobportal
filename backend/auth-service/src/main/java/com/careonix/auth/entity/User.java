package com.careonix.auth.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import com.careonix.auth.enums.UserRole;
@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(nullable = false)
    private String passwordHash;
    private String firstName;
    private String lastName;
    @Enumerated(EnumType.STRING)
    private UserRole role;
    private boolean enabled = true;
    private LocalDateTime createdAt = LocalDateTime.now();
}
