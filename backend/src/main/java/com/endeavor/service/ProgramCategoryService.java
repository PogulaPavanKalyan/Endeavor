package com.endeavor.service;

import com.endeavor.entity.ProgramCategory;
import com.endeavor.repository.ProgramCategoryRepository;
import com.endeavor.repository.ProgramItemRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Service
public class ProgramCategoryService {

    @Autowired
    private ProgramCategoryRepository categoryRepository;

    @Autowired
    private ProgramItemRepository itemRepository;

    private static final List<String> DEFAULT_CATEGORIES = Arrays.asList(
            "Day 1 Program",
            "Day 2 Program",
            "Day 3 Program",
            "Workshops",
            "Technical Sessions",
            "Poster Presentations",
            "Program Schedule"
    );

    public void generateDefaultCategories(Long conferenceId) {
        for (int i = 0; i < DEFAULT_CATEGORIES.size(); i++) {
            String name = DEFAULT_CATEGORIES.get(i);
            if (categoryRepository.findByConferenceIdAndCategoryName(conferenceId, name).isEmpty()) {
                ProgramCategory category = new ProgramCategory();
                category.setConferenceId(conferenceId);
                category.setCategoryName(name);
                category.setIsDefault(true);
                category.setDisplayOrder(i);
                category.setStatus(true);
                categoryRepository.save(category);
            }
        }
    }

    public List<ProgramCategory> getCategoriesByConferenceId(Long conferenceId) {
        List<ProgramCategory> categories = categoryRepository.findByConferenceIdOrderByDisplayOrderAsc(conferenceId);
        for (ProgramCategory cat : categories) {
            cat.setTotalItemCount(itemRepository.countByCategoryId(cat.getId()));
            cat.setActiveItemCount(itemRepository.countByCategoryIdAndStatusTrue(cat.getId()));
        }
        return categories;
    }

    public ProgramCategory saveCategory(ProgramCategory category) {
        return categoryRepository.save(category);
    }

    public Optional<ProgramCategory> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public void deleteCategory(Long id) {
        categoryRepository.deleteById(id);
    }
}
