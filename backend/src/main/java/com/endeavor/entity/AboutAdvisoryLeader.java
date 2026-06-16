package com.endeavor.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "about_advisory_leader")
public class AboutAdvisoryLeader {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String role;
    private String institution;
    private String country;
    private String photoFileName;
    private String emoji; // Fallback avatar emoji like 👩‍🔬
    private Integer displayOrder = 0;

    public AboutAdvisoryLeader() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getInstitution() { return institution; }
    public void setInstitution(String institution) { this.institution = institution; }

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }

    public String getPhotoFileName() { return photoFileName; }
    public void setPhotoFileName(String photoFileName) { this.photoFileName = photoFileName; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
}
