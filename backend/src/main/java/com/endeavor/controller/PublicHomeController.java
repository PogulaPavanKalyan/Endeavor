package com.endeavor.controller;

import com.endeavor.entity.HeroSection;
import com.endeavor.entity.SiteStatistics;
import com.endeavor.entity.TrustBadge;
import com.endeavor.service.HeroSectionService;
import com.endeavor.service.SiteStatisticsService;
import com.endeavor.service.TrustBadgeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PublicHomeController {

    @Autowired
    private HeroSectionService heroSectionService;

    @Autowired
    private SiteStatisticsService siteStatisticsService;

    @Autowired
    private TrustBadgeService trustBadgeService;

    /**
     * GET /api/hero
     * Returns the currently active hero banner.
     * Returns 404 if no active hero exists.
     */
    @GetMapping("/hero")
    public ResponseEntity<HeroSection> getActiveHero() {
        return heroSectionService.getActiveHero()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * GET /api/statistics
     * Returns the live site statistics (always single row).
     */
    @GetMapping("/statistics")
    public ResponseEntity<SiteStatistics> getStatistics() {
        SiteStatistics stats = siteStatisticsService.getOrCreate();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/trust-badges
     * Returns all active trust badges ordered by displayOrder.
     */
    @GetMapping("/trust-badges")
    public ResponseEntity<List<TrustBadge>> getActiveTrustBadges() {
        List<TrustBadge> badges = trustBadgeService.getActiveBadges();
        return ResponseEntity.ok(badges);
    }
}
