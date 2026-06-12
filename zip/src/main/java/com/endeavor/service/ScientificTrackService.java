package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.ScientificTrack;
import com.endeavor.repo.ScientificTrackRepo;

import java.util.List;
import java.util.Optional;

@Service
public class ScientificTrackService {

    @Autowired
    private ScientificTrackRepo trackRepo;

    public List<ScientificTrack> getTracksByConferenceId(Long conferenceId) {
        return trackRepo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
    }

    public Optional<ScientificTrack> getTrackById(Long id) {
        return trackRepo.findById(id);
    }

    public ScientificTrack saveTrack(ScientificTrack track) {
        return trackRepo.save(track);
    }

    public void deleteTrack(Long id) {
        trackRepo.deleteById(id);
    }

    public void reorderTracks(List<Long> trackIds) {
        for (int i = 0; i < trackIds.size(); i++) {
            Optional<ScientificTrack> trackOpt = trackRepo.findById(trackIds.get(i));
            if (trackOpt.isPresent()) {
                ScientificTrack track = trackOpt.get();
                track.setDisplayOrder(i);
                trackRepo.save(track);
            }
        }
    }
}
