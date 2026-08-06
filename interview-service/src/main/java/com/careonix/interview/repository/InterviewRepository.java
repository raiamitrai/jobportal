package com.careonix.interview.repository;

import com.careonix.interview.entity.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    // Additional query methods can be defined here if needed
}
