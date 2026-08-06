package com.careonix.profile.service;

import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;

import java.util.List;
import java.util.Map;

public interface ProfileService {
    CandidateProfile addCandidateProfile(CandidateProfileDto dto);
    RecruiterProfile addRecruiterProfile(RecruiterProfileDto dto);
    UserProfile updateProfile(Long profileId, Map<String, Object> updates);
    void deleteProfile(Long profileId);
    UserProfile getProfileById(Long profileId);
    UserProfile getProfileByEmail(String email);
    List<UserProfile> getAllProfiles();
}

