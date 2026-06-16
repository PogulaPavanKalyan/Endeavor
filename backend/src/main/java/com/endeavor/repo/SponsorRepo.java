package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.Sponsor;

@Repository
public interface SponsorRepo extends JpaRepository<Sponsor, Long> {

    List<Sponsor> findByConferenceId(Long conferenceId);
}
