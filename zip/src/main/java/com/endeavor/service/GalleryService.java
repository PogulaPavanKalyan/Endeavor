package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.GalleryImage;
import com.endeavor.repo.GalleryImageRepo;
import java.util.List;
import java.util.Optional;

@Service
public class GalleryService {

    @Autowired
    private GalleryImageRepo repo;

    public List<GalleryImage> getAllImages() {
        return repo.findAll();
    }

    public List<GalleryImage> getByConferenceId(Long conferenceId) {
        return repo.findByConferenceId(conferenceId);
    }

    public Optional<GalleryImage> getById(Long id) {
        return repo.findById(id);
    }

    public GalleryImage save(GalleryImage image) {
        return repo.save(image);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
