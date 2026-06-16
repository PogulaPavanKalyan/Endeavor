package com.endeavor.repo;

import com.endeavor.entity.HeroSection;
import com.endeavor.entity.HeroSection.HeroStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface HeroSectionRepository extends JpaRepository<HeroSection, Long> {
    Optional<HeroSection> findFirstByStatusOrderByCreatedAtDesc(HeroStatus status);
}
