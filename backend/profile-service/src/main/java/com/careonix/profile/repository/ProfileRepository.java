package com.careonix.profile.repository;

import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByEmail(String email);
    List<UserProfile> findAllByRole(String role);

    @Query("SELECT cp FROM CandidateProfile cp WHERE cp.mobile = :mobile")
    Optional<CandidateProfile> findByMobile(Long mobile);
}

