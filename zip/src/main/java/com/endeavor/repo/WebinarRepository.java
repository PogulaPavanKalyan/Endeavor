package com.endeavor.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.Webinar;
import java.util.Optional;

@Repository
public interface WebinarRepository extends JpaRepository<Webinar, Long> {

    Optional<Webinar> findBySlug(String slug);

    @Query("SELECT w FROM Webinar w WHERE " +
           "(:status IS NULL OR UPPER(w.status) = UPPER(:status)) AND " +
           "(:search IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.speakerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Webinar> findByFilters(@Param("status") String status, @Param("search") String search, Pageable pageable);

    @Query("SELECT w FROM Webinar w WHERE " +
           "(:status IS NULL OR UPPER(w.status) = UPPER(:status)) AND " +
           "(:search IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.speakerName) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(UPPER(w.status) <> 'ARCHIVED')")
    Page<Webinar> findByFiltersExcludingArchived(@Param("status") String status, @Param("search") String search, Pageable pageable);

    @Query("SELECT w FROM Webinar w WHERE " +
           "(UPPER(w.status) = 'PUBLISHED' OR UPPER(w.status) = 'COMPLETED') AND " +
           "(:search IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.speakerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Webinar> findPublicWebinars(@Param("search") String search, Pageable pageable);

    @Query("SELECT w FROM Webinar w WHERE " +
           "UPPER(w.status) = 'PUBLISHED' AND w.webinarDate >= :today AND " +
           "(:search IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.speakerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Webinar> findUpcomingPublicWebinars(@Param("search") String search, @Param("today") String today, Pageable pageable);

    @Query("SELECT w FROM Webinar w WHERE " +
           "(UPPER(w.status) = 'COMPLETED' OR (UPPER(w.status) = 'PUBLISHED' AND w.webinarDate < :today)) AND " +
           "(:search IS NULL OR LOWER(w.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.description) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(w.speakerName) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Webinar> findPastPublicWebinars(@Param("search") String search, @Param("today") String today, Pageable pageable);
}
