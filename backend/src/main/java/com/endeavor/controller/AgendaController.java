package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.AgendaDay;
import com.endeavor.entity.AgendaSession;
import com.endeavor.entity.ConferenceDetails;
import com.endeavor.repo.AgendaDayRepo;
import com.endeavor.repo.AgendaSessionRepo;
import com.endeavor.repo.ConferenceDetailsRepo;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin
public class AgendaController {

    @Autowired
    private AgendaDayRepo dayRepo;

    @Autowired
    private AgendaSessionRepo sessionRepo;

    @Autowired
    private ConferenceDetailsRepo conferenceDetailsRepo;

    @GetMapping("/api/agenda/days")
    public ResponseEntity<List<AgendaDay>> getPublicDays(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(dayRepo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId));
    }

    @GetMapping("/api/admin/agenda/days")
    public ResponseEntity<List<AgendaDay>> getAdminDays(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(dayRepo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId));
    }

    @PostMapping("/api/admin/agenda/days")
    public ResponseEntity<AgendaDay> createDay(@RequestBody AgendaDay day) {
        return ResponseEntity.status(HttpStatus.CREATED).body(dayRepo.save(day));
    }

    @PutMapping("/api/admin/agenda/days/{id}")
    public ResponseEntity<AgendaDay> updateDay(@PathVariable Long id, @RequestBody AgendaDay details) {
        Optional<AgendaDay> opt = dayRepo.findById(id);
        if (opt.isPresent()) {
            AgendaDay d = opt.get();
            d.setDayNumber(details.getDayNumber());
            d.setDayTitle(details.getDayTitle());
            return ResponseEntity.ok(dayRepo.save(d));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/admin/agenda/days/{id}")
    public ResponseEntity<Void> deleteDay(@PathVariable Long id) {
        if (dayRepo.existsById(id)) {
            dayRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/admin/agenda/days/{dayId}/sessions")
    public ResponseEntity<AgendaSession> createSession(@PathVariable Long dayId, @RequestBody AgendaSession session) {
        Optional<AgendaDay> opt = dayRepo.findById(dayId);
        if (opt.isPresent()) {
            session.setAgendaDay(opt.get());
            return ResponseEntity.status(HttpStatus.CREATED).body(sessionRepo.save(session));
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/api/admin/agenda/sessions/{id}")
    public ResponseEntity<AgendaSession> updateSession(@PathVariable Long id, @RequestBody AgendaSession details) {
        Optional<AgendaSession> opt = sessionRepo.findById(id);
        if (opt.isPresent()) {
            AgendaSession s = opt.get();
            s.setTimeRange(details.getTimeRange());
            s.setSessionTitle(details.getSessionTitle());
            s.setSpeakerName(details.getSpeakerName());
            s.setHall(details.getHall());
            s.setDescription(details.getDescription());
            s.setDisplayOrder(details.getDisplayOrder());
            s.setSessionType(details.getSessionType());
            s.setChairperson(details.getChairperson());
            s.setStartTime(details.getStartTime());
            s.setEndTime(details.getEndTime());
            s.setTrack(details.getTrack());
            s.setStatus(details.getStatus());
            s.setOrganization(details.getOrganization());
            s.setCountry(details.getCountry());
            s.setBiography(details.getBiography());
            s.setAbstractText(details.getAbstractText());
            return ResponseEntity.ok(sessionRepo.save(s));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/admin/agenda/sessions/{id}/duplicate")
    public ResponseEntity<AgendaSession> duplicateSession(@PathVariable Long id) {
        Optional<AgendaSession> opt = sessionRepo.findById(id);
        if (opt.isPresent()) {
            AgendaSession orig = opt.get();
            AgendaSession dup = new AgendaSession();
            dup.setAgendaDay(orig.getAgendaDay());
            dup.setTimeRange(orig.getTimeRange());
            dup.setSessionTitle(orig.getSessionTitle() + " (Copy)");
            dup.setSpeakerName(orig.getSpeakerName());
            dup.setHall(orig.getHall());
            dup.setDescription(orig.getDescription());
            dup.setDisplayOrder(orig.getDisplayOrder() + 1);
            dup.setSessionType(orig.getSessionType());
            dup.setChairperson(orig.getChairperson());
            dup.setStartTime(orig.getStartTime());
            dup.setEndTime(orig.getEndTime());
            dup.setTrack(orig.getTrack());
            dup.setStatus(orig.getStatus());
            dup.setOrganization(orig.getOrganization());
            dup.setCountry(orig.getCountry());
            dup.setBiography(orig.getBiography());
            dup.setAbstractText(orig.getAbstractText());
            return ResponseEntity.status(HttpStatus.CREATED).body(sessionRepo.save(dup));
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping("/api/admin/agenda/days/{dayId}/sessions/batch")
    public ResponseEntity<List<AgendaSession>> createSessionsBatch(@PathVariable Long dayId, @RequestBody List<AgendaSession> sessions) {
        Optional<AgendaDay> opt = dayRepo.findById(dayId);
        if (opt.isPresent()) {
            AgendaDay day = opt.get();
            for (AgendaSession session : sessions) {
                session.setAgendaDay(day);
            }
            return ResponseEntity.status(HttpStatus.CREATED).body(sessionRepo.saveAll(sessions));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/admin/agenda/sessions/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable Long id) {
        if (sessionRepo.existsById(id)) {
            sessionRepo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/api/admin/agenda/sessions/reorder")
    public ResponseEntity<Void> reorderSessions(@RequestBody List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            Optional<AgendaSession> opt = sessionRepo.findById(ids.get(i));
            if (opt.isPresent()) {
                AgendaSession s = opt.get();
                s.setDisplayOrder(i);
                sessionRepo.save(s);
            }
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping(value = "/api/admin/conference-details/{id}/agenda-pdf", consumes = "multipart/form-data")
    public ResponseEntity<ConferenceDetails> uploadAgendaPdf(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<ConferenceDetails> opt = conferenceDetailsRepo.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        try {
            String folder = "uploads/agenda/";
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            String ext = "";
            String origName = file.getOriginalFilename();
            if (origName != null && origName.contains(".")) {
                ext = origName.substring(origName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + ext;
            File destFile = new File(uploadDir, fileName);
            file.transferTo(destFile);

            ConferenceDetails details = opt.get();
            details.setAgendaPdfPath("/uploads/agenda/" + fileName);
            return ResponseEntity.ok(conferenceDetailsRepo.save(details));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
