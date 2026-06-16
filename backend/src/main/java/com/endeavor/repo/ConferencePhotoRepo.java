package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferencePhoto;

@Repository
public interface ConferencePhotoRepo extends JpaRepository<ConferencePhoto, Long> {
}
