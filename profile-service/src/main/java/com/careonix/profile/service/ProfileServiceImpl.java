package com.careonix.profile.service;

import com.careonix.profile.dto.AddressDto;
import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import com.careonix.profile.entity.Address;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;
import com.careonix.profile.exception.ProfileNotFoundException;
import com.careonix.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final ProfileRepository profileRepository;

    @Override
    @Transactional
    public CandidateProfile addCandidateProfile(CandidateProfileDto dto) {
        CandidateProfile profile = new CandidateProfile();
        profile.setFullName(dto.getFullName());
        profile.setEmail(dto.getEmail());
        profile.setRole("CANDIDATE");
        profile.setMobile(dto.getMobile());
        profile.setSkills(dto.getSkills() != null ? dto.getSkills() : new ArrayList<>());
        profile.setExperience(dto.getExperience());
        profile.setResumeUrl(dto.getResumeUrl());

        if (dto.getAddresses() != null) {
            List<Address> addresses = dto.getAddresses().stream()
                    .map(this::mapAddressDtoToEntity)
                    .collect(Collectors.toList());
            profile.setAddresses(addresses);
        }

        return profileRepository.save(profile);
    }

    @Override
    @Transactional
    public RecruiterProfile addRecruiterProfile(RecruiterProfileDto dto) {
        RecruiterProfile profile = new RecruiterProfile();
        profile.setFullName(dto.getFullName());
        profile.setEmail(dto.getEmail());
        profile.setRole("RECRUITER");
        profile.setCompanyName(dto.getCompanyName());
        profile.setCompanySize(dto.getCompanySize());
        profile.setIndustry(dto.getIndustry());
        profile.setWebsite(dto.getWebsite());

        return profileRepository.save(profile);
    }

    @Override
    @Transactional
    public UserProfile updateProfile(Long profileId, Map<String, Object> updates) {
        UserProfile userProfile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with ID: " + profileId));

        if (updates.containsKey("fullName")) {
            userProfile.setFullName((String) updates.get("fullName"));
        }

        if (userProfile instanceof CandidateProfile) {
            CandidateProfile cp = (CandidateProfile) userProfile;
            if (updates.containsKey("mobile")) {
                cp.setMobile(updates.get("mobile") != null ? Long.valueOf(updates.get("mobile").toString()) : null);
            }
            if (updates.containsKey("skills")) {
                cp.setSkills((List<String>) updates.get("skills"));
            }
            if (updates.containsKey("experience")) {
                cp.setExperience((Integer) updates.get("experience"));
            }
            if (updates.containsKey("resumeUrl")) {
                cp.setResumeUrl((String) updates.get("resumeUrl"));
            }
        } else if (userProfile instanceof RecruiterProfile) {
            RecruiterProfile rp = (RecruiterProfile) userProfile;
            if (updates.containsKey("companyName")) {
                rp.setCompanyName((String) updates.get("companyName"));
            }
            if (updates.containsKey("companySize")) {
                rp.setCompanySize((String) updates.get("companySize"));
            }
            if (updates.containsKey("industry")) {
                rp.setIndustry((String) updates.get("industry"));
            }
            if (updates.containsKey("website")) {
                rp.setWebsite((String) updates.get("website"));
            }
        }

        return profileRepository.save(userProfile);
    }

    @Override
    @Transactional
    public void deleteProfile(Long profileId) {
        if (!profileRepository.existsById(profileId)) {
            throw new ProfileNotFoundException("Profile not found with ID: " + profileId);
        }
        profileRepository.deleteById(profileId);
    }

    @Override
    public UserProfile getProfileById(Long profileId) {
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with ID: " + profileId));
    }

    @Override
    public UserProfile getProfileByEmail(String email) {
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with email: " + email));
    }

    @Override
    public List<UserProfile> getAllProfiles() {
        return profileRepository.findAll();
    }

    private Address mapAddressDtoToEntity(AddressDto dto) {
        return Address.builder()
                .houseNo(dto.getHouseNo())
                .street(dto.getStreet())
                .city(dto.getCity())
                .state(dto.getState())
                .pincode(dto.getPincode())
                .build();
    }
}

