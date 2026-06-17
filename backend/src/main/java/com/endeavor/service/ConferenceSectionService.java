package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.endeavor.entity.ConferenceSection;
import com.endeavor.entity.ConferenceSectionItem;
import com.endeavor.entity.Speaker;
import com.endeavor.repo.ConferenceSectionRepository;
import com.endeavor.repo.ConferenceSectionItemRepository;
import java.util.List;
import java.util.Optional;
import java.util.ArrayList;

@Service
public class ConferenceSectionService {

    @Autowired
    private ConferenceSectionRepository sectionRepo;

    @Autowired
    private ConferenceSectionItemRepository itemRepo;

    @Autowired
    private SpeakerService speakerService;

    public List<ConferenceSection> getSectionsByConference(Long conferenceId) {
        List<ConferenceSection> sections = sectionRepo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        if (sections.isEmpty()) {
            return migrateAndSeedFromSpeakers(conferenceId);
        }
        return sections;
    }

    public Optional<ConferenceSection> getSectionById(Long id) {
        return sectionRepo.findById(id);
    }

    public List<ConferenceSectionItem> getItemsBySection(Long sectionId) {
        return itemRepo.findBySectionIdOrderByDisplayOrderAsc(sectionId);
    }

    public Optional<ConferenceSectionItem> getItemById(Long id) {
        return itemRepo.findById(id);
    }

    public ConferenceSection saveSection(ConferenceSection section) {
        if (section.getSectionSlug() == null || section.getSectionSlug().trim().isEmpty()) {
            section.setSectionSlug(generateSlug(section.getSectionName()));
        } else {
            section.setSectionSlug(generateSlug(section.getSectionSlug()));
        }
        return sectionRepo.save(section);
    }

    @Transactional
    public void deleteSection(Long id) {
        itemRepo.deleteBySectionId(id);
        sectionRepo.deleteById(id);
    }

    public List<ConferenceSection> reorderSections(List<ConferenceSection> sections) {
        for (int i = 0; i < sections.size(); i++) {
            ConferenceSection s = sections.get(i);
            s.setDisplayOrder(i + 1);
            sectionRepo.save(s);
        }
        return sections;
    }

    public ConferenceSectionItem saveItem(ConferenceSectionItem item) {
        return itemRepo.save(item);
    }

    public void deleteItem(Long id) {
        itemRepo.deleteById(id);
    }

    public List<ConferenceSectionItem> reorderItems(List<ConferenceSectionItem> items) {
        for (int i = 0; i < items.size(); i++) {
            ConferenceSectionItem item = items.get(i);
            item.setDisplayOrder(i + 1);
            itemRepo.save(item);
        }
        return items;
    }

    public boolean isSectionSlugUnique(Long conferenceId, String slug, Long excludeId) {
        String sanitized = generateSlug(slug);
        if (excludeId != null) {
            return !sectionRepo.existsByConferenceIdAndSectionSlugAndIdNot(conferenceId, sanitized, excludeId);
        } else {
            return !sectionRepo.existsByConferenceIdAndSectionSlug(conferenceId, sanitized);
        }
    }

    @Transactional
    public List<ConferenceSection> migrateAndSeedFromSpeakers(Long conferenceId) {
        List<ConferenceSection> seededSections = new ArrayList<>();

        // Create Section 1: Event Speakers
        ConferenceSection speakersSection = new ConferenceSection();
        speakersSection.setConferenceId(conferenceId);
        speakersSection.setSectionName("Event Speakers");
        speakersSection.setSectionSlug("event-speakers");
        speakersSection.setDisplayOrder(1);
        speakersSection.setIsVisible(true);
        speakersSection = sectionRepo.save(speakersSection);
        seededSections.add(speakersSection);

        // Create Section 2: Advisory Board
        ConferenceSection advisorySection = new ConferenceSection();
        advisorySection.setConferenceId(conferenceId);
        advisorySection.setSectionName("Advisory Board");
        advisorySection.setSectionSlug("advisory-board");
        advisorySection.setDisplayOrder(2);
        advisorySection.setIsVisible(true);
        advisorySection = sectionRepo.save(advisorySection);
        seededSections.add(advisorySection);

        // Fetch existing speakers for this conference
        List<Speaker> speakers = speakerService.getByConferenceId(conferenceId);
        int speakersOrder = 1;
        int advisoryOrder = 1;

        for (Speaker s : speakers) {
            ConferenceSectionItem item = new ConferenceSectionItem();
            item.setName(s.getName());
            item.setDesignation(s.getDesignation());
            item.setOrganization(s.getAffiliation());
            item.setCountry(s.getCountry());
            item.setDescription(s.getBio());
            item.setIsVisible(true);

            if (s.getPhoto() != null && s.getPhoto().getFileName() != null) {
                item.setImagePath("/uploads/speakers/" + s.getPhoto().getFileName());
            }

            String type = s.getType() != null ? s.getType().toLowerCase() : "";
            if (type.contains("advisory") || type.contains("board") || type.contains("committee")) {
                item.setSectionId(advisorySection.getId());
                item.setDisplayOrder(advisoryOrder++);
            } else {
                item.setSectionId(speakersSection.getId());
                item.setDisplayOrder(speakersOrder++);
            }
            itemRepo.save(item);
        }

        // If no speakers existed, seed some placeholder items so tabs are not completely empty
        if (speakers.isEmpty()) {
            seedPlaceholderItems(speakersSection.getId(), advisorySection.getId());
        }

        return seededSections;
    }

    private void seedPlaceholderItems(Long speakersSecId, Long advisorySecId) {
        // Speaker placeholders
        ConferenceSectionItem sp1 = new ConferenceSectionItem();
        sp1.setSectionId(speakersSecId);
        sp1.setName("Prof. Sarah Higgins");
        sp1.setDesignation("Keynote Presenter");
        sp1.setOrganization("University of Oxford");
        sp1.setCountry("UK");
        sp1.setDescription("Leading researcher on biochemical developments and modern genetic adaptations.");
        sp1.setDisplayOrder(1);
        sp1.setIsVisible(true);
        itemRepo.save(sp1);

        ConferenceSectionItem sp2 = new ConferenceSectionItem();
        sp2.setSectionId(speakersSecId);
        sp2.setName("Prof. Alan Vance");
        sp2.setDesignation("Technical Session Speaker");
        sp2.setOrganization("CERN Particle Accelerator");
        sp2.setCountry("Switzerland");
        sp2.setDescription("Experimental physicist and coordinator of major detector validation campaigns.");
        sp2.setDisplayOrder(2);
        sp2.setIsVisible(true);
        itemRepo.save(sp2);

        // Advisory placeholders
        ConferenceSectionItem adv1 = new ConferenceSectionItem();
        adv1.setSectionId(advisorySecId);
        adv1.setName("Dr. Kenji Sato");
        adv1.setDesignation("Advisory Committee Chair");
        adv1.setOrganization("Tokyo Institute of Technology");
        adv1.setCountry("Japan");
        adv1.setDescription("Specialist in molecular engineering and nanotechnology collaborations.");
        adv1.setDisplayOrder(1);
        adv1.setIsVisible(true);
        itemRepo.save(adv1);
    }

    private String generateSlug(String text) {
        if (text == null) return "";
        return text.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .trim();
    }
}
