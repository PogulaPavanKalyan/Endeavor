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
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
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
}
