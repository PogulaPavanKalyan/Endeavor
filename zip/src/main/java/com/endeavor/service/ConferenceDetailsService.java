package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.ConferenceDetails;
import com.endeavor.repo.ConferenceDetailsRepo;

import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import com.endeavor.repo.SpeakerRepo;
import com.endeavor.repo.ScientificSessionRepo;
import jakarta.transaction.Transactional;

@Service
public class ConferenceDetailsService {

    @Autowired
    private ConferenceDetailsRepo conferenceDetailsRepo;

    @Autowired
    private SpeakerRepo speakerRepo;

    @Autowired
    private ScientificSessionRepo sessionRepo;

    public Optional<ConferenceDetails> getConferenceDetails() {
        List<ConferenceDetails> list = conferenceDetailsRepo.findByIsDeletedFalse();
        if (!list.isEmpty()) {
            return Optional.of(list.get(0));
        }
        return Optional.empty();
    }

    public Optional<ConferenceDetails> getConferenceDetailsById(Long id) {
        return conferenceDetailsRepo.findByIdAndIsDeletedFalse(id);
    }

    public Optional<ConferenceDetails> getConferenceDetailsBySlug(String slug) {
        return conferenceDetailsRepo.findBySlugAndIsDeletedFalse(slug);
    }

    public Optional<ConferenceDetails> getConferenceDetailsBySlugAndStatus(String slug, String status) {
        return conferenceDetailsRepo.findBySlugAndStatusAndIsDeletedFalse(slug, status);
    }

    public List<ConferenceDetails> getAllConferences() {
        return conferenceDetailsRepo.findByIsDeletedFalse();
    }

    public List<ConferenceDetails> getAllConferencesAdmin(boolean includeDeleted) {
        if (includeDeleted) {
            return conferenceDetailsRepo.findAll();
        }
        return conferenceDetailsRepo.findByIsDeletedFalse();
    }

    public ConferenceDetails saveConferenceDetails(ConferenceDetails details) {
        if (details.getPhoto() != null) {
            details.getPhoto().setConferenceDetails(details);
        }

        // Auto Slug Generation
        if (details.getSlug() == null || details.getSlug().trim().isEmpty()) {
            String titleBase = details.getTitle() != null ? details.getTitle() : details.getTittle();
            if (titleBase != null && !titleBase.trim().isEmpty()) {
                String cleanTitle = (titleBase + (details.getYear() != null ? " " + details.getYear() : ""))
                    .toLowerCase()
                    .replaceAll("[^a-z0-9\\s-]", "")
                    .replaceAll("\\s+", "-");
                
                String generatedSlug = cleanTitle;
                int count = 1;
                while (true) {
                    Optional<ConferenceDetails> existing = conferenceDetailsRepo.findBySlug(generatedSlug);
                    if (existing.isEmpty() || (details.getId() != null && existing.get().getId().equals(details.getId()))) {
                        break;
                    }
                    generatedSlug = cleanTitle + "-" + count++;
                }
                details.setSlug(generatedSlug);
            }
        }

        return conferenceDetailsRepo.save(details);
    }

    @Transactional
    public void deleteConferenceDetails(Long id) {
        Optional<ConferenceDetails> confOpt = conferenceDetailsRepo.findById(id);
        if (confOpt.isPresent()) {
            ConferenceDetails details = confOpt.get();
            details.setIsDeleted(true);
            conferenceDetailsRepo.save(details);
        }
    }

    @Transactional
    public void restoreConferenceDetails(Long id) {
        Optional<ConferenceDetails> confOpt = conferenceDetailsRepo.findById(id);
        if (confOpt.isPresent()) {
            ConferenceDetails details = confOpt.get();
            details.setIsDeleted(false);
            conferenceDetailsRepo.save(details);
        }
    }

    @Transactional
    public void forceDeleteConferenceDetails(Long id) {
        List<com.endeavor.entity.Speaker> speakers = speakerRepo.findByConferenceId(id);
        if (!speakers.isEmpty()) {
            speakerRepo.deleteAll(speakers);
        }

        List<com.endeavor.entity.ScientificSession> sessions = sessionRepo.findByConferenceId(id);
        if (!sessions.isEmpty()) {
            sessionRepo.deleteAll(sessions);
        }

        conferenceDetailsRepo.deleteById(id);
    }

    public Map<String, Object> checkReadiness(Long id) {
        Optional<ConferenceDetails> confOpt = conferenceDetailsRepo.findById(id);
        if (confOpt.isEmpty()) {
            return Map.of("isReady", false, "error", "Conference not found");
        }
        
        ConferenceDetails conf = confOpt.get();
        List<Map<String, Object>> checks = new ArrayList<>();
        boolean isReady = true;

        // Check 1: Venue configured
        boolean venueOk = conf.getVenue() != null && !conf.getVenue().trim().isEmpty();
        checks.add(Map.of("name", "Venue Configuration", "status", venueOk ? "PASS" : "FAIL", "required", true));
        if (!venueOk) isReady = false;

        // Check 2: Dates configured
        boolean datesOk = conf.getStartDate() != null && !conf.getStartDate().trim().isEmpty() &&
                          conf.getEndDate() != null && !conf.getEndDate().trim().isEmpty();
        checks.add(Map.of("name", "Conference Dates", "status", datesOk ? "PASS" : "FAIL", "required", true));
        if (!datesOk) isReady = false;

        // Check 3: Logo Uploaded
        boolean logoOk = conf.getPhoto() != null && conf.getPhoto().getFileName() != null;
        checks.add(Map.of("name", "Branding Logo", "status", logoOk ? "PASS" : "FAIL", "required", true));
        if (!logoOk) isReady = false;

        // Check 4: Contact Info
        boolean contactOk = conf.getContactEmail() != null && !conf.getContactEmail().trim().isEmpty() &&
                            conf.getContactPhone() != null && !conf.getContactPhone().trim().isEmpty();
        checks.add(Map.of("name", "Contact Information", "status", contactOk ? "PASS" : "FAIL", "required", true));
        if (!contactOk) isReady = false;

        // Check 5: Pricing Tiers
        boolean pricingOk = conf.getPricingTiers() != null && !conf.getPricingTiers().isEmpty();
        checks.add(Map.of("name", "Pricing Structures", "status", pricingOk ? "PASS" : "FAIL", "required", true));
        if (!pricingOk) isReady = false;

        // Check 6: Speakers Assigned (Optional check, doesn't block readiness but shows warning)
        long speakersCount = speakerRepo.findByConferenceId(id).size();
        boolean speakersOk = speakersCount > 0;
        checks.add(Map.of("name", "Speakers Assigned", "status", speakersOk ? "PASS" : "WARN", "required", false));

        // Check 7: Sessions Program Schedulers (Optional check)
        long sessionsCount = sessionRepo.findByConferenceId(id).size();
        boolean sessionsOk = sessionsCount > 0;
        checks.add(Map.of("name", "Program Sessions", "status", sessionsOk ? "PASS" : "WARN", "required", false));

        Map<String, Object> result = new HashMap<>();
        result.put("isReady", isReady);
        result.put("checks", checks);
        return result;
    }
}
