package com.endeavor.service;

import com.endeavor.entity.SpeakerCategory;
import com.endeavor.repository.SpeakerCategoryRepository;
import com.endeavor.repo.SpeakerRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;

@Service
public class SpeakerCategoryService {

    @Autowired
    private SpeakerCategoryRepository categoryRepository;
    
    @Autowired
    private SpeakerRepo speakerRepo;

    public void generateDefaultCategories(Long conferenceId) {
        List<String> defaultNames = Arrays.asList(
            "Keynote Speakers",
            "Invited Speakers",
            "Plenary Speakers",
            "Workshop Speakers",
            "Session Speakers",
            "Panel Speakers",
            "Guest Speakers"
        );

        for (int i = 0; i < defaultNames.size(); i++) {
            String name = defaultNames.get(i);
            if (categoryRepository.findByConferenceIdAndCategoryName(conferenceId, name).isEmpty()) {
                SpeakerCategory cat = new SpeakerCategory(conferenceId, name, true, i);
                categoryRepository.save(cat);
            }
        }
    }

    public List<SpeakerCategory> getAllCategories(Long conferenceId) {
        List<SpeakerCategory> categories = categoryRepository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        for (SpeakerCategory cat : categories) {
            long active = speakerRepo.countByConferenceIdAndCategoryIdAndIsActiveTrue(conferenceId, cat.getId());
            long total = speakerRepo.countByConferenceIdAndCategoryId(conferenceId, cat.getId());
            cat.setActiveSpeakerCount(active);
            cat.setTotalSpeakerCount(total);
        }
        return categories;
    }

    public List<SpeakerCategory> getActiveCategoriesWithSpeakers(Long conferenceId) {
        List<SpeakerCategory> categories = categoryRepository.findByConferenceIdAndStatusOrderByDisplayOrderAsc(conferenceId, true);
        categories.removeIf(cat -> {
            long active = speakerRepo.countByConferenceIdAndCategoryIdAndIsActiveTrue(conferenceId, cat.getId());
            cat.setActiveSpeakerCount(active);
            return active == 0;
        });
        return categories;
    }

    public SpeakerCategory saveCategory(SpeakerCategory category) {
        return categoryRepository.save(category);
    }

    public void deleteCategory(Long id) {
        SpeakerCategory category = categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found"));
        
        if (category.getIsDefault()) {
            throw new RuntimeException("Cannot delete default system categories.");
        }
        
        categoryRepository.delete(category);
    }

    public void reorderCategories(List<SpeakerCategory> categories) {
        categoryRepository.saveAll(categories);
    }
}
