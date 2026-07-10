package com.endeavor.repository;

import com.endeavor.entity.SpeakerCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SpeakerCategoryRepository extends JpaRepository<SpeakerCategory, Long> {
    
    List<SpeakerCategory> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);

    List<SpeakerCategory> findByConferenceIdAndStatusOrderByDisplayOrderAsc(Long conferenceId, Boolean status);

    Optional<SpeakerCategory> findByConferenceIdAndCategoryName(Long conferenceId, String categoryName);
}
