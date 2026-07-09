package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.ConferenceNavigation;
import com.endeavor.service.ConferenceNavigationService;
import java.util.List;

@RestController
@RequestMapping("/api/navigation")
public class ConferenceNavigationController {

    @Autowired
    private ConferenceNavigationService service;

    @GetMapping
    public ResponseEntity<List<ConferenceNavigation>> getNavigation(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getNavigationByConferenceId(conferenceId));
    }

    @PostMapping
    public ResponseEntity<ConferenceNavigation> createNavigation(@RequestBody ConferenceNavigation navigation) {
        return ResponseEntity.ok(service.save(navigation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConferenceNavigation> updateNavigation(@PathVariable Long id, @RequestBody ConferenceNavigation navigation) {
        navigation.setId(id);
        return ResponseEntity.ok(service.save(navigation));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNavigation(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<List<ConferenceNavigation>> reorderNavigation(@RequestBody List<ConferenceNavigation> navigations) {
        service.reorder(navigations);
        return ResponseEntity.ok(navigations);
    }

    @PostMapping("/auto-generate")
    public ResponseEntity<Void> autoGenerate(@RequestParam Long conferenceId) {
        service.generateDefaultNavigation(conferenceId);
        return ResponseEntity.ok().build();
    }
}
