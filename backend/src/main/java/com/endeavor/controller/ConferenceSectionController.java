package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.ConferenceSection;
import com.endeavor.entity.ConferenceSectionItem;
import com.endeavor.service.ConferenceSectionService;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/conference-sections")
public class ConferenceSectionController {

    @Autowired
    private ConferenceSectionService service;

    @GetMapping
    public ResponseEntity<List<ConferenceSection>> getPublicSections(@RequestParam Long conferenceId) {
        // Fetch sections and populate visible items
        List<ConferenceSection> visibleSections = service.getSectionsByConference(conferenceId)
                .stream()
                .filter(s -> Boolean.TRUE.equals(s.getIsVisible()))
                .map(s -> {
                    List<ConferenceSectionItem> visibleItems = service.getItemsBySection(s.getId())
                            .stream()
                            .filter(item -> Boolean.TRUE.equals(item.getIsVisible()))
                            .collect(Collectors.toList());
                    s.setItems(visibleItems);
                    return s;
                })
                .collect(Collectors.toList());
        return ResponseEntity.ok(visibleSections);
    }
}
