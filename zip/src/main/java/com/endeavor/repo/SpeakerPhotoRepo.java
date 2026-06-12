package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.SpeakerPhoto;

@Repository
public interface SpeakerPhotoRepo extends JpaRepository<SpeakerPhoto, Long> {
}
