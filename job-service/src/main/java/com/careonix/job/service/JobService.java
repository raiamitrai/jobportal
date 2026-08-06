package com.careonix.job.service;

import com.careonix.job.dto.JobRequestDto;
import com.careonix.job.dto.JobResponseDto;

import java.util.List;

public interface JobService {
    JobResponseDto addJob(JobRequestDto dto);
    List<JobResponseDto> getAllJobs();
    JobResponseDto getJobById(Long id);
    List<JobResponseDto> getJobsByTitle(String title);
    List<JobResponseDto> getJobsByCategory(String category);
    List<JobResponseDto> getJobsByLocation(String location);
    List<JobResponseDto> getJobsByPostedBy(Long recruiterId);
    List<JobResponseDto> getJobsByStatus(String status);
    List<JobResponseDto> searchJobs(String title, String category, String location, Double salaryMin, Double salaryMax, Integer experience);
    JobResponseDto updateJob(Long id, JobRequestDto dto);
    void deleteJob(Long id);
}

