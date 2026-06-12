package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ScientificSession;

@Repository
public interface ScientificSessionRepo extends JpaRepository<ScientificSession, Long> {

    List<ScientificSession> findByConferenceId(Long conferenceId);
    List<ScientificSession> findByTrackId(Long trackId);
}
