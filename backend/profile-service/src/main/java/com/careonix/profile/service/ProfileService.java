package com.careonix.profile.service;

import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;

import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProfileService {
    CandidateProfile addCandidateProfile(CandidateProfileDto dto);
    RecruiterProfile addRecruiterProfile(RecruiterProfileDto dto);
    UserProfile registerUserAccount(Map<String, Object> req);
    UserProfile updateProfile(Long profileId, Map<String, Object> updates);
    void deleteProfile(Long profileId);
    UserProfile getProfileById(Long profileId);
    UserProfile getProfileByEmail(String email);
    void deleteProfileByEmail(String email);
    Page<UserProfile> getAllProfiles(Pageable pageable);
}
