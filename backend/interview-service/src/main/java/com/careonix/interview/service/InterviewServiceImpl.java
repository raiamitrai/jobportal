package com.careonix.interview.service;

import com.careonix.interview.dto.InterviewRequest;
import com.careonix.interview.dto.InterviewResponse;
import com.careonix.interview.entity.Interview;
import com.careonix.interview.entity.InterviewStatus;
import com.careonix.interview.exception.InterviewNotFoundException;
import com.careonix.interview.repository.InterviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InterviewServiceImpl implements InterviewService {

    private final InterviewRepository interviewRepository;

    @Override
    public InterviewResponse scheduleInterview(InterviewRequest request) {
        Interview interview = Interview.builder()
                .candidateName(request.getCandidateName())
                .position(request.getPosition())
                .interviewDate(request.getInterviewDate())
                .interviewTime(request.getInterviewTime())
                .status(resolveStatus(request.getStatus()))
                .build();
        Interview saved = interviewRepository.save(interview);
        return mapToResponse(saved);
    }

    @Override
    public InterviewResponse getInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new InterviewNotFoundException(id));
        return mapToResponse(interview);
    }

    @Override
    public List<InterviewResponse> getAllInterviews() {
        return interviewRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public InterviewResponse updateInterview(Long id, InterviewRequest request) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new InterviewNotFoundException(id));
        // Update mutable fields
        interview.setCandidateName(request.getCandidateName());
        interview.setPosition(request.getPosition());
        interview.setInterviewDate(request.getInterviewDate());
        interview.setInterviewTime(request.getInterviewTime());
        interview.setStatus(resolveStatus(request.getStatus()));
        Interview saved = interviewRepository.save(interview);
        return mapToResponse(saved);
    }

    @Override
    public void deleteInterview(Long id) {
        Interview interview = interviewRepository.findById(id)
                .orElseThrow(() -> new InterviewNotFoundException(id));
        interviewRepository.delete(interview);
    }

    // Helper methods
    private InterviewResponse mapToResponse(Interview interview) {
        return InterviewResponse.builder()
                .id(interview.getId())
                .candidateName(interview.getCandidateName())
                .position(interview.getPosition())
                .interviewDate(interview.getInterviewDate())
                .interviewTime(interview.getInterviewTime())
                .status(interview.getStatus().name())
                .build();
    }

    private InterviewStatus resolveStatus(String status) {
        if (status == null || status.isBlank()) {
            return InterviewStatus.SCHEDULED;
        }
        try {
            return InterviewStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException ex) {
            // Fallback to SCHEDULED if unknown
            return InterviewStatus.SCHEDULED;
        }
    }
}
