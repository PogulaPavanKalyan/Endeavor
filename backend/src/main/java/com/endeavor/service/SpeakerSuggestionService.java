package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.SpeakerSuggestion;
import com.endeavor.repo.SpeakerSuggestionRepo;
import java.util.List;

@Service
public class SpeakerSuggestionService {

    @Autowired
    private SpeakerSuggestionRepo speakerSuggestionRepo;

    public List<SpeakerSuggestion> getAllSuggestions() {
        return speakerSuggestionRepo.findAll();
    }

    public SpeakerSuggestion saveSuggestion(SpeakerSuggestion suggestion) {
        return speakerSuggestionRepo.save(suggestion);
    }

    public List<SpeakerSuggestion> getByConferenceId(Long conferenceId) {
        return speakerSuggestionRepo.findByConferenceId(conferenceId);
    }
}
