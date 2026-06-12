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

    public List<ConferencePage> getByConferenceId(Long conferenceId) {
        List<ConferencePage> pages = repo.findByConferenceId(conferenceId);
        if (pages.isEmpty()) {
            return seedDefaultPages(conferenceId);
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
        seeded.add(createPageObj(conferenceId, "program", "Scientific Program", "program", 4));
        seeded.add(createPageObj(conferenceId, "abstract", "Abstract Submissions", "submit-abstract", 5));
        seeded.add(createPageObj(conferenceId, "register", "Registration", "register", 6));
        seeded.add(createPageObj(conferenceId, "venue", "Venue", "venue", 7));
        seeded.add(createPageObj(conferenceId, "contact", "Contact Us", "contact", 8));
        
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
