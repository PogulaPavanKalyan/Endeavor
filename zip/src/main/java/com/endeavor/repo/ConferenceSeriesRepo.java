package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceSeries;
import java.util.Optional;

@Repository
public interface ConferenceSeriesRepo extends JpaRepository<ConferenceSeries, Long> {
    Optional<ConferenceSeries> findByName(String name);
    Optional<ConferenceSeries> findByCode(String code);
}
