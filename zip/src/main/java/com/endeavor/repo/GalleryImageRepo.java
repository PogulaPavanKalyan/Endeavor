package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.GalleryImage;
import java.util.List;

@Repository
public interface GalleryImageRepo extends JpaRepository<GalleryImage, Long> {
    List<GalleryImage> findByConferenceId(Long conferenceId);
}
