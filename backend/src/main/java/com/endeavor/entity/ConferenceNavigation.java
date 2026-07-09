package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "conference_navigation")
public class ConferenceNavigation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "conference_id", nullable = false)
    private Long conferenceId;

    @Column(name = "menu_name", nullable = false)
    private String menuName;

    private String slug;
    
    private String url;

    @Column(name = "display_order", nullable = false)
    private Integer displayOrder = 0;

    @Column(name = "parent_id")
    private Long parentId;

    private String icon;

    @Column(name = "status", nullable = false)
    private Boolean status = true; // active or inactive

    @Column(name = "open_in_new_tab", nullable = false)
    private Boolean openInNewTab = false;

    private String visibility;

    @Column(name = "section_id")
    private String sectionId;

    public ConferenceNavigation() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }
    public String getMenuName() { return menuName; }
    public void setMenuName(String menuName) { this.menuName = menuName; }
    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    public Long getParentId() { return parentId; }
    public void setParentId(Long parentId) { this.parentId = parentId; }
    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
    public Boolean getStatus() { return status; }
    public void setStatus(Boolean status) { this.status = status; }
    public Boolean getOpenInNewTab() { return openInNewTab; }
    public void setOpenInNewTab(Boolean openInNewTab) { this.openInNewTab = openInNewTab; }
    public String getVisibility() { return visibility; }
    public void setVisibility(String visibility) { this.visibility = visibility; }
    public String getSectionId() { return sectionId; }
    public void setSectionId(String sectionId) { this.sectionId = sectionId; }
}
