package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceImportantDate;

@Repository
public interface ConferenceImportantDateRepo extends JpaRepository<ConferenceImportantDate, Long> {
}
