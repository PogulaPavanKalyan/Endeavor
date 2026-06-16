package com.endeavor.configuration;

import com.endeavor.entity.SiteStatistics;
import com.endeavor.entity.TrustBadge;
import com.endeavor.repo.SiteStatisticsRepository;
import com.endeavor.repo.TrustBadgeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DataSeeder implements ApplicationRunner {

    @Autowired
    private SiteStatisticsRepository siteStatisticsRepository;

    @Autowired
    private TrustBadgeRepository trustBadgeRepository;

    @Override
    public void run(ApplicationArguments args) {
        seedStatistics();
        seedTrustBadges();
    }

    private void seedStatistics() {
        if (siteStatisticsRepository.findById(1L).isEmpty()) {
            SiteStatistics stats = new SiteStatistics();
            stats.setId(1L);
            stats.setConferencesCount(150);
            stats.setCountriesCount(50);
            stats.setResearchersCount(10000);
            stats.setPublicationsCount(500);
            siteStatisticsRepository.save(stats);
            System.out.println("[DataSeeder] Default statistics seeded.");
        }
    }

    private void seedTrustBadges() {
        if (trustBadgeRepository.count() == 0) {
            List<TrustBadge> badges = List.of(
                createBadge("🔬", "Scopus Indexed", "All proceedings indexed in Scopus and major global databases", 1),
                createBadge("✅", "Peer Reviewed", "Rigorous double-blind peer review by domain experts", 2),
                createBadge("🌐", "Global Networking", "Connect with researchers from 50+ countries worldwide", 3),
                createBadge("📚", "Publication Opportunities", "Fast-track publication in indexed journals", 4)
            );
            trustBadgeRepository.saveAll(badges);
            System.out.println("[DataSeeder] Default trust badges seeded.");
        }
    }

    private TrustBadge createBadge(String icon, String title, String description, int order) {
        TrustBadge b = new TrustBadge();
        b.setIcon(icon);
        b.setTitle(title);
        b.setDescription(description);
        b.setDisplayOrder(order);
        b.setActive(true);
        return b;
    }
}
