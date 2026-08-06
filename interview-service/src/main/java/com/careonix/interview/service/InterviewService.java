package com.careonix.interview.service;

import com.careonix.interview.dto.InterviewRequest;
import com.careonix.interview.dto.InterviewResponse;
import java.util.List;

public interface InterviewService {
    InterviewResponse scheduleInterview(InterviewRequest request);
    InterviewResponse getInterview(Long id);
    List<InterviewResponse> getAllInterviews();
    InterviewResponse updateInterview(Long id, InterviewRequest request);
    void deleteInterview(Long id);
}
