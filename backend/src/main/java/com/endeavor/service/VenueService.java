package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.Venue;
import com.endeavor.repo.VenueRepo;
import java.util.Optional;

@Service
public class VenueService {

    @Autowired
    private VenueRepo repo;

    public Optional<Venue> getByConferenceId(Long conferenceId) {
        return repo.findByConferenceId(conferenceId);
    }

    public Venue save(Venue venue) {
        // Handle uniqueness logic: if a venue for this conference already exists, update it instead of creating a new one
        if (venue.getConferenceId() != null) {
            Optional<Venue> existing = repo.findByConferenceId(venue.getConferenceId());
            if (existing.isPresent()) {
                Venue existingVenue = existing.get();
                existingVenue.setName(venue.getName());
                existingVenue.setAddress(venue.getAddress());
                existingVenue.setCity(venue.getCity());
                existingVenue.setCountry(venue.getCountry());
                existingVenue.setMapEmbedUrl(venue.getMapEmbedUrl());
                existingVenue.setDescription(venue.getDescription());
                existingVenue.setPhotoUrl(venue.getPhotoUrl());
                existingVenue.setAccommodationInfo(venue.getAccommodationInfo());
                existingVenue.setTravelInfo(venue.getTravelInfo());
                return repo.save(existingVenue);
            }
        }
        return repo.save(venue);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
