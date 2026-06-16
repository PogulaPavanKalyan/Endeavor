package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_timeline_milestone")
public class AboutTimelineMilestone {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String year;
    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    private String side; // "left" or "right"
    private Integer displayOrder = 0;

    public AboutTimelineMilestone() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getYear() { return year; }
    public void setYear(String year) { this.year = year; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getSide() { return side; }
    public void setSide(String side) { this.side = side; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
