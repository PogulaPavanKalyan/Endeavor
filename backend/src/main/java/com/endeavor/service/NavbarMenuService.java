package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.NavbarMenu;
import com.endeavor.repo.NavbarMenuRepository;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class NavbarMenuService {

    @Autowired
    private NavbarMenuRepository repo;

    public List<NavbarMenu> getMenusByConference(Long conferenceId) {
        List<NavbarMenu> menus = repo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        if (menus.isEmpty()) {
            return seedDefaultMenus(conferenceId);
        }
        return menus;
    }

    public Optional<NavbarMenu> getMenuById(Long id) {
        return repo.findById(id);
    }

    public Optional<NavbarMenu> getMenuBySlug(Long conferenceId, String slug) {
        return repo.findByConferenceIdAndSlug(conferenceId, slug);
    }

    public NavbarMenu saveMenu(NavbarMenu menu) {
        // Automatically sanitize slug to lowercase-kebab-case
        if (menu.getSlug() != null) {
            String sanitized = menu.getSlug().toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-");
            menu.setSlug(sanitized);
        }
        return repo.save(menu);
    }

    public void deleteMenu(Long id) {
        repo.deleteById(id);
    }

    public List<NavbarMenu> reorderMenus(List<NavbarMenu> menus) {
        for (int i = 0; i < menus.size(); i++) {
            NavbarMenu m = menus.get(i);
            m.setDisplayOrder(i);
            repo.save(m);
        }
        return menus;
    }

    public boolean isSlugUnique(Long conferenceId, String slug, Long excludeId) {
        String sanitized = slug.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-")
            .replaceAll("-+", "-");
        
        if (excludeId != null) {
            return !repo.existsByConferenceIdAndSlugAndIdNot(conferenceId, sanitized, excludeId);
        } else {
            return !repo.existsByConferenceIdAndSlug(conferenceId, sanitized);
        }
    }

    public List<NavbarMenu> seedDefaultMenus(Long conferenceId) {
        List<NavbarMenu> seeded = new ArrayList<>();
        int order = 1;

        // Speakers dropdown submenus
        seeded.add(createMenuObj(conferenceId, "Speakers", "Keynote Speakers", "Keynote Speakers", "keynote-speakers", order++));
        seeded.add(createMenuObj(conferenceId, "Speakers", "Guest Speakers", "Guest Speakers", "guest-speakers", order++));
        seeded.add(createMenuObj(conferenceId, "Speakers", "Session Speakers", "Session Speakers", "session-speakers", order++));
        seeded.add(createMenuObj(conferenceId, "Speakers", "Organizing Committee", "Organizing Committee", "organizing-committee", order++));
        seeded.add(createMenuObj(conferenceId, "Speakers", "Advisory Committee", "Advisory Committee", "advisory-committee", order++));
        seeded.add(createMenuObj(conferenceId, "Speakers", "Speaker Guidelines", "Speaker Guidelines", "speaker-guidelines", order++));

        // Reset order for Scientific Program
        order = 1;
        // Scientific Program dropdown submenus
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Day 1 Program", "Day 1 Scientific Program", "day-1-program", order++));
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Day 2 Program", "Day 2 Scientific Program", "day-2-program", order++));
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Workshops", "Special Workshops & Hands-on Training", "workshops", order++));
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Technical Sessions", "Technical Breakout Sessions", "technical-sessions", order++));
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Poster Presentations", "Young Researchers Poster Presentations", "poster-presentations", order++));
        seeded.add(createMenuObj(conferenceId, "Scientific Program", "Program Schedule", "Complete Program Schedule", "program-schedule", order++));

        return repo.saveAll(seeded);
    }

    private NavbarMenu createMenuObj(Long conferenceId, String type, String title, String pageTitle, String slug, int order) {
        NavbarMenu menu = new NavbarMenu();
        menu.setConferenceId(conferenceId);
        menu.setMenuType(type);
        menu.setTitle(title);
        menu.setPageTitle(pageTitle);
        menu.setSlug(slug);
        menu.setDisplayOrder(order);
        menu.setIsVisible(true);
        menu.setIsActive(true);
        menu.setContent("<h2>" + pageTitle + "</h2><p>Welcome to the dynamic " + title + " page. You can customize this content, update the banner/thumbnail images, or change the page structure directly from the admin panel.</p>");
        return menu;
    }
}
