package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.AbstractSubmission;
import java.util.List;

@Repository
public interface AbstractSubmissionRepo extends JpaRepository<AbstractSubmission, Long> {
    List<AbstractSubmission> findByEmail(String email);

    List<AbstractSubmission> findByConferenceId(Long conferenceId);
}
