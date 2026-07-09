package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.ConferencePage;
import com.endeavor.repo.ConferencePageRepo;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class ConferencePageService {

    @Autowired
    private ConferencePageRepo repo;

    @Autowired
    private com.endeavor.repo.SpeakerRepo speakerRepo;

    @Autowired
    private com.endeavor.repo.AgendaDayRepo agendaRepo;

    @Autowired
    private com.endeavor.repo.VenueRepo venueRepo;

    @Autowired
    private com.endeavor.repo.ConferenceDetailsRepo conferenceDetailsRepo;

    @Autowired
    private com.endeavor.repo.ScientificTrackRepo trackRepo;

    public List<ConferencePage> getByConferenceId(Long conferenceId) {
        List<ConferencePage> pages = repo.findByConferenceId(conferenceId);
        if (pages.isEmpty()) {
            pages = seedDefaultPages(conferenceId);
        }

        // Dynamically check data existence
        for (ConferencePage page : pages) {
            String key = page.getPageKey();
            if ("speakers".equals(key)) {
                page.setIsEnabled(speakerRepo.countByConferenceId(conferenceId) > 0);
            } else if ("program".equals(key)) {
                page.setIsEnabled(!agendaRepo.findByConferenceId(conferenceId).isEmpty());
            } else if ("venue".equals(key)) {
                page.setIsEnabled(venueRepo.findByConferenceId(conferenceId).isPresent());
            } else if ("tracks".equals(key)) {
                page.setIsEnabled(trackRepo.countByConferenceId(conferenceId) > 0);
            } else if ("brochure".equals(key)) {
                java.util.Optional<com.endeavor.entity.ConferenceDetails> confOpt = conferenceDetailsRepo.findById(conferenceId);
                page.setIsEnabled(confOpt.isPresent() && confOpt.get().getBrochureFileName() != null && !confOpt.get().getBrochureFileName().isEmpty());
            }
        }
        return pages;
    }

    public ConferencePage save(ConferencePage page) {
        return repo.save(page);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public List<ConferencePage> seedDefaultPages(Long conferenceId) {
        List<ConferencePage> seeded = new ArrayList<>();
        
        seeded.add(createPageObj(conferenceId, "home", "Home", "", 1));
        seeded.add(createPageObj(conferenceId, "brochure", "Brochure", "brochure", 2));
        seeded.add(createPageObj(conferenceId, "speakers", "Speakers", "speakers", 3));
        seeded.add(createPageObj(conferenceId, "tracks", "Scientific Tracks", "tracks", 4));
        seeded.add(createPageObj(conferenceId, "program", "Scientific Program", "program", 5));
        seeded.add(createPageObj(conferenceId, "abstract", "Abstract Submissions", "submit-abstract", 6));
        seeded.add(createPageObj(conferenceId, "register", "Registration", "register", 7));
        seeded.add(createPageObj(conferenceId, "venue", "Venue", "venue", 8));
        seeded.add(createPageObj(conferenceId, "contact", "Contact Us", "contact", 9));
        
        return repo.saveAll(seeded);
    }

    private ConferencePage createPageObj(Long conferenceId, String pageKey, String label, String route, int order) {
        ConferencePage page = new ConferencePage();
        page.setConferenceId(conferenceId);
        page.setPageKey(pageKey);
        page.setLabel(label);
        page.setRoute(route);
        page.setIsEnabled(true);
        page.setDisplayOrder(order);
        return page;
    }
}
