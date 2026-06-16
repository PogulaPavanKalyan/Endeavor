package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.Speaker;
import java.util.List;

@Repository
public interface SpeakerRepo extends JpaRepository<Speaker, Long> {
    List<Speaker> findByType(String type);

    List<Speaker> findByConferenceId(Long conferenceId);
}
