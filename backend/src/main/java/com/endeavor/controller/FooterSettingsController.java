package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.ConferenceDetails;
import com.endeavor.entity.FooterSettings;
import com.endeavor.service.ConferenceDetailsService;
import com.endeavor.service.FooterSettingsService;
import com.endeavor.service.SecurityUtils;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
public class FooterSettingsController {

    @Autowired
    private FooterSettingsService footerSettingsService;

    @Autowired
    private ConferenceDetailsService conferenceDetailsService;

    /**
     * Public endpoint to fetch footer settings for a specific conference
     */
    @GetMapping("/api/footer")
    public ResponseEntity<FooterSettings> getPublicFooter(
            @RequestParam(required = false) Long conferenceId,
            @RequestParam(required = false) String slug) {
        
        Long targetId = conferenceId;

        if (targetId == null && slug != null && !slug.trim().isEmpty() && !slug.equals("generic")) {
            Optional<ConferenceDetails> detailsOpt = conferenceDetailsService.getConferenceDetailsBySlug(slug);
            if (detailsOpt.isPresent()) {
                targetId = detailsOpt.get().getId();
            }
        }

        if (targetId == null) {
            // Check if logged in admin is accessing
            targetId = SecurityUtils.getTenantConferenceId();
        }

        if (targetId == null) {
            // Fallback to first available conference or generic default
            Optional<ConferenceDetails> defaultConf = conferenceDetailsService.getConferenceDetails();
            if (defaultConf.isPresent()) {
                targetId = defaultConf.get().getId();
            }
        }

        FooterSettings settings = footerSettingsService.getByConferenceId(targetId);
        return ResponseEntity.ok(settings);
    }

    /**
     * Admin endpoint to view footer settings for current conference workspace
     */
    @GetMapping("/api/admin/footer")
    public ResponseEntity<FooterSettings> getAdminFooter(@RequestParam(required = false) Long conferenceId) {
        Long tenantId = SecurityUtils.getTenantConferenceId(conferenceId);
        if (tenantId == null) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(footerSettingsService.getByConferenceId(tenantId));
    }

    /**
     * Admin endpoint to update footer settings for current conference workspace
     */
    @PutMapping("/api/admin/footer")
    public ResponseEntity<FooterSettings> updateFooter(
            @RequestParam(required = false) Long conferenceId,
            @RequestBody FooterSettings incoming) {

        Long targetConferenceId = conferenceId;
        if (targetConferenceId == null && incoming.getConferenceId() != null) {
            targetConferenceId = incoming.getConferenceId();
        }

        // Strict tenant isolation via SecurityUtils
        Long tenantId = SecurityUtils.getTenantConferenceId(targetConferenceId);
        if (tenantId == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        FooterSettings saved = footerSettingsService.saveFooterSettings(tenantId, incoming);
        return ResponseEntity.ok(saved);
    }

    /**
     * Upload files (PDFs / Images) for Footer CMS pages
     */
    @PostMapping(value = "/api/admin/footer/upload", consumes = "multipart/form-data")
    public ResponseEntity<Map<String, String>> uploadFooterFile(@RequestParam("file") MultipartFile file) {
        try {
            String fileUrl = footerSettingsService.storeFile(file);
            Map<String, String> response = new HashMap<>();
            response.put("url", fileUrl);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
