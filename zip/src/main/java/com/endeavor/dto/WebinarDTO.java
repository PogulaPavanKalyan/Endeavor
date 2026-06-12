package com.endeavor.dto;

import com.endeavor.entity.Webinar;
import java.time.LocalDateTime;

public class WebinarDTO {

    private Long id;
    private String title;
    private String slug;
    private String description;
    private String bannerUrl;
    private String speakerName;
    private String speakerPhoto;
    private String speakerDesignation;
    private String webinarDate;
    private String startTime;
    private String endTime;
    private String timeZone;
    private String meetingLink;
    private Boolean registrationRequired;
    private String registrationUrl;
    private Boolean certificateAvailable;
    private String status;
    private String recordingUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public WebinarDTO() {
    }

    public WebinarDTO(Webinar webinar) {
        if (webinar != null) {
            this.id = webinar.getId();
            this.title = webinar.getTitle();
            this.slug = webinar.getSlug();
            this.description = webinar.getDescription();
            this.bannerUrl = webinar.getBannerUrl();
            this.speakerName = webinar.getSpeakerName();
            this.speakerPhoto = webinar.getSpeakerPhoto();
            this.speakerDesignation = webinar.getSpeakerDesignation();
            this.webinarDate = webinar.getWebinarDate();
            this.startTime = webinar.getStartTime();
            this.endTime = webinar.getEndTime();
            this.timeZone = webinar.getTimeZone();
            this.meetingLink = webinar.getMeetingLink();
            this.registrationRequired = webinar.getRegistrationRequired();
            this.registrationUrl = webinar.getRegistrationUrl();
            this.certificateAvailable = webinar.getCertificateAvailable();
            this.status = webinar.getStatus();
            this.recordingUrl = webinar.getRecordingUrl();
            this.createdAt = webinar.getCreatedAt();
            this.updatedAt = webinar.getUpdatedAt();
        }
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
