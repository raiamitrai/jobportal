package com.careonix.profile.service;

import com.careonix.profile.dto.CandidateProfileDto;
import com.careonix.profile.dto.RecruiterProfileDto;
import com.careonix.profile.entity.CandidateProfile;
import com.careonix.profile.entity.RecruiterProfile;
import com.careonix.profile.entity.UserProfile;
import com.careonix.profile.exception.ProfileNotFoundException;
import com.careonix.profile.repository.ProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ProfileServiceImplTest {

    @Mock
    private ProfileRepository profileRepository;

    @InjectMocks
    private ProfileServiceImpl profileService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void addCandidateProfile_success() {
        CandidateProfileDto dto = CandidateProfileDto.builder()
                .fullName("John Doe")
                .email("john@example.com")
                .mobile(1234567890L)
                .skills(new ArrayList<>())
                .experience(2)
                .resumeUrl("http://resume.url")
                .build();
        CandidateProfile saved = new CandidateProfile();
        saved.setProfileId(1L);
        when(profileRepository.save(any(CandidateProfile.class))).thenReturn(saved);
        CandidateProfile result = profileService.addCandidateProfile(dto);
        assertNotNull(result);
        assertEquals(1L, result.getProfileId());
        verify(profileRepository, times(1)).save(any(CandidateProfile.class));
    }

    @Test
    void addRecruiterProfile_success() {
        RecruiterProfileDto dto = RecruiterProfileDto.builder()
                .fullName("Acme Corp")
                .email("hr@acme.com")
                .companyName("Acme")
                .companySize("100-200")
                .industry("Tech")
                .website("https://acme.com")
                .build();
        RecruiterProfile saved = new RecruiterProfile();
        saved.setProfileId(2L);
        when(profileRepository.save(any(RecruiterProfile.class))).thenReturn(saved);
        RecruiterProfile result = profileService.addRecruiterProfile(dto);
        assertNotNull(result);
        assertEquals(2L, result.getProfileId());
    }

    @Test
    void getProfileById_found() {
        Long id = 1L;
        CandidateProfile profile = new CandidateProfile();
        when(profileRepository.findById(id)).thenReturn(Optional.of(profile));
        assertEquals(profile, profileService.getProfileById(id));
    }

    @Test
    void getProfileById_notFound() {
        Long id = 99L;
        when(profileRepository.findById(id)).thenReturn(Optional.empty());
        assertThrows(ProfileNotFoundException.class, () -> profileService.getProfileById(id));
    }

    @Test
    void updateProfile_updatesFields() {
        Long id = 1L;
        CandidateProfile existing = new CandidateProfile();
        existing.setFullName("Old Name");
        when(profileRepository.findById(id)).thenReturn(Optional.of(existing));
        when(profileRepository.save(existing)).thenReturn(existing);
        Map<String, Object> updates = Map.of("fullName", "New Name");
        profileService.updateProfile(id, updates);
        assertEquals("New Name", existing.getFullName());
    }

    @Test
    void deleteProfile_exists() {
        Long id = 1L;
        when(profileRepository.existsById(id)).thenReturn(true);
        doNothing().when(profileRepository).deleteById(id);
        profileService.deleteProfile(id);
        verify(profileRepository).deleteById(id);
    }

    @Test
    void getAllProfiles_pagination() {
        Pageable pageable = mock(Pageable.class);
        List<UserProfile> list = List.of(new CandidateProfile());
        Page<UserProfile> page = new PageImpl<>(list);
        when(profileRepository.findAll(pageable)).thenReturn(page);
        Page<?> result = profileService.getAllProfiles(pageable);
        assertEquals(page, result);
    }
}
