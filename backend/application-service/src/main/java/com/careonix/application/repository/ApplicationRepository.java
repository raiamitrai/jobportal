package com.careonix.application.repository;

import com.careonix.application.entity.Application;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByCandidateId(Long candidateId);
    List<Application> findByJobId(Long jobId);
    int countByJobId(Long jobId);
    // Pagination support
    Page<Application> findByCandidateId(Long candidateId, Pageable pageable);
    Page<Application> findByJobId(Long jobId, Pageable pageable);
}
