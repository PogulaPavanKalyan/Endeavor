package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.endeavor.entity.ScientificTrack;
import com.endeavor.service.ScientificTrackService;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class ScientificTrackController {

    @Autowired
    private ScientificTrackService trackService;

    // Public API
    @GetMapping("/tracks")
    public ResponseEntity<List<ScientificTrack>> getTracks(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(trackService.getTracksByConferenceId(conferenceId));
    }

    @GetMapping("/tracks/{id}")
    public ResponseEntity<ScientificTrack> getTrackById(@PathVariable Long id) {
        Optional<ScientificTrack> trackOpt = trackService.getTrackById(id);
        if (trackOpt.isPresent()) {
            return ResponseEntity.ok(trackOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Admin API
    @PostMapping("/admin/tracks")
    public ResponseEntity<ScientificTrack> createTrack(@RequestBody ScientificTrack track) {
        ScientificTrack saved = trackService.saveTrack(track);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/admin/tracks/{id}")
    public ResponseEntity<ScientificTrack> updateTrack(@PathVariable Long id, @RequestBody ScientificTrack trackDetails) {
        Optional<ScientificTrack> trackOpt = trackService.getTrackById(id);
        if (trackOpt.isPresent()) {
            ScientificTrack track = trackOpt.get();
            track.setName(trackDetails.getName());
            track.setDisplayOrder(trackDetails.getDisplayOrder());
            track.setIsEnabled(trackDetails.getIsEnabled());
            track.setConferenceId(trackDetails.getConferenceId());
            track.setShortDescription(trackDetails.getShortDescription());
            track.setDetailedDescription(trackDetails.getDetailedDescription());
            track.setTrackIcon(trackDetails.getTrackIcon());
            track.setTrackBannerImage(trackDetails.getTrackBannerImage());
            track.setKeywords(trackDetails.getKeywords());
            track.setIsFeatured(trackDetails.getIsFeatured());
            return ResponseEntity.ok(trackService.saveTrack(track));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/tracks/{id}")
    public ResponseEntity<Void> deleteTrack(@PathVariable Long id) {
        trackService.deleteTrack(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/admin/tracks/reorder")
    public ResponseEntity<Void> reorderTracks(@RequestBody List<Long> trackIds) {
        trackService.reorderTracks(trackIds);
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/admin/tracks/upload", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadTrackImage(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");
        try {
            String uploadsDir = System.getProperty("user.dir") + "/uploads/tracks/";
            java.io.File dir = new java.io.File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();

            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") ? originalName.substring(originalName.lastIndexOf(".")) : "";
            String fileName = java.util.UUID.randomUUID().toString() + extension;
            
            java.nio.file.Path filePath = java.nio.file.Paths.get(uploadsDir, fileName);
            java.nio.file.Files.copy(file.getInputStream(), filePath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            
            return ResponseEntity.ok(java.util.Collections.singletonMap("path", "/uploads/tracks/" + fileName));
        } catch (java.io.IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to upload file");
        }
    }

    @PostMapping(value = "/admin/tracks/bulk-import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> bulkImportTracks(@RequestParam("conferenceId") Long conferenceId, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        if (file.isEmpty()) return ResponseEntity.badRequest().body("File is empty");
        try {
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(file.getInputStream()));
            String line;
            boolean firstLine = true;
            int order = 1;
            while ((line = reader.readLine()) != null) {
                if (firstLine) { firstLine = false; continue; } // skip header
                String[] data = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)"); // CSV split ignoring commas in quotes
                if (data.length > 0) {
                    ScientificTrack track = new ScientificTrack();
                    track.setConferenceId(conferenceId);
                    track.setName(data[0].replace("\"", "").trim());
                    if (data.length > 1) track.setShortDescription(data[1].replace("\"", "").trim());
                    if (data.length > 2) track.setDetailedDescription(data[2].replace("\"", "").trim());
                    if (data.length > 3) track.setKeywords(data[3].replace("\"", "").trim());
                    if (data.length > 4) track.setIsFeatured(Boolean.parseBoolean(data[4].replace("\"", "").trim()));
                    track.setDisplayOrder(order++);
                    track.setIsEnabled(true);
                    trackService.saveTrack(track);
                }
            }
            return ResponseEntity.ok("Import successful");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to process CSV file");
        }
    }
}
