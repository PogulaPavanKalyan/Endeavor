package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "program_categories")
public class ProgramCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conference_id", nullable = false)
    private Long conferenceId;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "is_default")
    private Boolean isDefault = false;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    private Boolean status = true;
    
    @Transient
    private Long totalItemCount;
    
    @Transient
    private Long activeItemCount;

    public ProgramCategory() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getConferenceId() {
        return conferenceId;
    }

    public void setConferenceId(Long conferenceId) {
        this.conferenceId = conferenceId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public Boolean getIsDefault() {
        return isDefault;
    }

    public void setIsDefault(Boolean isDefault) {
        this.isDefault = isDefault;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getStatus() {
        return status;
    }

    public void setStatus(Boolean status) {
        this.status = status;
    }

    public Long getTotalItemCount() {
        return totalItemCount;
    }

    public void setTotalItemCount(Long totalItemCount) {
        this.totalItemCount = totalItemCount;
    }

    public Long getActiveItemCount() {
        return activeItemCount;
    }

    public void setActiveItemCount(Long activeItemCount) {
        this.activeItemCount = activeItemCount;
    }
}
