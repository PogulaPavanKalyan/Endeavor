package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.GalleryImage;
import com.endeavor.service.GalleryService;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class GalleryController {

    @Autowired
    private GalleryService service;

    @GetMapping("/api/gallery")
    public ResponseEntity<List<GalleryImage>> getPublicGallery(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @GetMapping("/api/admin/gallery")
    public ResponseEntity<List<GalleryImage>> getAdminGallery(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @PostMapping("/api/admin/gallery")
    public ResponseEntity<GalleryImage> addImage(@RequestBody GalleryImage image) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(image));
    }

    @PutMapping("/api/admin/gallery/{id}")
    public ResponseEntity<GalleryImage> updateImage(@PathVariable Long id, @RequestBody GalleryImage details) {
        return service.getById(id).map(image -> {
            image.setCaption(details.getCaption());
            image.setCategory(details.getCategory());
            image.setDisplayOrder(details.getDisplayOrder());
            if (details.getImageUrl() != null) {
                image.setImageUrl(details.getImageUrl());
            }
            return ResponseEntity.ok(service.save(image));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/gallery/{id}")
    public ResponseEntity<Void> deleteImage(@PathVariable Long id) {
        if (service.getById(id).isPresent()) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
