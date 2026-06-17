package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceSection;
import java.util.List;

@Repository
public interface ConferenceSectionRepository extends JpaRepository<ConferenceSection, Long> {

    List<ConferenceSection> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);

    boolean existsByConferenceIdAndSectionSlug(Long conferenceId, String sectionSlug);

    boolean existsByConferenceIdAndSectionSlugAndIdNot(Long conferenceId, String sectionSlug, Long id);
}
