package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.ScientificSession;
import com.endeavor.repo.ScientificSessionRepo;

import java.util.List;
import java.util.Optional;

@Service
public class ScientificSessionService {

    @Autowired
    private ScientificSessionRepo sessionRepo;

    public List<ScientificSession> getSessions() {
        return sessionRepo.findAll();
    }

    public Optional<ScientificSession> getSessionById(Long id) {
        return sessionRepo.findById(id);
    }

    public ScientificSession saveSession(ScientificSession session) {
        return sessionRepo.save(session);
    }

    public void deleteSession(Long id) {
        sessionRepo.deleteById(id);
    }

    public List<ScientificSession> getByConferenceId(Long conferenceId) {
        return sessionRepo.findByConferenceId(conferenceId);
    }

    public List<ScientificSession> getByTrackId(Long trackId) {
        return sessionRepo.findByTrackId(trackId);
    }
}
