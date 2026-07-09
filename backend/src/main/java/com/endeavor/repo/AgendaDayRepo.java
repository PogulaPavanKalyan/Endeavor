package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.endeavor.entity.AgendaDay;
import java.util.List;

public interface AgendaDayRepo extends JpaRepository<AgendaDay, Long> {
    List<AgendaDay> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);
    List<AgendaDay> findByConferenceId(Long conferenceId);
}
