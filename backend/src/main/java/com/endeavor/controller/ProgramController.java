package com.endeavor.controller;

import com.endeavor.entity.ProgramCategory;
import com.endeavor.entity.ProgramItem;
import com.endeavor.service.ProgramCategoryService;
import com.endeavor.service.ProgramItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ProgramController {

    @Autowired
    private ProgramCategoryService categoryService;

    @Autowired
    private ProgramItemService itemService;

    // --- Admin Endpoints for Categories ---
    @GetMapping("/admin/program-categories")
    public ResponseEntity<List<ProgramCategory>> getAllCategories(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(categoryService.getCategoriesByConferenceId(conferenceId));
    }

    @PostMapping("/admin/program-categories")
    public ResponseEntity<ProgramCategory> createCategory(@RequestBody ProgramCategory category) {
        return ResponseEntity.ok(categoryService.saveCategory(category));
    }

    @PutMapping("/admin/program-categories/{id}")
    public ResponseEntity<ProgramCategory> updateCategory(@PathVariable Long id, @RequestBody ProgramCategory categoryDetails) {
        Optional<ProgramCategory> catOpt = categoryService.getCategoryById(id);
        if (catOpt.isPresent()) {
            ProgramCategory cat = catOpt.get();
            cat.setCategoryName(categoryDetails.getCategoryName());
            cat.setDisplayOrder(categoryDetails.getDisplayOrder());
            cat.setStatus(categoryDetails.getStatus());
            return ResponseEntity.ok(categoryService.saveCategory(cat));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/program-categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable Long id) {
        Optional<ProgramCategory> catOpt = categoryService.getCategoryById(id);
        if (catOpt.isPresent() && !catOpt.get().getIsDefault()) {
            long count = itemService.getItemsByCategoryId(id).size();
            if (count == 0) {
                categoryService.deleteCategory(id);
                return ResponseEntity.ok().build();
            } else {
                return ResponseEntity.badRequest().build();
            }
        }
        return ResponseEntity.badRequest().build();
    }

    // --- Admin Endpoints for Items ---
    @GetMapping("/admin/program-items")
    public ResponseEntity<List<ProgramItem>> getItemsByCategory(@RequestParam Long categoryId) {
        return ResponseEntity.ok(itemService.getItemsByCategoryId(categoryId));
    }

    @PostMapping("/admin/program-items")
    public ResponseEntity<ProgramItem> createItem(@RequestBody ProgramItem item) {
        return ResponseEntity.ok(itemService.saveItem(item));
    }

    @PutMapping("/admin/program-items/{id}")
    public ResponseEntity<ProgramItem> updateItem(@PathVariable Long id, @RequestBody ProgramItem details) {
        Optional<ProgramItem> itemOpt = itemService.getItemById(id);
        if (itemOpt.isPresent()) {
            ProgramItem item = itemOpt.get();
            item.setTitle(details.getTitle());
            item.setDescription(details.getDescription());
            item.setDate(details.getDate());
            item.setStartTime(details.getStartTime());
            item.setEndTime(details.getEndTime());
            item.setVenue(details.getVenue());
            item.setSpeakers(details.getSpeakers());
            item.setChairPerson(details.getChairPerson());
            item.setDisplayOrder(details.getDisplayOrder());
            item.setStatus(details.getStatus());
            return ResponseEntity.ok(itemService.saveItem(item));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/admin/program-items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Long id) {
        if (itemService.getItemById(id).isPresent()) {
            itemService.deleteItem(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // --- Public Endpoints ---
    @GetMapping("/program-categories")
    public ResponseEntity<List<ProgramCategory>> getPublicCategories(@RequestParam Long conferenceId) {
        List<ProgramCategory> categories = categoryService.getCategoriesByConferenceId(conferenceId);
        // Only return categories that are active and have at least 1 active item
        List<ProgramCategory> filtered = categories.stream()
                .filter(c -> c.getStatus() && c.getActiveItemCount() != null && c.getActiveItemCount() > 0)
                .collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }
    
    @GetMapping("/program-items")
    public ResponseEntity<List<ProgramItem>> getPublicItems(@RequestParam Long categoryId) {
        List<ProgramItem> items = itemService.getItemsByCategoryId(categoryId);
        List<ProgramItem> filtered = items.stream().filter(ProgramItem::getStatus).collect(Collectors.toList());
        return ResponseEntity.ok(filtered);
    }
}
