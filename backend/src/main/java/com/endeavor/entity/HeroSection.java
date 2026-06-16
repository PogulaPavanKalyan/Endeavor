package com.endeavor.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "hero_section")
public class HeroSection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(length = 300)
    private String subtitle;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 500)
    private String backgroundImage;

    @Column(length = 500)
    private String heroImage; // Right-side conference visual image

    @Column(length = 100)
    private String button1Text;

    @Column(length = 300)
    private String button1Link;

    @Column(length = 100)
    private String button2Text;

    @Column(length = 300)
    private String button2Link;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HeroStatus status = HeroStatus.INACTIVE;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public enum HeroStatus {
        ACTIVE, INACTIVE
    }

    public HeroSection() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSubtitle() { return subtitle; }
    public void setSubtitle(String subtitle) { this.subtitle = subtitle; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getBackgroundImage() { return backgroundImage; }
    public void setBackgroundImage(String backgroundImage) { this.backgroundImage = backgroundImage; }

    public String getHeroImage() { return heroImage; }
    public void setHeroImage(String heroImage) { this.heroImage = heroImage; }

    public String getButton1Text() { return button1Text; }
    public void setButton1Text(String button1Text) { this.button1Text = button1Text; }

    public String getButton1Link() { return button1Link; }
    public void setButton1Link(String button1Link) { this.button1Link = button1Link; }

    public String getButton2Text() { return button2Text; }
    public void setButton2Text(String button2Text) { this.button2Text = button2Text; }

    public String getButton2Link() { return button2Link; }
    public void setButton2Link(String button2Link) { this.button2Link = button2Link; }

    public HeroStatus getStatus() { return status; }
    public void setStatus(HeroStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }

    @Column(name="conference_id")
    private Long conferenceId;

    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }
}
