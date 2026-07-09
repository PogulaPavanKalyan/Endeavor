package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.ConferenceNavigation;
import com.endeavor.repository.ConferenceNavigationRepository;
import java.util.List;

@Service
public class ConferenceNavigationService {

    @Autowired
    private ConferenceNavigationRepository repository;

    public List<ConferenceNavigation> getNavigationByConferenceId(Long conferenceId) {
        return repository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
    }

    public ConferenceNavigation save(ConferenceNavigation navigation) {
        return repository.save(navigation);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void reorder(List<ConferenceNavigation> navigations) {
        for (ConferenceNavigation nav : navigations) {
            repository.save(nav);
        }
    }

    public void generateDefaultNavigation(Long conferenceId) {
        // Only generate if no navigation exists
        List<ConferenceNavigation> existing = repository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        if (!existing.isEmpty()) {
            return;
        }

        int order = 1;
        createDefaultItem(conferenceId, "Home", "", "", order++);
        createDefaultItem(conferenceId, "Speakers", "speakers", "speakers", order++);
        createDefaultItem(conferenceId, "Scientific Program", "program", "program", order++);
        createDefaultItem(conferenceId, "Abstract Submissions", "abstract-submissions", "abstract-submissions", order++);
        createDefaultItem(conferenceId, "Registration", "registration", "registration", order++);
        createDefaultItem(conferenceId, "Venue", "venue", "venue", order++);
        createDefaultItem(conferenceId, "Contact Us", "contact", "contact", order++);
    }

    private void createDefaultItem(Long confId, String name, String slug, String url, int order) {
        ConferenceNavigation nav = new ConferenceNavigation();
        nav.setConferenceId(confId);
        nav.setMenuName(name);
        nav.setSlug(slug);
        nav.setUrl(url);
        nav.setDisplayOrder(order);
        nav.setStatus(true);
        nav.setOpenInNewTab(false);
        repository.save(nav);
    }
}
