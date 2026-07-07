package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.NavbarMenu;
import com.endeavor.service.NavbarMenuService;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Map;

@RestController
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://51.21.159.47:8000"}, originPatterns = {"https://*.intelevoresearch.org", "https://intelevoresearch.org"})
@RequestMapping("/api/admin/navbar-menus")
public class AdminNavbarMenuController {

    @Autowired
    private NavbarMenuService service;

    @GetMapping
    public ResponseEntity<List<NavbarMenu>> getAllMenus(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getMenusByConference(conferenceId));
    }

    @PostMapping
    public ResponseEntity<?> createMenu(@RequestBody NavbarMenu menu) {
        if (!service.isSlugUnique(menu.getConferenceId(), menu.getSlug(), null)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Slug already exists for this conference."));
        }
        NavbarMenu saved = service.saveMenu(menu);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMenu(@PathVariable Long id, @RequestBody NavbarMenu menuDetails) {
        Optional<NavbarMenu> menuOpt = service.getMenuById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        
        NavbarMenu menu = menuOpt.get();
        if (!service.isSlugUnique(menuDetails.getConferenceId(), menuDetails.getSlug(), id)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", "Slug already exists for this conference."));
        }

        menu.setMenuType(menuDetails.getMenuType());
        menu.setTitle(menuDetails.getTitle());
        menu.setPageTitle(menuDetails.getPageTitle());
        menu.setSlug(menuDetails.getSlug());
        menu.setContent(menuDetails.getContent());
        menu.setIsVisible(menuDetails.getIsVisible());
        menu.setIsActive(menuDetails.getIsActive());
        
        if (menuDetails.getBannerPath() != null) {
            menu.setBannerPath(menuDetails.getBannerPath());
        }
        if (menuDetails.getThumbnailPath() != null) {
            menu.setThumbnailPath(menuDetails.getThumbnailPath());
        }
        if (menuDetails.getDisplayOrder() != null) {
            menu.setDisplayOrder(menuDetails.getDisplayOrder());
        }

        NavbarMenu updated = service.saveMenu(menu);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMenu(@PathVariable Long id) {
        Optional<NavbarMenu> menuOpt = service.getMenuById(id);
        if (menuOpt.isPresent()) {
            service.deleteMenu(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/reorder")
    public ResponseEntity<List<NavbarMenu>> reorderMenus(@RequestBody List<NavbarMenu> menus) {
        List<NavbarMenu> updated = service.reorderMenus(menus);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/check-slug")
    public ResponseEntity<Map<String, Boolean>> checkSlug(
            @RequestParam Long conferenceId,
            @RequestParam String slug,
            @RequestParam(required = false) Long excludeId) {
        boolean isUnique = service.isSlugUnique(conferenceId, slug, excludeId);
        return ResponseEntity.ok(Map.of("available", isUnique));
    }

    @PostMapping(value = "/{id}/upload-banner", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadBanner(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<NavbarMenu> menuOpt = service.getMenuById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found with ID: " + id);
        }
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
            }
            String uploadsDir = System.getProperty("user.dir") + "/uploads/navbar/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + "_banner" + extension;
            Files.write(Paths.get(uploadsDir + uniqueName), file.getBytes());

            NavbarMenu menu = menuOpt.get();
            menu.setBannerPath("/uploads/navbar/" + uniqueName);
            NavbarMenu updated = service.saveMenu(menu);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save banner image: " + e.getMessage());
        }
    }

    @PostMapping(value = "/{id}/upload-thumbnail", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadThumbnail(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<NavbarMenu> menuOpt = service.getMenuById(id);
        if (menuOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Menu not found with ID: " + id);
        }
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
            }
            String uploadsDir = System.getProperty("user.dir") + "/uploads/navbar/";
            File dir = new File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();

            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueName = UUID.randomUUID().toString() + "_thumb" + extension;
            Files.write(Paths.get(uploadsDir + uniqueName), file.getBytes());

            NavbarMenu menu = menuOpt.get();
            menu.setThumbnailPath("/uploads/navbar/" + uniqueName);
            NavbarMenu updated = service.saveMenu(menu);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save thumbnail image: " + e.getMessage());
        }
    }
}
