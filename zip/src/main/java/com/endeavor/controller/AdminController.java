package com.endeavor.controller;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.AbstractSubmission;
import com.endeavor.entity.BrochureRequest;
import com.endeavor.entity.ConferenceDetails;
import com.endeavor.entity.ConferencePhoto;
import com.endeavor.entity.ContactMessage;
import com.endeavor.entity.Registration;
import com.endeavor.entity.ScientificSession;
import com.endeavor.entity.Speaker;
import com.endeavor.entity.SpeakerPhoto;
import com.endeavor.entity.ConferenceSeries;
import com.endeavor.entity.AdminActivityLog;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;
import com.endeavor.service.AbstractSubmissionService;
import com.endeavor.service.BrochureRequestService;
import com.endeavor.service.ConferenceDetailsService;
import com.endeavor.service.ConferencePhotoService;
import com.endeavor.service.ContactMessageService;
import com.endeavor.service.RegistrationService;
import com.endeavor.service.ScientificSessionService;
import com.endeavor.service.SpeakerPhotoService;
import com.endeavor.service.SpeakerService;
import com.endeavor.entity.Sponsor;
import com.endeavor.entity.SponsorImage;
import com.endeavor.service.SponsorService;
import com.endeavor.service.SponsorImageService;
import com.endeavor.entity.HeroSection;
import com.endeavor.entity.SiteStatistics;
import com.endeavor.entity.TrustBadge;
import com.endeavor.service.HeroSectionService;
import com.endeavor.service.SiteStatisticsService;
import com.endeavor.service.TrustBadgeService;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class AdminController {

    @Autowired
    private SpeakerService speakerService;

    @Autowired
    private ScientificSessionService sessionService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AbstractSubmissionService abstractSubmissionService;

    @Autowired
    private BrochureRequestService brochureRequestService;

    @Autowired
    private ContactMessageService contactMessageService;

    @Autowired
    private ConferenceDetailsService conferenceDetailsService;

    @Autowired
    private SpeakerPhotoService speakerPhotoService;

    @Autowired
    private ConferencePhotoService conferencePhotoService;

    @Autowired
    private SponsorService sponsorService;

    @Autowired
    private SponsorImageService sponsorImageService;

    @Autowired
    private HeroSectionService heroSectionService;

    @Autowired
    private SiteStatisticsService siteStatisticsService;

    @Autowired
    private TrustBadgeService trustBadgeService;

    @Autowired
    private com.endeavor.repo.UserRepo userRepo;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.endeavor.repo.ConferenceSeriesRepo conferenceSeriesRepo;

    @Autowired
    private com.endeavor.service.AdminActivityLogService activityLogService;

    @Autowired
    private com.endeavor.service.ConferencePageService conferencePageService;

    @Autowired
    private jakarta.servlet.http.HttpServletRequest servletRequest;

    @Autowired
    private jakarta.persistence.EntityManager entityManager;

    @Autowired
    private com.endeavor.repo.ConferenceDetailsRepo conferenceDetailsRepo;

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody java.util.Map<String, String> request, java.security.Principal principal) {
        String username = principal.getName();
        String oldPassword = request.get("oldPassword");
        String newPassword = request.get("newPassword");
        
        com.endeavor.entity.Users user = userRepo.findByUsername(username);
        if (user != null && passwordEncoder.matches(oldPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepo.save(user);
            return ResponseEntity.ok(java.util.Map.of("message", "Password changed successfully"));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid old password");
    }

    @GetMapping("/registrations")
    public ResponseEntity<List<Registration>> getAllRegistrations(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(registrationService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(registrationService.getAllRegistrations());
    }

    @GetMapping("/abstracts")
    public ResponseEntity<List<AbstractSubmission>> getAllAbstracts(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(abstractSubmissionService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(abstractSubmissionService.getAllAbstracts());
    }

    @PutMapping("/abstracts/{id}/status")
    public ResponseEntity<AbstractSubmission> updateAbstractStatus(@PathVariable Long id, @RequestParam String status) {
        return abstractSubmissionService.getById(id).map(submission -> {
            submission.setStatus(status);
            AbstractSubmission updated = abstractSubmissionService.save(submission);
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/abstracts/{id}")
    public ResponseEntity<Void> deleteAbstract(@PathVariable Long id) {
        if (abstractSubmissionService.getById(id).isPresent()) {
            abstractSubmissionService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/contacts")
    public ResponseEntity<List<ContactMessage>> getAllContacts(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(contactMessageService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(contactMessageService.getAllContacts());
    }

    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<Void> deleteContact(@PathVariable Long id) {
        if (contactMessageService.getById(id).isPresent()) {
            contactMessageService.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/brochures")
    public ResponseEntity<List<BrochureRequest>> getAllBrochures(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(brochureRequestService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(brochureRequestService.getAllBrochures());
    }

    @PostMapping("/speakers")
    public ResponseEntity<Speaker> createSpeaker(@RequestBody Speaker speaker) {
        Speaker saved = speakerService.saveSpeaker(speaker);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/speakers/{id}")
    public ResponseEntity<Speaker> updateSpeaker(@PathVariable Long id, @RequestBody Speaker speakerDetails) {
        Optional<Speaker> speakerOpt = speakerService.getSpeakerById(id);
        if (speakerOpt.isPresent()) {
            Speaker speaker = speakerOpt.get();
            speaker.setName(speakerDetails.getName());
            speaker.setDesignation(speakerDetails.getDesignation());
            speaker.setAffiliation(speakerDetails.getAffiliation());
            speaker.setCountry(speakerDetails.getCountry());
            speaker.setBio(speakerDetails.getBio());
            speaker.setType(speakerDetails.getType());
            if (speakerDetails.getPhoto() != null) {
                speaker.setPhoto(speakerDetails.getPhoto());
            }
            Speaker updated = speakerService.saveSpeaker(speaker);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/speakers/{id}")
    public ResponseEntity<Void> deleteSpeaker(@PathVariable Long id) {
        Optional<Speaker> speakerOpt = speakerService.getSpeakerById(id);
        if (speakerOpt.isPresent()) {
            speakerService.deleteSpeaker(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/sessions")
    public ResponseEntity<ScientificSession> createSession(@RequestBody ScientificSession session) {
        ScientificSession saved = sessionService.saveSession(session);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/sessions/{id}")
    public ResponseEntity<ScientificSession> updateSession(@PathVariable Long id, @RequestBody ScientificSession sessionDetails) {
        Optional<ScientificSession> sessionOpt = sessionService.getSessionById(id);
        if (sessionOpt.isPresent()) {
            ScientificSession session = sessionOpt.get();
            session.setName(sessionDetails.getName());
            session.setDescription(sessionDetails.getDescription());
            session.setType(sessionDetails.getType());
            session.setTimeRange(sessionDetails.getTimeRange());
            session.setSpeakerName(sessionDetails.getSpeakerName());
            session.setAffiliation(sessionDetails.getAffiliation());
            ScientificSession updated = sessionService.saveSession(session);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        Optional<ScientificSession> sessionOpt = sessionService.getSessionById(id);
        if (sessionOpt.isPresent()) {
            sessionService.deleteSession(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/conference-details")
    public ResponseEntity<ConferenceDetails> updateConferenceDetails(@RequestBody ConferenceDetails details, java.security.Principal principal) {
        ConferenceDetails saved = conferenceDetailsService.saveConferenceDetails(details);
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        activityLogService.logActivity(username, "SAVE_CONFERENCE", "Saved/updated conference: " + (saved.getTitle() != null ? saved.getTitle() : saved.getTittle()) + " (Slug: " + saved.getSlug() + ")", ip);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/conference-details/{id}")
    public ResponseEntity<Void> deleteConferenceDetails(@PathVariable Long id, java.security.Principal principal) {
        Optional<ConferenceDetails> confOpt = conferenceDetailsService.getConferenceDetailsById(id);
        if (confOpt.isPresent()) {
            conferenceDetailsService.deleteConferenceDetails(id);
            String username = principal != null ? principal.getName() : "admin";
            String ip = servletRequest.getRemoteAddr();
            activityLogService.logActivity(username, "SOFT_DELETE_CONFERENCE", "Archived conference ID " + id, ip);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/speakers/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSpeakerPhoto(@RequestParam("file") MultipartFile file) {
        try {
            SpeakerPhoto savedPhoto = speakerPhotoService.saveSpeakerPhoto(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPhoto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save speaker photo: " + e.getMessage());
        }
    }

    @PostMapping(value = "/conference-details/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadConferencePhoto(@RequestParam("file") MultipartFile file) {
        try {
            ConferencePhoto savedPhoto = conferencePhotoService.saveConferencePhoto(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedPhoto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save conference photo: " + e.getMessage());
        }
    }

    @PostMapping(value = "/speakers/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSpeakerPhotoWithId(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<Speaker> speakerOpt = speakerService.getSpeakerById(id);
        if (!speakerOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Speaker not found with ID: " + id);
        }
        try {
            SpeakerPhoto savedPhoto = speakerPhotoService.saveSpeakerPhoto(file);
            Speaker speaker = speakerOpt.get();
            speaker.setPhoto(savedPhoto);
            Speaker updated = speakerService.saveSpeaker(speaker);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save speaker photo: " + e.getMessage());
        }
    }

    @PostMapping(value = "/conference-details/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadConferencePhotoWithId(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<ConferenceDetails> detailsOpt = conferenceDetailsService.getConferenceDetailsById(id);
        if (!detailsOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ConferenceDetails not found with ID: " + id);
        }
        try {
            ConferencePhoto savedPhoto = conferencePhotoService.saveConferencePhoto(file);
            ConferenceDetails details = detailsOpt.get();
            details.setPhoto(savedPhoto);
            ConferenceDetails updated = conferenceDetailsService.saveConferenceDetails(details);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save conference photo: " + e.getMessage());
        }
    }

    @PostMapping(value = "/conference-details/{id}/brochure", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadConferenceBrochure(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<ConferenceDetails> detailsOpt = conferenceDetailsService.getConferenceDetailsById(id);
        if (!detailsOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("ConferenceDetails not found with ID: " + id);
        }
        try {
            if (file.isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("File is empty");
            }
            String uploadsDir = System.getProperty("user.dir") + "/uploads/brochures/";
            java.io.File dir = new java.io.File(uploadsDir);
            if (!dir.exists()) dir.mkdirs();
            
            String originalFileName = file.getOriginalFilename();
            String extension = "";
            if (originalFileName != null && originalFileName.contains(".")) {
                extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            String uniqueName = java.util.UUID.randomUUID().toString() + extension;
            java.nio.file.Files.write(java.nio.file.Paths.get(uploadsDir + uniqueName), file.getBytes());
            
            ConferenceDetails details = detailsOpt.get();
            details.setBrochureFileName(uniqueName);
            ConferenceDetails updated = conferenceDetailsService.saveConferenceDetails(details);
            return ResponseEntity.ok(updated);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save conference brochure: " + e.getMessage());
        }
    }

    @GetMapping("/sponsors")
    public ResponseEntity<List<Sponsor>> getAllSponsors(@RequestParam(required = false) Long conferenceId) {
        if (conferenceId != null) {
            return ResponseEntity.ok(sponsorService.getByConferenceId(conferenceId));
        }
        return ResponseEntity.ok(sponsorService.getAllSponsors());
    }

    @PostMapping("/sponsors")
    public ResponseEntity<Sponsor> createSponsor(@RequestBody Sponsor sponsor) {
        Sponsor saved = sponsorService.saveSponsor(sponsor);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/sponsors/{id}")
    public ResponseEntity<Sponsor> updateSponsor(@PathVariable Long id, @RequestBody Sponsor sponsorDetails) {
        Optional<Sponsor> sponsorOpt = sponsorService.getSponsorById(id);
        if (sponsorOpt.isPresent()) {
            Sponsor sponsor = sponsorOpt.get();
            sponsor.setSponsorName(sponsorDetails.getSponsorName());
            sponsor.setDescription(sponsorDetails.getDescription());
            if (sponsorDetails.getImage() != null) {
                sponsor.setImage(sponsorDetails.getImage());
            }
            Sponsor updated = sponsorService.saveSponsor(sponsor);
            return ResponseEntity.ok(updated);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/sponsors/{id}")
    public ResponseEntity<Void> deleteSponsor(@PathVariable Long id) {
        Optional<Sponsor> sponsorOpt = sponsorService.getSponsorById(id);
        if (sponsorOpt.isPresent()) {
            sponsorService.deleteSponsor(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/sponsors/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSponsorImage(@RequestParam("file") MultipartFile file) {
        try {
            SponsorImage savedImage = sponsorImageService.saveSponsorImage(file);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedImage);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save sponsor image: " + e.getMessage());
        }
    }

    @PostMapping(value = "/sponsors/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadSponsorImageWithId(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<Sponsor> sponsorOpt = sponsorService.getSponsorById(id);
        if (!sponsorOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Sponsor not found with ID: " + id);
        }
        try {
            SponsorImage savedImage = sponsorImageService.saveSponsorImage(file);
            Sponsor sponsor = sponsorOpt.get();
            sponsor.setImage(savedImage);
            Sponsor updated = sponsorService.saveSponsor(sponsor);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to save sponsor image: " + e.getMessage());
        }
    }

    // ── HERO SECTION ADMIN ENDPOINTS ────────────────────────────────────────

    @GetMapping("/hero")
    public ResponseEntity<List<HeroSection>> getAllHeroes() {
        return ResponseEntity.ok(heroSectionService.getAllHeroes());
    }

    @PostMapping("/hero")
    public ResponseEntity<HeroSection> createHero(@RequestBody HeroSection hero) {
        HeroSection saved = heroSectionService.save(hero);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/hero/{id}")
    public ResponseEntity<HeroSection> updateHero(@PathVariable Long id, @RequestBody HeroSection heroDetails) {
        return heroSectionService.findById(id).map(hero -> {
            hero.setTitle(heroDetails.getTitle());
            hero.setSubtitle(heroDetails.getSubtitle());
            hero.setDescription(heroDetails.getDescription());
            if (heroDetails.getBackgroundImage() != null) hero.setBackgroundImage(heroDetails.getBackgroundImage());
            if (heroDetails.getHeroImage() != null) hero.setHeroImage(heroDetails.getHeroImage());
            hero.setButton1Text(heroDetails.getButton1Text());
            hero.setButton1Link(heroDetails.getButton1Link());
            hero.setButton2Text(heroDetails.getButton2Text());
            hero.setButton2Link(heroDetails.getButton2Link());
            hero.setStatus(heroDetails.getStatus());
            return ResponseEntity.ok(heroSectionService.save(hero));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/hero/{id}/activate")
    public ResponseEntity<Void> activateHero(@PathVariable Long id) {
        heroSectionService.activate(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/hero/{id}")
    public ResponseEntity<Void> deleteHero(@PathVariable Long id) {
        heroSectionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(value = "/hero/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadHeroBackgroundImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return heroSectionService.findById(id).map(hero -> {
            try {
                String uploadsDir = System.getProperty("user.dir") + "/uploads/hero/";
                java.io.File dir = new java.io.File(uploadsDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_bg_" + file.getOriginalFilename();
                java.nio.file.Files.write(java.nio.file.Paths.get(uploadsDir + fileName), file.getBytes());
                hero.setBackgroundImage(fileName);
                return ResponseEntity.ok((Object) heroSectionService.save(hero));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body((Object) ("Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(value = "/hero/{id}/hero-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadHeroSectionImage(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        return heroSectionService.findById(id).map(hero -> {
            try {
                String uploadsDir = System.getProperty("user.dir") + "/uploads/hero/";
                java.io.File dir = new java.io.File(uploadsDir);
                if (!dir.exists()) dir.mkdirs();
                String fileName = System.currentTimeMillis() + "_hero_" + file.getOriginalFilename();
                java.nio.file.Files.write(java.nio.file.Paths.get(uploadsDir + fileName), file.getBytes());
                hero.setHeroImage(fileName);
                return ResponseEntity.ok((Object) heroSectionService.save(hero));
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body((Object) ("Upload failed: " + e.getMessage()));
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    // ── STATISTICS ADMIN ENDPOINTS ───────────────────────────────────────────

    @GetMapping("/statistics")
    public ResponseEntity<SiteStatistics> getAdminStatistics() {
        return ResponseEntity.ok(siteStatisticsService.getOrCreate());
    }

    @PostMapping("/statistics")
    public ResponseEntity<SiteStatistics> updateStatistics(@RequestBody SiteStatistics stats) {
        SiteStatistics updated = siteStatisticsService.update(stats);
        return ResponseEntity.ok(updated);
    }

    // ── TRUST BADGES ADMIN ENDPOINTS ────────────────────────────────────────

    @GetMapping("/trust-badges")
    public ResponseEntity<List<TrustBadge>> getAllTrustBadges() {
        return ResponseEntity.ok(trustBadgeService.getAllBadges());
    }

    @PostMapping("/trust-badges")
    public ResponseEntity<TrustBadge> createTrustBadge(@RequestBody TrustBadge badge) {
        TrustBadge saved = trustBadgeService.save(badge);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/trust-badges/{id}")
    public ResponseEntity<TrustBadge> updateTrustBadge(@PathVariable Long id, @RequestBody TrustBadge badgeDetails) {
        return trustBadgeService.findById(id).map(badge -> {
            badge.setIcon(badgeDetails.getIcon());
            badge.setTitle(badgeDetails.getTitle());
            badge.setDescription(badgeDetails.getDescription());
            badge.setDisplayOrder(badgeDetails.getDisplayOrder());
            badge.setActive(badgeDetails.getActive());
            return ResponseEntity.ok(trustBadgeService.save(badge));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/trust-badges/{id}")
    public ResponseEntity<Void> deleteTrustBadge(@PathVariable Long id) {
        trustBadgeService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // ── PLATFORM ENHANCEMENTS NEW ENDPOINTS ──────────────────────────────────

    @GetMapping("/series")
    public ResponseEntity<List<ConferenceSeries>> getAllSeries() {
        return ResponseEntity.ok(conferenceSeriesRepo.findAll());
    }

    @PostMapping("/series")
    public ResponseEntity<ConferenceSeries> createSeries(@RequestBody ConferenceSeries series, java.security.Principal principal) {
        if (series.getCreatedAt() == null) {
            series.setCreatedAt(java.time.LocalDateTime.now());
        }
        ConferenceSeries saved = conferenceSeriesRepo.save(series);
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        activityLogService.logActivity(username, "CREATE_SERIES", "Created conference series: " + saved.getName(), ip);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/conferences")
    public ResponseEntity<List<ConferenceDetails>> getConferencesAdmin(
            @RequestParam(required = false, defaultValue = "false") boolean includeDeleted) {
        return ResponseEntity.ok(conferenceDetailsService.getAllConferencesAdmin(includeDeleted));
    }

    @PutMapping("/conference-details/{id}/restore")
    public ResponseEntity<Void> restoreConferenceDetails(@PathVariable Long id, java.security.Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        conferenceDetailsService.restoreConferenceDetails(id);
        activityLogService.logActivity(username, "RESTORE_CONFERENCE", "Restored archived conference ID " + id, ip);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/conference-details/{id}/force")
    public ResponseEntity<Void> forceDeleteConferenceDetails(@PathVariable Long id, java.security.Principal principal) {
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        conferenceDetailsService.forceDeleteConferenceDetails(id);
        activityLogService.logActivity(username, "FORCE_DELETE_CONFERENCE", "Permanently deleted conference ID " + id, ip);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/conferences/{id}/readiness")
    public ResponseEntity<Map<String, Object>> checkReadiness(@PathVariable Long id) {
        return ResponseEntity.ok(conferenceDetailsService.checkReadiness(id));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<AdminActivityLog>> getAllLogs() {
        return ResponseEntity.ok(activityLogService.getAllLogs());
    }

    @GetMapping("/diagnostics")
    public ResponseEntity<Map<String, Object>> getDiagnostics(java.security.Principal principal) {
        Map<String, Object> report = new HashMap<>();
        
        try {
            // 1. Orphaned photos
            List<?> orphanedPhotos = entityManager.createNativeQuery(
                "SELECT cd.id FROM conference_details cd " +
                "LEFT JOIN conference_photos cp ON cd.photo_id = cp.id " +
                "WHERE cd.photo_id IS NOT NULL AND cp.id IS NULL"
            ).getResultList();
            report.put("orphanedConferencePhotosCount", orphanedPhotos.size());
        } catch (Exception e) {
            report.put("orphanedConferencePhotosCount", 0);
        }

        try {
            // 2. Orphaned speaker photos
            List<?> orphanedSpeakerPhotos = entityManager.createNativeQuery(
                "SELECT s.id FROM speakers s " +
                "LEFT JOIN speaker_photos sp ON s.photo_id = sp.id " +
                "WHERE s.photo_id IS NOT NULL AND sp.id IS NULL"
            ).getResultList();
            report.put("orphanedSpeakerPhotosCount", orphanedSpeakerPhotos.size());
        } catch (Exception e) {
            report.put("orphanedSpeakerPhotosCount", 0);
        }

        try {
            // 3. Orphaned sponsor images
            List<?> orphanedSponsorImages = entityManager.createNativeQuery(
                "SELECT sp.id FROM sponsors sp " +
                "LEFT JOIN sponsor_images si ON sp.image_id = si.id " +
                "WHERE sp.image_id IS NOT NULL AND si.id IS NULL"
            ).getResultList();
            report.put("orphanedSponsorImagesCount", orphanedSponsorImages.size());
        } catch (Exception e) {
            report.put("orphanedSponsorImagesCount", 0);
        }

        try {
            // 4. Duplicate registrations count
            List<?> duplicateRegistrations = entityManager.createNativeQuery(
                "SELECT email FROM registrations GROUP BY email HAVING COUNT(*) > 1"
            ).getResultList();
            report.put("duplicateRegistrationsCount", duplicateRegistrations.size());
        } catch (Exception e) {
            report.put("duplicateRegistrationsCount", 0);
        }

        try {
            // 5. Missing abstract files
            List<?> missingAbstractFiles = entityManager.createNativeQuery(
                "SELECT id FROM abstract_submissions WHERE file_path IS NULL OR file_path = ''"
            ).getResultList();
            report.put("missingAbstractFilesCount", missingAbstractFiles.size());
        } catch (Exception e) {
            report.put("missingAbstractFilesCount", 0);
        }

        try {
            // 6. Incomplete sessions count
            List<?> incompleteSessions = entityManager.createNativeQuery(
                "SELECT id FROM sessions WHERE name IS NULL OR time_range IS NULL OR time_range = ''"
            ).getResultList();
            report.put("incompleteSessionsCount", incompleteSessions.size());
        } catch (Exception e) {
            report.put("incompleteSessionsCount", 0);
        }

        report.put("totalConferences", conferenceDetailsRepo.count());
        report.put("totalActiveConferences", conferenceDetailsRepo.findByIsDeletedFalse().size());
        report.put("totalArchivedConferences", conferenceDetailsRepo.count() - conferenceDetailsRepo.findByIsDeletedFalse().size());
        
        return ResponseEntity.ok(report);
    }

    @PostMapping("/conferences/{id}/clone")
    public ResponseEntity<ConferenceDetails> cloneConference(
            @PathVariable Long id, 
            @RequestBody Map<String, Object> payload, 
            java.security.Principal principal) {
        
        String username = principal != null ? principal.getName() : "admin";
        String ip = servletRequest.getRemoteAddr();
        
        Optional<ConferenceDetails> sourceOpt = conferenceDetailsRepo.findById(id);
        if (sourceOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        ConferenceDetails source = sourceOpt.get();
        
        // Clone ConferenceDetails
        ConferenceDetails copy = new ConferenceDetails();
        
        String targetYearStr = payload.get("year").toString();
        Integer targetYear = Integer.parseInt(targetYearStr);
        String targetStartDate = payload.get("startDate").toString();
        String targetEndDate = payload.get("endDate").toString();
        
        String baseTitle = source.getTitle() != null ? source.getTitle() : source.getTittle();
        String targetTitle = baseTitle;
        if (source.getYear() != null && baseTitle.contains(source.getYear().toString())) {
            targetTitle = baseTitle.replace(source.getYear().toString(), targetYear.toString());
        } else {
            targetTitle = baseTitle + " " + targetYear;
        }
        
        copy.setTitle(targetTitle);
        copy.setStartDate(targetStartDate);
        copy.setEndDate(targetEndDate);
        copy.setYear(targetYear);
        copy.setVenue(source.getVenue());
        copy.setMapUrl(source.getMapUrl());
        copy.setDescription(source.getDescription());
        copy.setContactEmail(source.getContactEmail());
        copy.setContactPhone(source.getContactPhone());
        copy.setThemePrimary(source.getThemePrimary());
        copy.setThemePrimaryHover(source.getThemePrimaryHover());
        copy.setThemeAccent(source.getThemeAccent());
        copy.setMetaTitle(source.getMetaTitle());
        copy.setMetaDescription(source.getMetaDescription());
        copy.setCity(source.getCity());
        copy.setCountry(source.getCountry());
        copy.setShortDescription(source.getShortDescription());
        copy.setStatus("DRAFT"); // Cloned conference starts as DRAFT
        copy.setIsFeatured(false);
        copy.setSeries(source.getSeries());
        // getScientificSessions has been removed and migrated to ScientificTracks.
        // Copying tracks for cloned conferences should be done by TrackController, or here via TrackService.
        // Since we don't have trackService autowired here easily, we'll let them recreate tracks.
        
        if (source.getPricingTiers() != null) {
            List<com.endeavor.entity.PricingTier> clonedTiers = new ArrayList<>();
            for (com.endeavor.entity.PricingTier tier : source.getPricingTiers()) {
                clonedTiers.add(new com.endeavor.entity.PricingTier(
                    tier.getType(),
                    tier.getEarlyPrice(),
                    tier.getMidPrice(),
                    tier.getFinalPrice()
                ));
            }
            copy.setPricingTiers(clonedTiers);
        }
        
        ConferenceDetails savedCopy = conferenceDetailsService.saveConferenceDetails(copy);
        Long newConfId = savedCopy.getId();
        
        // Clone ConferencePages
        try {
            List<com.endeavor.entity.ConferencePage> sourcePages = conferencePageService.getByConferenceId(id);
            for (com.endeavor.entity.ConferencePage page : sourcePages) {
                com.endeavor.entity.ConferencePage pageCopy = new com.endeavor.entity.ConferencePage();
                pageCopy.setConferenceId(newConfId);
                pageCopy.setPageKey(page.getPageKey());
                pageCopy.setLabel(page.getLabel());
                pageCopy.setRoute(page.getRoute());
                pageCopy.setIsEnabled(page.getIsEnabled());
                pageCopy.setDisplayOrder(page.getDisplayOrder());
                conferencePageService.save(pageCopy);
            }
        } catch (Exception e) {
            System.out.println("No pages cloned: " + e.getMessage());
        }
        
        // Clone Speakers
        try {
            List<Speaker> sourceSpeakers = speakerService.getByConferenceId(id);
            for (Speaker sp : sourceSpeakers) {
                Speaker spCopy = new Speaker();
                spCopy.setConferenceId(newConfId);
                spCopy.setName(sp.getName());
                spCopy.setDesignation(sp.getDesignation());
                spCopy.setAffiliation(sp.getAffiliation());
                spCopy.setCountry(sp.getCountry());
                spCopy.setBio(sp.getBio());
                spCopy.setType(sp.getType());
                spCopy.setSpeakerAbstract(sp.getSpeakerAbstract());
                if (sp.getPhoto() != null) {
                    spCopy.setPhoto(sp.getPhoto());
                }
                speakerService.saveSpeaker(spCopy);
            }
        } catch (Exception e) {
            System.out.println("No speakers cloned: " + e.getMessage());
        }
        
        // Clone Sessions
        try {
            List<ScientificSession> sourceSessions = sessionService.getByConferenceId(id);
            for (ScientificSession s : sourceSessions) {
                ScientificSession sCopy = new ScientificSession();
                sCopy.setConferenceId(newConfId);
                sCopy.setName(s.getName());
                sCopy.setDescription(s.getDescription());
                sCopy.setType(s.getType());
                sCopy.setTimeRange(s.getTimeRange());
                sCopy.setSpeakerName(s.getSpeakerName());
                sCopy.setAffiliation(s.getAffiliation());
                sCopy.setTrackId(s.getTrackId());
                sessionService.saveSession(sCopy);
            }
        } catch (Exception e) {
            System.out.println("No sessions cloned: " + e.getMessage());
        }
        
        // Clone Sponsors
        try {
            List<Sponsor> sourceSponsors = sponsorService.getByConferenceId(id);
            for (Sponsor sp : sourceSponsors) {
                Sponsor spCopy = new Sponsor();
                spCopy.setConferenceId(newConfId);
                spCopy.setSponsorName(sp.getSponsorName());
                spCopy.setDescription(sp.getDescription());
                spCopy.setTier(sp.getTier());
                if (sp.getImage() != null) {
                    spCopy.setImage(sp.getImage());
                }
                sponsorService.saveSponsor(spCopy);
            }
        } catch (Exception e) {
            System.out.println("No sponsors cloned: " + e.getMessage());
        }
        
        activityLogService.logActivity(username, "CLONE_CONFERENCE", "Cloned conference ID " + id + " to target new ID " + newConfId + " (Year " + targetYear + ")", ip);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(savedCopy);
    }
}
