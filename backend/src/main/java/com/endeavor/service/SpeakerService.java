package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.Speaker;
import com.endeavor.repo.SpeakerRepo;

import java.util.List;
import java.util.Optional;

@Service
public class SpeakerService {

    @Autowired
    private SpeakerRepo speakerRepo;

    public List<Speaker> getSpeakers(String type) {
        if (type != null && !type.trim().isEmpty()) {
            return speakerRepo.findByType(type);
        }
        return speakerRepo.findAll();
    }

    public Speaker saveSpeaker(Speaker speaker) {
        if (speaker.getPhoto() != null) {
            speaker.getPhoto().setSpeaker(speaker);
        }
        return speakerRepo.save(speaker);
    }

    public Optional<Speaker> getSpeakerById(Long id) {
        return speakerRepo.findById(id);
    }

    public void deleteSpeaker(Long id) {
        speakerRepo.deleteById(id);
    }

    public List<Speaker> getByConferenceId(Long conferenceId) {
        return speakerRepo.findByConferenceId(conferenceId);
    }
}
