package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.Webinar;
import com.endeavor.dto.WebinarDTO;
import com.endeavor.service.WebinarService;
import com.endeavor.service.AdminActivityLogService;
import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.Optional;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class WebinarController {

    @Autowired
    private WebinarService webinarService;

    @Autowired
    private AdminActivityLogService activityLogService;

    @Autowired
    private HttpServletRequest servletRequest;

    // Public Endpoint: Get webinars list
    @GetMapping("/webinars")
    public ResponseEntity<Page<WebinarDTO>> getPublicWebinars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(defaultValue = "webinarDate") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort.and(Sort.by("startTime").ascending()));
        Page<Webinar> webinars = webinarService.getPublicWebinars(type, search, pageable);
        return ResponseEntity.ok(webinars.map(WebinarDTO::new));
    }

    // Public Endpoint: Get single webinar detail by slug
    @GetMapping("/webinars/{slug}")
    public ResponseEntity<WebinarDTO> getWebinarBySlug(@PathVariable String slug) {
        Optional<Webinar> opt = webinarService.getBySlug(slug);
        if (opt.isPresent()) {
            // Only show Published/Completed to public, or check status
            Webinar w = opt.get();
            if ("PUBLISHED".equalsIgnoreCase(w.getStatus()) || "COMPLETED".equalsIgnoreCase(w.getStatus())) {
                return ResponseEntity.ok(new WebinarDTO(w));
            }
        }
        return ResponseEntity.notFound().build();
    }

    // DEBUG Endpoint: Get all webinars without any filters
    @GetMapping("/debug/webinars")
    public ResponseEntity<?> getDebugWebinars() {
        return ResponseEntity.ok(webinarService.getAdminWebinars(null, null, true, PageRequest.of(0, 100)));
    }

    // Admin Endpoint: Get all webinars list with filters
    @GetMapping("/admin/webinars")
    public ResponseEntity<Page<WebinarDTO>> getAdminWebinars(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "true") boolean includeArchived,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<Webinar> webinars = webinarService.getAdminWebinars(status, search, includeArchived, pageable);
        return ResponseEntity.ok(webinars.map(WebinarDTO::new));
    }

    // Admin Endpoint: Get webinar detail by ID (for edit previewing)
    @GetMapping("/admin/webinars/{id}")
    public ResponseEntity<WebinarDTO> getAdminWebinarById(@PathVariable Long id) {
        Optional<Webinar> opt = webinarService.getById(id);
        return opt.map(webinar -> ResponseEntity.ok(new WebinarDTO(webinar)))
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Admin Endpoint: Create Webinar
    @PostMapping("/admin/webinars")
    public ResponseEntity<?> createWebinar(@RequestBody WebinarDTO dto, Principal principal) {
        try {
            Webinar webinar = convertToEntity(dto);
            Webinar saved = webinarService.createWebinar(webinar);
            logAdminActivity(principal, "CREATE_WEBINAR", "Created webinar: " + saved.getTitle() + " (Slug: " + saved.getSlug() + ")");
            return ResponseEntity.status(HttpStatus.CREATED).body(new WebinarDTO(saved));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // Admin Endpoint: Update Webinar
    @PutMapping("/admin/webinars/{id}")
    public ResponseEntity<?> updateWebinar(@PathVariable Long id, @RequestBody WebinarDTO dto, Principal principal) {
        try {
            Webinar webinar = convertToEntity(dto);
            Webinar updated = webinarService.updateWebinar(id, webinar);
            logAdminActivity(principal, "UPDATE_WEBINAR", "Updated webinar: " + updated.getTitle() + " (ID: " + id + ")");
            return ResponseEntity.ok(new WebinarDTO(updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An unexpected error occurred: " + e.getMessage());
        }
    }

    // Admin Endpoint: Delete Webinar
    @DeleteMapping("/admin/webinars/{id}")
    public ResponseEntity<Void> deleteWebinar(@PathVariable Long id, Principal principal) {
        Optional<Webinar> opt = webinarService.getById(id);
        if (opt.isPresent()) {
            webinarService.deleteWebinar(id);
            logAdminActivity(principal, "DELETE_WEBINAR", "Archived (Soft deleted) webinar: " + opt.get().getTitle() + " (ID: " + id + ")");
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    private Webinar convertToEntity(WebinarDTO dto) {
        Webinar webinar = new Webinar();
        webinar.setId(dto.getId());
        webinar.setTitle(dto.getTitle());
        webinar.setSlug(dto.getSlug());
        webinar.setDescription(dto.getDescription());
        webinar.setBannerUrl(dto.getBannerUrl());
        webinar.setSpeakerName(dto.getSpeakerName());
        webinar.setSpeakerPhoto(dto.getSpeakerPhoto());
        webinar.setSpeakerDesignation(dto.getSpeakerDesignation());
        webinar.setWebinarDate(dto.getWebinarDate());
        webinar.setStartTime(dto.getStartTime());
        webinar.setEndTime(dto.getEndTime());
        webinar.setTimeZone(dto.getTimeZone());
        webinar.setMeetingLink(dto.getMeetingLink());
        webinar.setRegistrationRequired(dto.getRegistrationRequired());
        webinar.setRegistrationUrl(dto.getRegistrationUrl());
        webinar.setCertificateAvailable(dto.getCertificateAvailable());
        webinar.setStatus(dto.getStatus());
        webinar.setRecordingUrl(dto.getRecordingUrl());
        return webinar;
    }

    private void logAdminActivity(Principal principal, String action, String details) {
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        try {
            activityLogService.logActivity(username, action, details, ip);
        } catch (Exception e) {
            System.err.println("Failed to log admin activity: " + e.getMessage());
        }
    }
}
