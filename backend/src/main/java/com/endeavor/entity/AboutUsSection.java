package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_us_section")
public class AboutUsSection {

    @Id
    private Long id = 1L;

    // Hero Section
    private String heroBadge;
    private String heroTitle;
    @Column(columnDefinition = "TEXT")
    private String heroDescription;
    private String heroCtaText1;
    private String heroCtaLink1;
    private String heroCtaText2;
    private String heroCtaLink2;
    private String heroBgImage;

    // Company Overview
    private String overviewLabel;
    private String overviewTitle;
    @Column(columnDefinition = "TEXT")
    private String overviewLead;
    @Column(columnDefinition = "TEXT")
    private String overviewBody;
    private String overviewImage1;
    private String overviewImage2;
    private String overviewBadgeIcon;
    private String overviewBadgeTitle;
    private String overviewBadgeText;

    // Mission & Vision
    private String missionTitle;
    @Column(columnDefinition = "TEXT")
    private String missionDesc;
    @Column(columnDefinition = "TEXT")
    private String missionPoints; // Newline separated points

    private String visionTitle;
    @Column(columnDefinition = "TEXT")
    private String visionDesc;
    @Column(columnDefinition = "TEXT")
    private String visionPoints; // Newline separated points

    // Statistics Counter Values
    private Integer statConferences;
    private Integer statResearchers;
    private Integer statCountries;
    private Integer statPublications;
    private Integer statSpeakers;
    private Integer statSatisfaction;

    // Join Community CTA
    private String ctaTitle;
    @Column(columnDefinition = "TEXT")
    private String ctaDesc;
    private String ctaButton1Text;
    private String ctaButton1Link;
    private String ctaButton2Text;
    private String ctaButton2Link;

    public AboutUsSection() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getHeroBadge() { return heroBadge; }
    public void setHeroBadge(String heroBadge) { this.heroBadge = heroBadge; }

    public String getHeroTitle() { return heroTitle; }
    public void setHeroTitle(String heroTitle) { this.heroTitle = heroTitle; }

    public String getHeroDescription() { return heroDescription; }
    public void setHeroDescription(String heroDescription) { this.heroDescription = heroDescription; }

    public String getHeroCtaText1() { return heroCtaText1; }
    public void setHeroCtaText1(String heroCtaText1) { this.heroCtaText1 = heroCtaText1; }

    public String getHeroCtaLink1() { return heroCtaLink1; }
    public void setHeroCtaLink1(String heroCtaLink1) { this.heroCtaLink1 = heroCtaLink1; }

    public String getHeroCtaText2() { return heroCtaText2; }
    public void setHeroCtaText2(String heroCtaText2) { this.heroCtaText2 = heroCtaText2; }

    public String getHeroCtaLink2() { return heroCtaLink2; }
    public void setHeroCtaLink2(String heroCtaLink2) { this.heroCtaLink2 = heroCtaLink2; }

    public String getHeroBgImage() { return heroBgImage; }
    public void setHeroBgImage(String heroBgImage) { this.heroBgImage = heroBgImage; }

    public String getOverviewLabel() { return overviewLabel; }
    public void setOverviewLabel(String overviewLabel) { this.overviewLabel = overviewLabel; }

    public String getOverviewTitle() { return overviewTitle; }
    public void setOverviewTitle(String overviewTitle) { this.overviewTitle = overviewTitle; }

    public String getOverviewLead() { return overviewLead; }
    public void setOverviewLead(String overviewLead) { this.overviewLead = overviewLead; }

    public String getOverviewBody() { return overviewBody; }
    public void setOverviewBody(String overviewBody) { this.overviewBody = overviewBody; }

    public String getOverviewImage1() { return overviewImage1; }
    public void setOverviewImage1(String overviewImage1) { this.overviewImage1 = overviewImage1; }

    public String getOverviewImage2() { return overviewImage2; }
    public void setOverviewImage2(String overviewImage2) { this.overviewImage2 = overviewImage2; }

    public String getOverviewBadgeIcon() { return overviewBadgeIcon; }
    public void setOverviewBadgeIcon(String overviewBadgeIcon) { this.overviewBadgeIcon = overviewBadgeIcon; }

    public String getOverviewBadgeTitle() { return overviewBadgeTitle; }
    public void setOverviewBadgeTitle(String overviewBadgeTitle) { this.overviewBadgeTitle = overviewBadgeTitle; }

    public String getOverviewBadgeText() { return overviewBadgeText; }
    public void setOverviewBadgeText(String overviewBadgeText) { this.overviewBadgeText = overviewBadgeText; }

    public String getMissionTitle() { return missionTitle; }
    public void setMissionTitle(String missionTitle) { this.missionTitle = missionTitle; }

    public String getMissionDesc() { return missionDesc; }
    public void setMissionDesc(String missionDesc) { this.missionDesc = missionDesc; }

    public String getMissionPoints() { return missionPoints; }
    public void setMissionPoints(String missionPoints) { this.missionPoints = missionPoints; }

    public String getVisionTitle() { return visionTitle; }
    public void setVisionTitle(String visionTitle) { this.visionTitle = visionTitle; }

    public String getVisionDesc() { return visionDesc; }
    public void setVisionDesc(String visionDesc) { this.visionDesc = visionDesc; }

    public String getVisionPoints() { return visionPoints; }
    public void setVisionPoints(String visionPoints) { this.visionPoints = visionPoints; }

    public Integer getStatConferences() { return statConferences; }
    public void setStatConferences(Integer statConferences) { this.statConferences = statConferences; }

    public Integer getStatResearchers() { return statResearchers; }
    public void setStatResearchers(Integer statResearchers) { this.statResearchers = statResearchers; }

    public Integer getStatCountries() { return statCountries; }
    public void setStatCountries(Integer statCountries) { this.statCountries = statCountries; }

    public Integer getStatPublications() { return statPublications; }
    public void setStatPublications(Integer statPublications) { this.statPublications = statPublications; }

    public Integer getStatSpeakers() { return statSpeakers; }
    public void setStatSpeakers(Integer statSpeakers) { this.statSpeakers = statSpeakers; }

    public Integer getStatSatisfaction() { return statSatisfaction; }
    public void setStatSatisfaction(Integer statSatisfaction) { this.statSatisfaction = statSatisfaction; }

    public String getCtaTitle() { return ctaTitle; }
    public void setCtaTitle(String ctaTitle) { this.ctaTitle = ctaTitle; }

    public String getCtaDesc() { return ctaDesc; }
    public void setCtaDesc(String ctaDesc) { this.ctaDesc = ctaDesc; }

    public String getCtaButton1Text() { return ctaButton1Text; }
    public void setCtaButton1Text(String ctaButton1Text) { this.ctaButton1Text = ctaButton1Text; }

    public String getCtaButton1Link() { return ctaButton1Link; }
    public void setCtaButton1Link(String ctaButton1Link) { this.ctaButton1Link = ctaButton1Link; }

    public String getCtaButton2Text() { return ctaButton2Text; }
    public void setCtaButton2Text(String ctaButton2Text) { this.ctaButton2Text = ctaButton2Text; }

    public String getCtaButton2Link() { return ctaButton2Link; }
    public void setCtaButton2Link(String ctaButton2Link) { this.ctaButton2Link = ctaButton2Link; }
}
