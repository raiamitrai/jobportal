package com.careonix.application.service;

import com.careonix.application.dto.ApplicationRequestDto;
import com.careonix.application.dto.ApplicationResponseDto;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {
    ApplicationResponseDto submitApplication(ApplicationRequestDto request);
    ApplicationResponseDto getById(Long id);
    // Paginated fetches
    Page<ApplicationResponseDto> getByCandidate(Long candidateId, Pageable pageable);
    Page<ApplicationResponseDto> getByJob(Long jobId, Pageable pageable);
    ApplicationResponseDto updateStatus(Long id, String status);
    void withdrawApplication(Long id);
    int countByJob(Long jobId);
}
