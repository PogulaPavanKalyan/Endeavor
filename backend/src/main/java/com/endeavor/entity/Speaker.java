package com.endeavor.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "speakers")
public class Speaker {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String designation;
    private String affiliation;
    private String country;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String type; // e.g. "ADVISORY_BOARD", "KEYNOTE_SPEAKER", "SPEAKER"
    
    @Column(columnDefinition = "TEXT")
    private String speakerAbstract;

    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "photo_id", referencedColumnName = "id")
    @JsonManagedReference
    private SpeakerPhoto photo;

    public Speaker() {
    }

    public Speaker(Long id, String name, String designation, String affiliation, String country, String bio, String type, SpeakerPhoto photo) {
        this.id = id;
        this.name = name;
        this.designation = designation;
        this.affiliation = affiliation;
        this.country = country;
        this.bio = bio;
        this.type = type;
        this.photo = photo;
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

    public String getDesignation() {
        return designation;
    }

    public void setDesignation(String designation) {
        this.designation = designation;
    }

    public String getAffiliation() {
        return affiliation;
    }

    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public SpeakerPhoto getPhoto() {
        return photo;
    }

    public void setPhoto(SpeakerPhoto photo) {
        this.photo = photo;
    }

    public String getSpeakerAbstract() {
        return speakerAbstract;
    }

    public void setSpeakerAbstract(String speakerAbstract) {
        this.speakerAbstract = speakerAbstract;
    }

    @Column(name="conference_id")
    private Long conferenceId;

    public Long getConferenceId() { return conferenceId; }
    public void setConferenceId(Long conferenceId) { this.conferenceId = conferenceId; }
}
