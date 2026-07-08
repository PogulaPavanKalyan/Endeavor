package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.ConferenceSection;
import com.endeavor.entity.ConferenceSectionItem;
import com.endeavor.service.ConferenceSectionService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/conference-sections")
public class AdminConferenceSectionController {

    @Autowired
    private ConferenceSectionService service;

    // ── SECTION ENDPOINTS ───────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<ConferenceSection>> getAllSections(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getSectionsByConference(conferenceId));
    }

    @PostMapping
    public ResponseEntity<?> createSection(@RequestBody ConferenceSection section) {
        if (!service.isSectionSlugUnique(section.getConferenceId(), section.getSectionSlug(), null)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Slug already exists for this conference."));
        }
        ConferenceSection saved = service.saveSection(section);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateSection(@PathVariable Long id, @RequestBody ConferenceSection details) {
        Optional<ConferenceSection> secOpt = service.getSectionById(id);
        if (secOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        ConferenceSection section = secOpt.get();
        if (!service.isSectionSlugUnique(details.getConferenceId(), details.getSectionSlug(), id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Slug already exists for this conference."));
        }

        section.setSectionName(details.getSectionName());
        section.setSectionSlug(details.getSectionSlug());
        section.setIsVisible(details.getIsVisible());
        if (details.getDisplayOrder() != null) {
            section.setDisplayOrder(details.getDisplayOrder());
        }

        ConferenceSection updated = service.saveSection(section);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSection(@PathVariable Long id) {
        Optional<ConferenceSection> secOpt = service.getSectionById(id);
        if (secOpt.isPresent()) {
            service.deleteSection(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<List<ConferenceSection>> reorderSections(@RequestBody List<ConferenceSection> sections) {
        List<ConferenceSection> updated = service.reorderSections(sections);
        return ResponseEntity.ok(updated);
    }

    // ── ITEM ENDPOINTS ──────────────────────────────────────────────

    @GetMapping("/{sectionId}/items")
    public ResponseEntity<List<ConferenceSectionItem>> getSectionItems(@PathVariable Long sectionId) {
        return ResponseEntity.ok(service.getItemsBySection(sectionId));
    }

    @PostMapping("/items")
    public ResponseEntity<ConferenceSectionItem> createItem(@RequestBody ConferenceSectionItem item) {
        ConferenceSectionItem saved = service.saveItem(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/items/{id}")
    public ResponseEntity<ConferenceSectionItem> updateItem(@PathVariable Long id, @RequestBody ConferenceSectionItem details) {
        Optional<ConferenceSectionItem> itemOpt = service.getItemById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ConferenceSectionItem item = itemOpt.get();
        item.setName(details.getName());
        item.setDesignation(details.getDesignation());
        item.setOrganization(details.getOrganization());
        item.setCountry(details.getCountry());
        item.setWebsiteUrl(details.getWebsiteUrl());
        item.setLinkedinUrl(details.getLinkedinUrl());
        item.setDescription(details.getDescription());
        item.setIsVisible(details.getIsVisible());
        
        if (details.getImagePath() != null) {
            item.setImagePath(details.getImagePath());
        }
        if (details.getDisplayOrder() != null) {
            item.setDisplayOrder(details.getDisplayOrder());
        }

        ConferenceSectionItem updated = service.saveItem(item);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        Optional<ConferenceSectionItem> itemOpt = service.getItemById(id);
        if (itemOpt.isPresent()) {
            service.deleteItem(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/items/reorder")
    public ResponseEntity<List<ConferenceSectionItem>> reorderItems(@RequestBody List<ConferenceSectionItem> items) {
        List<ConferenceSectionItem> updated = service.reorderItems(items);
        return ResponseEntity.ok(updated);
    }

    @PostMapping(value = "/items/{id}/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadItemImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<ConferenceSectionItem> itemOpt = service.getItemById(id);
        if (itemOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Section item not found with ID: " + id);
        }
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
            }
            String uploadsDir = System.getProperty("user.dir") + "/uploads/sections/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + extension;
            Files.write(Paths.get(uploadsDir + uniqueName), file.getBytes());

            ConferenceSectionItem item = itemOpt.get();
            item.setImagePath("/uploads/sections/" + uniqueName);
            ConferenceSectionItem updated = service.saveItem(item);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save profile image: " + e.getMessage());
        }
    }
}
