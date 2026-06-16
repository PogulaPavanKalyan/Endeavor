package com.endeavor.repo;

import com.endeavor.entity.AboutUsSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AboutUsSectionRepo extends JpaRepository<AboutUsSection, Long> {
}
