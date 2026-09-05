package com.careonix.profile.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

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
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private static final Logger log = LoggerFactory.getLogger(ProfileServiceImpl.class);

    private final ProfileRepository profileRepository;

    @Override
    @Transactional
    public CandidateProfile addCandidateProfile(CandidateProfileDto dto) {
        log.info("Adding candidate profile for email: {}", dto.getEmail());
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

        CandidateProfile saved = profileRepository.save(profile);
        log.info("Candidate profile saved with id: {}", saved.getProfileId());
        return saved;
    }

    @Override
    @Transactional
    public RecruiterProfile addRecruiterProfile(RecruiterProfileDto dto) {
        log.info("Adding recruiter profile for email: {}", dto.getEmail());
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
    public UserProfile registerUserAccount(Map<String, Object> req) {
        String email = (String) req.get("email");
        String phone = (String) req.get("phone");
        String password = (String) req.get("password");
        String name = (String) req.get("name");
        String company = (String) req.get("company");
        String accountType = (String) req.getOrDefault("accountType", "candidate");

        log.info("Registering user account for email: {}, accountType: {}", email, accountType);

        if (email != null && !email.trim().isEmpty()) {
            Optional<UserProfile> existingOpt = profileRepository.findByEmail(email.trim().toLowerCase());
            if (existingOpt.isPresent()) {
                UserProfile existing = existingOpt.get();
                if (name != null && !name.trim().isEmpty()) {
                    existing.setFullName(name.trim());
                }
                if (password != null && !password.trim().isEmpty()) {
                    existing.setPassword(password);
                }
                if (existing instanceof RecruiterProfile && company != null) {
                    ((RecruiterProfile) existing).setCompanyName(company);
                }
                return profileRepository.save(existing);
            }
        }

        if ("recruiter".equalsIgnoreCase(accountType)) {
            RecruiterProfile rp = new RecruiterProfile();
            rp.setFullName(name != null ? name : "Recruiter User");
            rp.setEmail(email != null ? email.trim().toLowerCase() : (phone + "@careonix.mobile"));
            rp.setPhone(phone);
            rp.setPassword(password);
            rp.setRole("RECRUITER");
            rp.setCompanyName(company != null ? company : "Careonix Employer");
            rp.setApprovalStatus("PENDING_APPROVAL");
            return profileRepository.save(rp);
        } else {
            CandidateProfile cp = new CandidateProfile();
            cp.setFullName(name != null ? name : "Candidate User");
            cp.setEmail(email != null ? email.trim().toLowerCase() : (phone + "@careonix.mobile"));
            cp.setPhone(phone);
            cp.setPassword(password);
            cp.setRole("CANDIDATE");
            cp.setApprovalStatus("APPROVED");
            return profileRepository.save(cp);
        }
    }

    @Override
    @Transactional
    public UserProfile updateProfile(Long profileId, Map<String, Object> updates) {
        log.info("Updating profile id: {} with updates: {}", profileId, updates);
        UserProfile userProfile = profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with ID: " + profileId));

        if (updates.containsKey("fullName")) {
            userProfile.setFullName((String) updates.get("fullName"));
        }
        if (updates.containsKey("approvalStatus")) {
            userProfile.setApprovalStatus((String) updates.get("approvalStatus"));
        }
        if (updates.containsKey("approval_status")) {
            userProfile.setApprovalStatus((String) updates.get("approval_status"));
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

        UserProfile updated = profileRepository.save(userProfile);
        log.info("Profile id: {} updated successfully", profileId);
        return updated;
    }

    @Override
    @Transactional
    public void deleteProfile(Long profileId) {
        log.info("Deleting profile id: {}", profileId);
        if (!profileRepository.existsById(profileId)) {
            log.warn("Attempted to delete non-existent profile id: {}", profileId);
            throw new ProfileNotFoundException("Profile not found with ID: " + profileId);
        }
        profileRepository.deleteById(profileId);
    }

    @Override
    public UserProfile getProfileById(Long profileId) {
        log.info("Fetching profile by id: {}", profileId);
        return profileRepository.findById(profileId)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with ID: " + profileId));
    }

    @Override
    public UserProfile getProfileByEmail(String email) {
        log.info("Fetching profile by email: {}", email);
        return profileRepository.findByEmail(email)
                .orElseThrow(() -> new ProfileNotFoundException("Profile not found with email: " + email));
    }

    @Override
    @Transactional
    public void deleteProfileByEmail(String email) {
        if (email == null || email.trim().isEmpty()) return;
        String cleanEmail = email.trim().toLowerCase();
        log.info("Deleting profile by email: {}", cleanEmail);
        profileRepository.findByEmail(cleanEmail).ifPresent(p -> {
            profileRepository.deleteById(p.getProfileId());
            log.info("Deleted profile id: {} for email: {}", p.getProfileId(), cleanEmail);
        });
    }

    @Override
    public Page<UserProfile> getAllProfiles(Pageable pageable) {
        log.info("Fetching all profiles with pagination");
        return profileRepository.findAll(pageable);
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
