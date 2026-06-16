package com.endeavor.service;

import com.endeavor.entity.SiteStatistics;
import com.endeavor.repo.SiteStatisticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SiteStatisticsService {

    @Autowired
    private SiteStatisticsRepository siteStatisticsRepository;

    public SiteStatistics getOrCreate() {
        return siteStatisticsRepository.findById(1L).orElseGet(() -> {
            SiteStatistics stats = new SiteStatistics();
            stats.setId(1L);
            return siteStatisticsRepository.save(stats);
        });
    }

    public SiteStatistics update(SiteStatistics incoming) {
        SiteStatistics stats = getOrCreate();
        if (incoming.getConferencesCount() != null) stats.setConferencesCount(incoming.getConferencesCount());
        if (incoming.getCountriesCount() != null) stats.setCountriesCount(incoming.getCountriesCount());
        if (incoming.getResearchersCount() != null) stats.setResearchersCount(incoming.getResearchersCount());
        if (incoming.getPublicationsCount() != null) stats.setPublicationsCount(incoming.getPublicationsCount());
        return siteStatisticsRepository.save(stats);
    }
}
