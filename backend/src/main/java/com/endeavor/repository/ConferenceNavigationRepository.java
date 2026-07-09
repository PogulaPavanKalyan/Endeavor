package com.endeavor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceNavigation;
import java.util.List;

@Repository
public interface ConferenceNavigationRepository extends JpaRepository<ConferenceNavigation, Long> {
    List<ConferenceNavigation> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);
    void deleteByConferenceId(Long conferenceId);
    boolean existsByConferenceIdAndSlug(Long conferenceId, String slug);
}
