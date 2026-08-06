package com.careonix.profile.controller;

import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;
import com.careonix.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/profiles")
@RequiredArgsConstructor
public class ProfileResource {

    private final ProfileService profileService;

    @PostMapping("/candidate")
    public ResponseEntity<CandidateProfile> createCandidateProfile(@Valid @RequestBody CandidateProfileDto dto) {
        return ResponseEntity.ok(profileService.addCandidateProfile(dto));
    }

    @PostMapping("/recruiter")
    public ResponseEntity<RecruiterProfile> createRecruiterProfile(@Valid @RequestBody RecruiterProfileDto dto) {
        return ResponseEntity.ok(profileService.addRecruiterProfile(dto));
    }

    @GetMapping
    public ResponseEntity<List<UserProfile>> getAllProfiles() {
        return ResponseEntity.ok(profileService.getAllProfiles());
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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteProfile(@PathVariable("id") Long id) {
        profileService.deleteProfile(id);
        Map<String, String> response = Map.of("message", "Profile deleted successfully");
        return ResponseEntity.ok(response);
    }
}

