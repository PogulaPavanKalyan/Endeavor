package com.endeavor.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.FooterSettings;
import java.util.Optional;

@Repository
public interface FooterSettingsRepository extends JpaRepository<FooterSettings, Long> {
    Optional<FooterSettings> findByConferenceId(Long conferenceId);
    void deleteByConferenceId(Long conferenceId);
}
