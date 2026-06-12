package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.Venue;
import com.endeavor.service.VenueService;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class VenueController {

    @Autowired
    private VenueService service;

    @GetMapping("/api/venue")
    public ResponseEntity<Venue> getPublicVenue(@RequestParam Long conferenceId) {
        return service.getByConferenceId(conferenceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/api/admin/venue")
    public ResponseEntity<Venue> getAdminVenue(@RequestParam Long conferenceId) {
        return service.getByConferenceId(conferenceId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/api/admin/venue")
    public ResponseEntity<Venue> saveVenue(@RequestBody Venue venue) {
        return ResponseEntity.ok(service.save(venue));
    }
}
