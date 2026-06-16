package com.endeavor.service;

import com.endeavor.entity.HeroSection;
import com.endeavor.entity.HeroSection.HeroStatus;
import com.endeavor.repo.HeroSectionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HeroSectionService {

    @Autowired
    private HeroSectionRepository heroSectionRepository;

    public Optional<HeroSection> getActiveHero() {
        return heroSectionRepository.findFirstByStatusOrderByCreatedAtDesc(HeroStatus.ACTIVE);
    }

    public List<HeroSection> getAllHeroes() {
        return heroSectionRepository.findAll();
    }

    public HeroSection save(HeroSection hero) {
        return heroSectionRepository.save(hero);
    }

    public Optional<HeroSection> findById(Long id) {
        return heroSectionRepository.findById(id);
    }

    public void activate(Long id) {
        // Deactivate all first, then activate the selected one
        List<HeroSection> all = heroSectionRepository.findAll();
        for (HeroSection h : all) {
            h.setStatus(HeroStatus.INACTIVE);
        }
        heroSectionRepository.saveAll(all);

        heroSectionRepository.findById(id).ifPresent(h -> {
            h.setStatus(HeroStatus.ACTIVE);
            heroSectionRepository.save(h);
        });
    }

    public void delete(Long id) {
        heroSectionRepository.deleteById(id);
    }
}
