package com.endeavor.repository;

import com.endeavor.entity.ProgramCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProgramCategoryRepository extends JpaRepository<ProgramCategory, Long> {
    List<ProgramCategory> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);
    Optional<ProgramCategory> findByConferenceIdAndCategoryName(Long conferenceId, String categoryName);
}
