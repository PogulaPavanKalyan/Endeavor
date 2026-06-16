package com.endeavor.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "abstract_submissions")
public class AbstractSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String designation;
    private String company;
    private String email;
    private String phone;
    private String country;

    private String presentationType; // e.g. "Oral Presentation", "Poster Presentation", "Keynote Presentation"

    private String sessionName;

    private String filePath;   // Path to stored file (PDF/DOCX) on server filesystem
    private String status;     // e.g. "SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "REJECTED"

    public AbstractSubmission() {
    }

    public AbstractSubmission(Long id, String fullName, String designation, String company, String email, String phone, 
                              String country, String presentationType, String sessionName, String filePath, String status) {
        this.id = id;
        this.fullName = fullName;
        this.designation = designation;
        this.company = company;
        this.email = email;
        this.phone = phone;
        this.country = country;
        this.presentationType = presentationType;
        this.sessionName = sessionName;
        this.filePath = filePath;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getCompany() {
        return company;
    }

    public void setCompany(String company) {
        this.company = company;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getPresentationType() {
        return presentationType;
    }

    public void setPresentationType(String presentationType) {
        this.presentationType = presentationType;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    @Column(name="conference_id")
    private Long conferenceId;

    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }
}
