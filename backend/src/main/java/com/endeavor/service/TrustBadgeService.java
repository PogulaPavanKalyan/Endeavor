package com.endeavor.service;

import com.endeavor.entity.TrustBadge;
import com.endeavor.repo.TrustBadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TrustBadgeService {

    @Autowired
    private TrustBadgeRepository trustBadgeRepository;

    public List<TrustBadge> getActiveBadges() {
        return trustBadgeRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }

    public List<TrustBadge> getAllBadges() {
        return trustBadgeRepository.findAll();
    }

    public TrustBadge save(TrustBadge badge) {
        return trustBadgeRepository.save(badge);
    }

    public Optional<TrustBadge> findById(Long id) {
        return trustBadgeRepository.findById(id);
    }

    public void delete(Long id) {
        trustBadgeRepository.deleteById(id);
    }
}
