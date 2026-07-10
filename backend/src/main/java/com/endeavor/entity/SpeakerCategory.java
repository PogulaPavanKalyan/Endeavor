package com.endeavor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;

@Entity
@Table(name = "speaker_categories")
public class SpeakerCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="conference_id")
    private Long conferenceId;

    @Column(name="category_name", nullable=false)
    private String categoryName;

    @Column(name="is_default")
    private Boolean isDefault = false;

    @Column(name="display_order")
    private Integer displayOrder = 0;

    @Column(name="status")
    private Boolean status = true;
    
    @Transient
    private Long activeSpeakerCount = 0L;

    @Transient
    private Long totalSpeakerCount = 0L;

    public SpeakerCategory() {
    }

    public SpeakerCategory(Long conferenceId, String categoryName, Boolean isDefault, Integer displayOrder) {
        this.conferenceId = conferenceId;
        this.categoryName = categoryName;
        this.isDefault = isDefault;
        this.displayOrder = displayOrder;
        this.status = true;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }

    public String getCategoryName() { return categoryName; }
    public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

    public Boolean getIsDefault() { return isDefault; }
    public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }

    public Long getActiveSpeakerCount() { return activeSpeakerCount; }
    public void setActiveSpeakerCount(Long activeSpeakerCount) { this.activeSpeakerCount = activeSpeakerCount; }

    public Long getTotalSpeakerCount() { return totalSpeakerCount; }
    public void setTotalSpeakerCount(Long totalSpeakerCount) { this.totalSpeakerCount = totalSpeakerCount; }
}
