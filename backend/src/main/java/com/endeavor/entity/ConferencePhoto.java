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

    @OneToOne(mappedBy = "photo")
    @JsonBackReference
    private ConferenceDetails conferenceDetails;

    public ConferencePhoto() {
    }

    public ConferencePhoto(Long id, String fileName, String fileType, String filePath, ConferenceDetails conferenceDetails) {
        this.id = id;
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.conferenceDetails = conferenceDetails;
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

    @Override
    public String toString() {
        return "ConferencePhoto{" +
                "id=" + id +
                ", fileName='" + fileName + '\'' +
                ", fileType='" + fileType + '\'' +
                ", filePath='" + filePath + '\'' +
                '}';
    }
}
