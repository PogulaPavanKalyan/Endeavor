package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.ConferencePage;
import com.endeavor.service.ConferencePageService;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class NavbarPageController {

    @Autowired
    private ConferencePageService service;

    @GetMapping("/api/conference-pages")
    public ResponseEntity<List<ConferencePage>> getPublicPages(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @GetMapping("/api/admin/pages")
    public ResponseEntity<List<ConferencePage>> getAdminPages(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @PutMapping("/api/admin/pages/{id}")
    public ResponseEntity<ConferencePage> updatePage(@PathVariable Long id, @RequestBody ConferencePage details) {
        ConferencePage page = service.save(details);
        return ResponseEntity.ok(page);
    }
    
    @PostMapping("/api/admin/pages/reorder")
    public ResponseEntity<List<ConferencePage>> reorderPages(@RequestBody List<ConferencePage> pages) {
        for (ConferencePage p : pages) {
            service.save(p);
        }
        return ResponseEntity.ok(pages);
    }
}
