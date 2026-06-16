package com.endeavor.repo;

import com.endeavor.entity.AboutTimelineMilestone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutTimelineMilestoneRepo extends JpaRepository<AboutTimelineMilestone, Long> {
    List<AboutTimelineMilestone> findAllByOrderByDisplayOrderAsc();
}
