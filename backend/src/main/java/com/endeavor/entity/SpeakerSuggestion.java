package com.endeavor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import org.hibernate.annotations.CreationTimestamp;

@Entity
@Table(name = "speaker_suggestions")
public class SpeakerSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Referrer Details
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "compuniversity", nullable = false)
    private String compuniversity;

    @Column(name = "desigdept", nullable = false)
    private String desigdept;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "mobileno", nullable = false)
    private String mobileno;

    @Column(name = "profileurl")
    private String profileurl;

    // Suggested Speaker Details
    @Column(name = "sp_name", nullable = false)
    private String spName;

    @Column(name = "sp_compuniversity", nullable = false)
    private String spCompuniversity;

    @Column(name = "sp_desigdept", nullable = false)
    private String spDesigdept;

    @Column(name = "sp_email", nullable = false)
    private String spEmail;

    @Column(name = "sp_mobileno", nullable = false)
    private String spMobileno;

    @Column(name = "sp_profileurl")
    private String spProfileurl;

    @Column(name = "conference_id")
    private Long conferenceId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public SpeakerSuggestion() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCompuniversity() {
        return compuniversity;
    }

    public void setCompuniversity(String compuniversity) {
        this.compuniversity = compuniversity;
    }

    public String getDesigdept() {
        return desigdept;
    }

    public void setDesigdept(String desigdept) {
        this.desigdept = desigdept;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getMobileno() {
        return mobileno;
    }

    public void setMobileno(String mobileno) {
        this.mobileno = mobileno;
    }

    public String getProfileurl() {
        return profileurl;
    }

    public void setProfileurl(String profileurl) {
        this.profileurl = profileurl;
    }

    public String getSpName() {
        return spName;
    }

    public void setSpName(String spName) {
        this.spName = spName;
    }

    public String getSpCompuniversity() {
        return spCompuniversity;
    }

    public void setSpCompuniversity(String spCompuniversity) {
        this.spCompuniversity = spCompuniversity;
    }

    public String getSpDesigdept() {
        return spDesigdept;
    }

    public void setSpDesigdept(String spDesigdept) {
        this.spDesigdept = spDesigdept;
    }

    public String getSpEmail() {
        return spEmail;
    }

    public void setSpEmail(String spEmail) {
        this.spEmail = spEmail;
    }

    public String getSpMobileno() {
        return spMobileno;
    }

    public void setSpMobileno(String spMobileno) {
        this.spMobileno = spMobileno;
    }

    public String getSpProfileurl() {
        return spProfileurl;
    }

    public void setSpProfileurl(String spProfileurl) {
        this.spProfileurl = spProfileurl;
    }

    public Long getConferenceId() {
        return conferenceId;
    }

    public void setConferenceId(Long conferenceId) {
        this.conferenceId = conferenceId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
