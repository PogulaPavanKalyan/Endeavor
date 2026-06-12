package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.endeavor.entity.Webinar;
import com.endeavor.repo.WebinarRepository;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class WebinarService {

    @Autowired
    private WebinarRepository webinarRepository;

    public Optional<Webinar> getById(Long id) {
        return webinarRepository.findById(id);
    }

    public Optional<Webinar> getBySlug(String slug) {
        return webinarRepository.findBySlug(slug);
    }

    public Page<Webinar> getPublicWebinars(String type, String search, Pageable pageable) {
        String today = LocalDate.now().toString(); // YYYY-MM-DD
        
        if ("upcoming".equalsIgnoreCase(type)) {
            return webinarRepository.findUpcomingPublicWebinars(search, today, pageable);
        } else if ("past".equalsIgnoreCase(type)) {
            return webinarRepository.findPastPublicWebinars(search, today, pageable);
        } else {
            return webinarRepository.findPublicWebinars(search, pageable);
        }
    }

    public Page<Webinar> getAdminWebinars(String status, String search, boolean includeArchived, Pageable pageable) {
        if (includeArchived) {
            return webinarRepository.findByFilters(status, search, pageable);
        } else {
            return webinarRepository.findByFiltersExcludingArchived(status, search, pageable);
        }
    }

    @Transactional
    public Webinar createWebinar(Webinar webinar) {
        validateWebinar(webinar);
        webinar.setSlug(generateUniqueSlug(webinar.getTitle(), null));
        return webinarRepository.save(webinar);
    }

    @Transactional
    public Webinar updateWebinar(Long id, Webinar details) {
        Optional<Webinar> opt = webinarRepository.findById(id);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Webinar not found with ID: " + id);
        }
        
        Webinar webinar = opt.get();
        webinar.setTitle(details.getTitle());
        webinar.setDescription(details.getDescription());
        webinar.setBannerUrl(details.getBannerUrl());
        webinar.setSpeakerName(details.getSpeakerName());
        webinar.setSpeakerPhoto(details.getSpeakerPhoto());
        webinar.setSpeakerDesignation(details.getSpeakerDesignation());
        webinar.setWebinarDate(details.getWebinarDate());
        webinar.setStartTime(details.getStartTime());
        webinar.setEndTime(details.getEndTime());
        webinar.setTimeZone(details.getTimeZone());
        webinar.setMeetingLink(details.getMeetingLink());
        webinar.setRegistrationRequired(details.getRegistrationRequired());
        webinar.setRegistrationUrl(details.getRegistrationUrl());
        webinar.setCertificateAvailable(details.getCertificateAvailable());
        webinar.setStatus(details.getStatus());
        webinar.setRecordingUrl(details.getRecordingUrl());

        validateWebinar(webinar);
        webinar.setSlug(generateUniqueSlug(webinar.getTitle(), id));
        return webinarRepository.save(webinar);
    }

    @Transactional
    public void deleteWebinar(Long id) {
        Optional<Webinar> opt = webinarRepository.findById(id);
        if (opt.isPresent()) {
            Webinar w = opt.get();
            w.setStatus("Archived");
            webinarRepository.save(w);
        }
    }

    private void validateWebinar(Webinar w) {
        if (w.getTitle() == null || w.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Webinar Title is required");
        }
        if (w.getDescription() == null || w.getDescription().trim().isEmpty()) {
            throw new IllegalArgumentException("Webinar Description is required");
        }
        if (w.getSpeakerName() == null || w.getSpeakerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Speaker Name is required");
        }
        if (w.getWebinarDate() == null || w.getWebinarDate().trim().isEmpty()) {
            throw new IllegalArgumentException("Webinar Date is required");
        }
        if (w.getStartTime() == null || w.getStartTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Start Time is required");
        }
        if (w.getEndTime() == null || w.getEndTime().trim().isEmpty()) {
            throw new IllegalArgumentException("End Time is required");
        }
        if (w.getTimeZone() == null || w.getTimeZone().trim().isEmpty()) {
            throw new IllegalArgumentException("Time Zone is required");
        }
        if (w.getRegistrationRequired() != null && w.getRegistrationRequired()) {
            if (w.getRegistrationUrl() == null || w.getRegistrationUrl().trim().isEmpty()) {
                throw new IllegalArgumentException("Registration URL is required when Registration is Required");
            }
        }
        if (w.getStatus() == null || w.getStatus().trim().isEmpty()) {
            throw new IllegalArgumentException("Webinar Status is required");
        }
        
        String status = w.getStatus().toUpperCase();
        if (!status.equals("DRAFT") && !status.equals("PUBLISHED") && !status.equals("COMPLETED") && !status.equals("ARCHIVED")) {
            throw new IllegalArgumentException("Webinar Status must be one of: DRAFT, PUBLISHED, COMPLETED, ARCHIVED");
        }
    }

    private String generateUniqueSlug(String title, Long id) {
        if (title == null || title.trim().isEmpty()) {
            return "webinar-" + System.currentTimeMillis();
        }
        String cleanTitle = title.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");
        
        String generatedSlug = cleanTitle;
        int count = 1;
        while (true) {
            Optional<Webinar> existing = webinarRepository.findBySlug(generatedSlug);
            if (existing.isEmpty() || (id != null && existing.get().getId().equals(id))) {
                break;
            }
            generatedSlug = cleanTitle + "-" + count++;
        }
        return generatedSlug;
    }
}
