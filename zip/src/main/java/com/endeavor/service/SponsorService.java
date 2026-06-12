package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.Sponsor;
import com.endeavor.repo.SponsorRepo;
import java.util.List;
import java.util.Optional;

@Service
public class SponsorService {

    @Autowired
    private SponsorRepo sponsorRepo;

    public List<Sponsor> getAllSponsors() {
        return sponsorRepo.findAll();
    }

    public Optional<Sponsor> getSponsorById(Long id) {
        return sponsorRepo.findById(id);
    }

    public Sponsor saveSponsor(Sponsor sponsor) {
        return sponsorRepo.save(sponsor);
    }

    public void deleteSponsor(Long id) {
        sponsorRepo.deleteById(id);
    }

    public List<Sponsor> getByConferenceId(Long conferenceId) {
        return sponsorRepo.findByConferenceId(conferenceId);
    }
}
