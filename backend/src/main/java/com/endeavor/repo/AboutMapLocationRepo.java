package com.endeavor.repo;

import com.endeavor.entity.AboutMapLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AboutMapLocationRepo extends JpaRepository<AboutMapLocation, Long> {
}
