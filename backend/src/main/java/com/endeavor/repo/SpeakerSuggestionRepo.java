package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.SpeakerSuggestion;

@Repository
public interface SpeakerSuggestionRepo extends JpaRepository<SpeakerSuggestion, Long> {

    List<SpeakerSuggestion> findByConferenceId(Long conferenceId);
}
