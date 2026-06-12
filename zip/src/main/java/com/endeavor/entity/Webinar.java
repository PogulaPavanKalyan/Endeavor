package com.endeavor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.LocalDateTime;

@Entity
@Table(name = "webinars")
public class Webinar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(unique = true, nullable = false, length = 300)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "banner_url", length = 500)
    private String bannerUrl;

    @Column(name = "speaker_name", length = 200)
    private String speakerName;

    @Column(name = "speaker_photo", length = 500)
    private String speakerPhoto;

    @Column(name = "speaker_designation", length = 200)
    private String speakerDesignation;

    @Column(name = "webinar_date", length = 50)
    private String webinarDate;

    @Column(name = "start_time", length = 50)
    private String startTime;

    @Column(name = "end_time", length = 50)
    private String endTime;

    @Column(name = "time_zone", length = 50)
    private String timeZone;

    @Column(name = "meeting_link", length = 500)
    private String meetingLink;

    @Column(name = "registration_required")
    private Boolean registrationRequired = false;

    @Column(name = "registration_url", length = 500)
    private String registrationUrl;

    @Column(name = "certificate_available")
    private Boolean certificateAvailable = false;

    @Column(nullable = false, length = 50)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, COMPLETED, ARCHIVED

    @Column(name = "recording_url", length = 500)
    private String recordingUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Webinar() {
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getBannerUrl() {
        return bannerUrl;
    }

    public void setBannerUrl(String bannerUrl) {
        this.bannerUrl = bannerUrl;
    }

    public String getSpeakerName() {
        return speakerName;
    }

    public void setSpeakerName(String speakerName) {
        this.speakerName = speakerName;
    }

    public String getSpeakerPhoto() {
        return speakerPhoto;
    }

    public void setSpeakerPhoto(String speakerPhoto) {
        this.speakerPhoto = speakerPhoto;
    }

    public String getSpeakerDesignation() {
        return speakerDesignation;
    }

    public void setSpeakerDesignation(String speakerDesignation) {
        this.speakerDesignation = speakerDesignation;
    }

    public String getWebinarDate() {
        return webinarDate;
    }

    public void setWebinarDate(String webinarDate) {
        this.webinarDate = webinarDate;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getTimeZone() {
        return timeZone;
    }

    public void setTimeZone(String timeZone) {
        this.timeZone = timeZone;
    }

    public String getMeetingLink() {
        return meetingLink;
    }

    public void setMeetingLink(String meetingLink) {
        this.meetingLink = meetingLink;
    }

    public Boolean getRegistrationRequired() {
        return registrationRequired;
    }

    public void setRegistrationRequired(Boolean registrationRequired) {
        this.registrationRequired = registrationRequired;
    }

    public String getRegistrationUrl() {
        return registrationUrl;
    }

    public void setRegistrationUrl(String registrationUrl) {
        this.registrationUrl = registrationUrl;
    }

    public Boolean getCertificateAvailable() {
        return certificateAvailable;
    }

    public void setCertificateAvailable(Boolean certificateAvailable) {
        this.certificateAvailable = certificateAvailable;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRecordingUrl() {
        return recordingUrl;
    }

    public void setRecordingUrl(String recordingUrl) {
        this.recordingUrl = recordingUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
