package com.endeavor.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "conference_photos")
public class ConferencePhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fileName;
    private String fileType;
    private String filePath;

    @jakarta.persistence.ManyToOne
    @jakarta.persistence.JoinColumn(name = "conference_id")
    @JsonBackReference
    private ConferenceDetails conferenceDetails;

    private Integer displayOrder = 0;
    private Boolean isPrimary = false;

    public ConferencePhoto() {
    }

    public ConferencePhoto(Long id, String fileName, String fileType, String filePath, ConferenceDetails conferenceDetails) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.conferenceDetails = conferenceDetails;
    }

    public ConferencePhoto(Long id, String fileName, String fileType, String filePath, ConferenceDetails conferenceDetails, Integer displayOrder, Boolean isPrimary) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.conferenceDetails = conferenceDetails;
        this.displayOrder = displayOrder;
        this.isPrimary = isPrimary;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    public String getFileType() {
        return fileType;
    }

    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    public String getFilePath() {
        return filePath;
    }

    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }

    public ConferenceDetails getConferenceDetails() {
        return conferenceDetails;
    }

    public void setConferenceDetails(ConferenceDetails conferenceDetails) {
        this.conferenceDetails = conferenceDetails;
    }

    public Integer getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(Integer displayOrder) {
        this.displayOrder = displayOrder;
    }

    public Boolean getIsPrimary() {
        return isPrimary;
    }

    public void setIsPrimary(Boolean isPrimary) {
        this.isPrimary = isPrimary;
    }

    @Override
    public String toString() {
        return "ConferencePhoto{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", fileType='" + fileType + '\'' +
                ", filePath='" + filePath + '\'' +
                ", displayOrder=" + displayOrder +
                ", isPrimary=" + isPrimary +
                '}';
    }
}
