package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferencePage;
import java.util.List;

@Repository
public interface ConferencePageRepo extends JpaRepository<ConferencePage, Long> {
    List<ConferencePage> findByConferenceId(Long conferenceId);
}
