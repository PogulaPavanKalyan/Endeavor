package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.endeavor.entity.ScientificSession;
import com.endeavor.entity.Speaker;
import com.endeavor.entity.ConferenceDetails;
import com.endeavor.service.SpeakerService;
import com.endeavor.service.ScientificSessionService;
import com.endeavor.service.ConferenceDetailsService;
import com.endeavor.entity.Sponsor;
import com.endeavor.service.SponsorService;

import java.util.List;
import java.util.Optional;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class ConferenceController {

    @Autowired
    private SpeakerService speakerService;

    @Autowired
    private ScientificSessionService sessionService;

    @Autowired
    private ConferenceDetailsService conferenceDetailsService;

    @Autowired
    private SponsorService sponsorService;

    @GetMapping("/speakers")
    public ResponseEntity<List<Speaker>> getSpeakers(@RequestParam(required = false) String type, @RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
             return ResponseEntity.ok(speakerService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(speakerService.getSpeakers(type));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<ScientificSession>> getSessions(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(sessionService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(sessionService.getSessions());
    }

    @GetMapping("/sessions/{id}")
    public ResponseEntity<ScientificSession> getSessionById(@PathVariable Long id) {
        Optional<ScientificSession> sessionOpt = sessionService.getSessionById(id);
        if (sessionOpt.isPresent()) {
            return ResponseEntity.ok(sessionOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/conference-details")
    public ResponseEntity<ConferenceDetails> getConferenceDetails(
            @RequestParam(required = false) Long id,
            @RequestParam(required = false) String slug) {
        Optional<ConferenceDetails> detailsOpt = Optional.empty();
        if (id != null) {
            detailsOpt = conferenceDetailsService.getConferenceDetailsById(id);
        } else if (slug != null && !slug.trim().isEmpty() && !slug.equals("generic")) {
            detailsOpt = conferenceDetailsService.getConferenceDetailsBySlug(slug);
        } else {
            detailsOpt = conferenceDetailsService.getConferenceDetails();
        }
        if (detailsOpt.isPresent()) {
            return ResponseEntity.ok(detailsOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/conferences")
    public ResponseEntity<List<ConferenceDetails>> getAllConferences() {
        return ResponseEntity.ok(conferenceDetailsService.getAllConferences());
    }

    @GetMapping("/sponsors")
    public ResponseEntity<List<Sponsor>> getAllSponsors(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
             return ResponseEntity.ok(sponsorService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(sponsorService.getAllSponsors());
    }

    @GetMapping("/info-updates")
    public ResponseEntity<List<Map<String, String>>> getInfoUpdates() {
        List<Map<String, String>> list = new ArrayList<>();
        
        Map<String, String> item1 = new HashMap<>();
        item1.put("title", "Suggest a Speaker");
        item1.put("imageUrl", "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=600&q=80");
        item1.put("link", "suggest-speaker");
        item1.put("color", "#ec4899");
        list.add(item1);

        Map<String, String> item2 = new HashMap<>();
        item2.put("title", "Conferences");
        item2.put("imageUrl", "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=80");
        item2.put("link", ""); // Empty route goes to layout conferences homepage / home page
        item2.put("color", "#f97316");
        list.add(item2);

        Map<String, String> item3 = new HashMap<>();
        item3.put("title", "Latest News");
        item3.put("imageUrl", "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=80");
        item3.put("link", "speakers"); // Links to speakers
        item3.put("color", "#f97316");
        list.add(item3);

        return ResponseEntity.ok(list);
    }
}
