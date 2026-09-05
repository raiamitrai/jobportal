package com.careonix.job.repository;

import com.careonix.job.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByCategoryIgnoreCase(String category);
    List<Job> findByLocationIgnoreCase(String location);
    List<Job> findByPostedBy(Long postedBy);
    List<Job> findByStatusIgnoreCase(String status);
    List<Job> findByTitleContainingIgnoreCase(String title);

    @Query("SELECT j FROM Job j WHERE " +
           "(:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) AND " +
           "(:category IS NULL OR LOWER(j.category) = LOWER(:category)) AND " +
           "(:location IS NULL OR LOWER(j.location) = LOWER(:location)) AND " +
           "(:salaryMin IS NULL OR j.salaryMin >= :salaryMin) AND " +
           "(:salaryMax IS NULL OR j.salaryMax <= :salaryMax) AND " +
           "(:experience IS NULL OR j.experienceRequired <= :experience)")
    List<Job> searchJobs(@Param("title") String title,
                         @Param("category") String category,
                         @Param("location") String location,
                         @Param("salaryMin") Double salaryMin,
                         @Param("salaryMax") Double salaryMax,
                         @Param("experience") Integer experience);
}

