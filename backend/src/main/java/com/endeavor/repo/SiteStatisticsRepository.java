package com.endeavor.repo;

import com.endeavor.entity.SiteStatistics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SiteStatisticsRepository extends JpaRepository<SiteStatistics, Long> {
}
