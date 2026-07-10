package com.endeavor.controller;

import com.endeavor.entity.SpeakerCategory;
import com.endeavor.service.SpeakerCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SpeakerCategoryController {

    @Autowired
    private SpeakerCategoryService service;

    // --- Admin APIs ---

    @GetMapping("/admin/speaker-categories")
    public ResponseEntity<List<SpeakerCategory>> getAllCategoriesAdmin(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getAllCategories(conferenceId));
    }

    @PostMapping("/admin/speaker-categories")
    public ResponseEntity<SpeakerCategory> createCategory(@RequestBody SpeakerCategory category) {
        return ResponseEntity.ok(service.saveCategory(category));
    }

    @PutMapping("/admin/speaker-categories/{id}")
    public ResponseEntity<SpeakerCategory> updateCategory(@PathVariable Long id, @RequestBody SpeakerCategory category) {
        category.setId(id);
        return ResponseEntity.ok(service.saveCategory(category));
    }

    @DeleteMapping("/admin/speaker-categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        service.deleteCategory(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/admin/speaker-categories/reorder")
    public ResponseEntity<List<SpeakerCategory>> reorderCategories(@RequestBody List<SpeakerCategory> categories) {
        service.reorderCategories(categories);
        return ResponseEntity.ok(categories);
    }

    // --- Public Website APIs ---

    @GetMapping("/speaker-categories")
    public ResponseEntity<List<SpeakerCategory>> getActiveCategories(@RequestParam Long conferenceId) {
        // Only returns active categories with active speakers > 0
        return ResponseEntity.ok(service.getActiveCategoriesWithSpeakers(conferenceId));
    }
}
