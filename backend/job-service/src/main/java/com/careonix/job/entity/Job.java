package com.careonix.job.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "jobs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long jobId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String type; // FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP

    @Column(nullable = false)
    private String location;

    private String companyName;

    @Column(length = 4000)
    private String description;

    private double salaryMin;

    private double salaryMax;

    @ElementCollection
    @CollectionTable(name = "job_skills", joinColumns = @JoinColumn(name = "job_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();

    private int experienceRequired;

    @Column(nullable = false)
    private Long postedBy; // Recruiter profileId

    @Column(nullable = false)
    private String status; // ACTIVE, PAUSED, CLOSED

    @Column(nullable = false)
    private LocalDate postedAt;

    @PrePersist
    protected void onCreate() {
        this.postedAt = LocalDate.now();
        if (this.status == null) {
            this.status = "ACTIVE";
        }
    }
}

