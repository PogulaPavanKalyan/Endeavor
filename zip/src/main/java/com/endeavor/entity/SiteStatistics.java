package com.endeavor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "site_statistics")
public class SiteStatistics {

    @Id
    private Long id = 1L; // Always single row, id=1

    @Column(nullable = false)
    private Integer conferencesCount = 150;

    @Column(nullable = false)
    private Integer countriesCount = 50;

    @Column(nullable = false)
    private Integer researchersCount = 10000;

    @Column(nullable = false)
    private Integer publicationsCount = 500;

    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public SiteStatistics() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getConferencesCount() { return conferencesCount; }
    public void setConferencesCount(Integer conferencesCount) { this.conferencesCount = conferencesCount; }

    public Integer getCountriesCount() { return countriesCount; }
    public void setCountriesCount(Integer countriesCount) { this.countriesCount = countriesCount; }

    public Integer getResearchersCount() { return researchersCount; }
    public void setResearchersCount(Integer researchersCount) { this.researchersCount = researchersCount; }

    public Integer getPublicationsCount() { return publicationsCount; }
    public void setPublicationsCount(Integer publicationsCount) { this.publicationsCount = publicationsCount; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
