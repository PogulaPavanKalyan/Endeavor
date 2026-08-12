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
        if (conferenceId == null) {
            return java.util.Collections.emptyList();
        }
        List<ConferenceNavigation> list = repository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        if (list.isEmpty()) {
            generateDefaultNavigation(conferenceId);
            list = repository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        }
        return list;
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
        List<ConferenceNavigation> existing = repository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        
        String[][] defaults = {
            {"Home", "", ""},
            {"Speakers", "speakers", "speakers"},
            {"Scientific Program", "program", "program"},
            {"Brochure", "brochure", "brochure"},
            {"Abstract Submissions", "submit-abstract", "submit-abstract"},
            {"Registration", "register", "register"},
            {"Venue", "venue", "venue"},
            {"Contact Us", "contact", "contact"}
        };
        
        int order = existing.isEmpty() ? 1 : existing.stream().mapToInt(ConferenceNavigation::getDisplayOrder).max().orElse(0) + 1;
        
        for (String[] def : defaults) {
            boolean exists = existing.stream().anyMatch(e -> def[1].equals(e.getSlug()) || def[2].equals(e.getUrl()));
            if (!exists) {
                createDefaultItem(conferenceId, def[0], def[1], def[2], order++);
            }
        }
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
