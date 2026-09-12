package com.careonix.job.service;

import com.careonix.job.dto.JobRequestDto;
import com.careonix.job.dto.JobResponseDto;
import com.careonix.job.entity.Job;
import com.careonix.job.exception.JobNotFoundException;
import com.careonix.job.repository.JobRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;

    @Override
    @Transactional
    public JobResponseDto addJob(JobRequestDto dto) {
        Job job = Job.builder()
                .title(dto.getTitle())
                .category(dto.getCategory())
                .type(dto.getType())
                .location(dto.getLocation())
                .companyName(dto.getCompanyName())
                .description(dto.getDescription())
                .salaryMin(dto.getSalaryMin())
                .salaryMax(dto.getSalaryMax())
                .skills(dto.getSkills())
                .experienceRequired(dto.getExperienceRequired())
                .postedBy(dto.getPostedBy() != null ? dto.getPostedBy() : 1L)
                .status(dto.getStatus() != null ? dto.getStatus().toUpperCase() : "ACTIVE")
                .build();

        Job savedJob = jobRepository.save(job);
        return mapToResponseDto(savedJob);
    }


    @Override
    public List<JobResponseDto> getAllJobs() {
        return jobRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public JobResponseDto getJobById(Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found with ID: " + id));
        return mapToResponseDto(job);
    }

    @Override
    public List<JobResponseDto> getJobsByTitle(String title) {
        return jobRepository.findByTitleContainingIgnoreCase(title).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDto> getJobsByCategory(String category) {
        return jobRepository.findByCategoryIgnoreCase(category).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDto> getJobsByLocation(String location) {
        return jobRepository.findByLocationIgnoreCase(location).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDto> getJobsByPostedBy(Long recruiterId) {
        return jobRepository.findByPostedBy(recruiterId).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDto> getJobsByStatus(String status) {
        return jobRepository.findByStatusIgnoreCase(status).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<JobResponseDto> searchJobs(String title, String category, String location, Double salaryMin, Double salaryMax, Integer experience) {
        return jobRepository.searchJobs(title, category, location, salaryMin, salaryMax, experience).stream()
                .map(this::mapToResponseDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public JobResponseDto updateJob(Long id, JobRequestDto dto) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new JobNotFoundException("Job not found with ID: " + id));

        job.setTitle(dto.getTitle());
        job.setCategory(dto.getCategory());
        job.setType(dto.getType());
        job.setLocation(dto.getLocation());
        if (dto.getCompanyName() != null) job.setCompanyName(dto.getCompanyName());
        if (dto.getDescription() != null) job.setDescription(dto.getDescription());
        job.setSalaryMin(dto.getSalaryMin());
        job.setSalaryMax(dto.getSalaryMax());
        job.setSkills(dto.getSkills());
        job.setExperienceRequired(dto.getExperienceRequired());
        if (dto.getPostedBy() != null) job.setPostedBy(dto.getPostedBy());
        if (dto.getStatus() != null) {
            job.setStatus(dto.getStatus().toUpperCase());
        }

        Job updatedJob = jobRepository.save(job);
        return mapToResponseDto(updatedJob);
    }

    @Override
    @Transactional
    public void deleteJob(Long id) {
        if (!jobRepository.existsById(id)) {
            throw new JobNotFoundException("Job not found with ID: " + id);
        }
        jobRepository.deleteById(id);
    }

    private JobResponseDto mapToResponseDto(Job job) {
        return JobResponseDto.builder()
                .jobId(job.getJobId())
                .title(job.getTitle())
                .category(job.getCategory())
                .type(job.getType())
                .location(job.getLocation())
                .companyName(job.getCompanyName())
                .description(job.getDescription())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .skills(job.getSkills())
                .experienceRequired(job.getExperienceRequired())
                .postedBy(job.getPostedBy())
                .status(job.getStatus())
                .postedAt(job.getPostedAt())
                .build();
    }

}

