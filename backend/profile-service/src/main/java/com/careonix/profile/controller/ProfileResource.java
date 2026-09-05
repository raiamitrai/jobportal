package com.careonix.profile.controller;

import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;
import com.careonix.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileResource {

    private final ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<UserProfile> registerUserAccount(@RequestBody Map<String, Object> req) {
        return ResponseEntity.ok(profileService.registerUserAccount(req));
    }

    @PostMapping("/candidate")
    public ResponseEntity<CandidateProfile> createCandidateProfile(@Valid @RequestBody CandidateProfileDto dto) {
        return ResponseEntity.ok(profileService.addCandidateProfile(dto));
    }

    @PostMapping("/recruiter")
    public ResponseEntity<RecruiterProfile> createRecruiterProfile(@Valid @RequestBody RecruiterProfileDto dto) {
        return ResponseEntity.ok(profileService.addRecruiterProfile(dto));
    }

    @GetMapping
    public ResponseEntity<Page<UserProfile>> getAllProfiles(Pageable pageable) {
        return ResponseEntity.ok(profileService.getAllProfiles(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserProfile> getProfileById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(profileService.getProfileById(id));
    }

    @GetMapping("/email")
    public ResponseEntity<UserProfile> getProfileByEmail(@RequestParam("email") String email) {
        return ResponseEntity.ok(profileService.getProfileByEmail(email));
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserProfile> updateProfile(@PathVariable("id") Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(profileService.updateProfile(id, updates));
    }

    @PutMapping("/status")
    public ResponseEntity<UserProfile> updateProfileStatusByEmail(@RequestParam("email") String email, @RequestParam("status") String status) {
        UserProfile p = profileService.getProfileByEmail(email);
        if (p != null) {
            return ResponseEntity.ok(profileService.updateProfile(p.getProfileId(), Map.of("approvalStatus", status)));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProfile(@PathVariable("id") Long id) {
        profileService.deleteProfile(id);
        Map<String, String> response = Map.of("message", "Profile deleted successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> deleteProfileByEmail(@RequestParam("email") String email) {
        if (email != null && !email.trim().isEmpty()) {
            profileService.deleteProfileByEmail(email);
        }
        return ResponseEntity.ok(Map.of("message", "Profile delete completed for email: " + email));
    }
}
