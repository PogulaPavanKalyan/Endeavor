package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ScientificTrack;

@Repository
public interface ScientificTrackRepo extends JpaRepository<ScientificTrack, Long> {

    List<ScientificTrack> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);
}
