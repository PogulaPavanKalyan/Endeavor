package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.Venue;
import java.util.Optional;

@Repository
public interface VenueRepo extends JpaRepository<Venue, Long> {
    Optional<Venue> findByConferenceId(Long conferenceId);
}
