package com.careonix.application.service;

import com.careonix.application.dto.ApplicationRequestDto;
import com.careonix.application.dto.ApplicationResponseDto;
import com.careonix.application.entity.Application;
import com.careonix.application.entity.ApplicationStatus;
import com.careonix.application.exception.ApplicationNotFoundException;
import com.careonix.application.repository.ApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;

    @Override
    public ApplicationResponseDto submitApplication(ApplicationRequestDto request) {
        Application application = Application.builder()
                .jobId(request.getJobId())
                .candidateId(request.getCandidateId())
                .coverLetter(request.getCoverLetter())
                .resumeUrl(request.getResumeUrl())
                .status(resolveStatus(request.getStatus()))
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
        Application saved = applicationRepository.save(application);
        return mapToResponse(saved);
    }

    @Override
    public ApplicationResponseDto getById(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ApplicationNotFoundException(id));
        return mapToResponse(app);
    }

    @Override
    public Page<ApplicationResponseDto> getByCandidate(Long candidateId, Pageable pageable) {
        return applicationRepository.findByCandidateId(candidateId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public Page<ApplicationResponseDto> getByJob(Long jobId, Pageable pageable) {
        return applicationRepository.findByJobId(jobId, pageable)
                .map(this::mapToResponse);
    }

    @Override
    public ApplicationResponseDto updateStatus(Long id, String status) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ApplicationNotFoundException(id));
        app.setStatus(resolveStatus(status));
        app.setUpdatedAt(LocalDateTime.now());
        Application saved = applicationRepository.save(app);
        return mapToResponse(saved);
    }

    @Override
    public void withdrawApplication(Long id) {
        Application app = applicationRepository.findById(id)
                .orElseThrow(() -> new ApplicationNotFoundException(id));
        app.setStatus(ApplicationStatus.WITHDRAWN);
        app.setUpdatedAt(LocalDateTime.now());
        applicationRepository.save(app);
    }

    @Override
    public int countByJob(Long jobId) {
        return applicationRepository.countByJobId(jobId);
    }

    // Helper methods ----------------------------------------------------
    private ApplicationResponseDto mapToResponse(Application app) {
        return ApplicationResponseDto.builder()
                .id(app.getId())
                .jobId(app.getJobId())
                .candidateId(app.getCandidateId())
                .coverLetter(app.getCoverLetter())
                .resumeUrl(app.getResumeUrl())
                .status(app.getStatus().name())
                .createdAt(app.getCreatedAt())
                .updatedAt(app.getUpdatedAt())
                .build();
    }

    private ApplicationStatus resolveStatus(String status) {
        if (status == null || status.isBlank()) {
            return ApplicationStatus.APPLIED;
        }
        try {
            return ApplicationStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            // Fallback to APPLIED for unknown values
            return ApplicationStatus.APPLIED;
        }
    }
}
