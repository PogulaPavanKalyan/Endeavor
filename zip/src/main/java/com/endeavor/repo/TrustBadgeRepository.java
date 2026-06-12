package com.endeavor.repo;

import com.endeavor.entity.TrustBadge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrustBadgeRepository extends JpaRepository<TrustBadge, Long> {
    List<TrustBadge> findByActiveTrueOrderByDisplayOrderAsc();
}
