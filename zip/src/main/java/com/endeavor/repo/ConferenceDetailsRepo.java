package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceDetails;

import java.util.Optional;
import java.util.List;

@Repository
public interface ConferenceDetailsRepo extends JpaRepository<ConferenceDetails, Long> {
    Optional<ConferenceDetails> findBySlug(String slug);
    Optional<ConferenceDetails> findBySlugAndStatus(String slug, String status);
    
    List<ConferenceDetails> findByIsDeletedFalse();
    Optional<ConferenceDetails> findByIdAndIsDeletedFalse(Long id);
    Optional<ConferenceDetails> findBySlugAndIsDeletedFalse(String slug);
    Optional<ConferenceDetails> findBySlugAndStatusAndIsDeletedFalse(String slug, String status);
}
