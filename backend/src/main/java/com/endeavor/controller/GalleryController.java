package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.GalleryImage;
import com.endeavor.service.GalleryService;
import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
public class GalleryController {

    @Autowired
    private GalleryService service;

    private final String uploadDir = "uploads/gallery";

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

    @PostMapping(value = "/api/admin/gallery/{id}/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadGalleryImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return service.getById(id).map(image -> {
            try {
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String originalName = file.getOriginalFilename();
                String ext = (originalName != null && originalName.contains("."))
                    ? originalName.substring(originalName.lastIndexOf(".")) : ".jpg";
                String uniqueName = UUID.randomUUID().toString() + ext;
                File dest = new File(dir.getAbsolutePath(), uniqueName);
                file.transferTo(dest);

                image.setImageUrl("/uploads/gallery/" + uniqueName);
                return ResponseEntity.ok(service.save(image));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload image: " + e.getMessage());
            }
        }).orElse(ResponseEntity.notFound().build());
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
