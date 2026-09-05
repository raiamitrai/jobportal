package com.careonix.profile.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "user_profiles")
@Inheritance(strategy = InheritanceType.JOINED)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public abstract class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long profileId;

    @Column(nullable = false)
    private String fullName;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = true)
    private String phone;

    @Column(nullable = true)
    private String password;

    @Column(nullable = false)
    private String role; // CANDIDATE or RECRUITER

    @Column(name = "approval_status")
    private String approvalStatus = "APPROVED";
}
