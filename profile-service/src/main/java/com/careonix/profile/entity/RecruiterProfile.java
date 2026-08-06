package com.careonix.profile.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "recruiter_profiles")
@PrimaryKeyJoinColumn(name = "profile_id")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(callSuper = true)
public class RecruiterProfile extends UserProfile {

    private String companyName;
    private String companySize;
    private String industry;
    private String website;
}

