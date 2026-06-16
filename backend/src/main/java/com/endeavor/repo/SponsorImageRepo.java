package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.SponsorImage;

@Repository
public interface SponsorImageRepo extends JpaRepository<SponsorImage, Long> {
}
