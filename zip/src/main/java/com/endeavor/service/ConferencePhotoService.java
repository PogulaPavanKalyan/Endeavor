package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.ConferencePhoto;
import com.endeavor.repo.ConferencePhotoRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ConferencePhotoService {

    @Autowired
    private ConferencePhotoRepo conferencePhotoRepo;

    private final String uploadDir = "uploads/conference";

    public ConferencePhoto saveConferencePhoto(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        // Ensure directory exists
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFileName = file.getOriginalFilename();
        String extension = "";
        if (originalFileName != null && originalFileName.contains(".")) {
            extension = originalFileName.substring(originalFileName.lastIndexOf("."));
        }
        String uniqueName = UUID.randomUUID().toString() + extension;
        File dest = new File(dir.getAbsolutePath(), uniqueName);
        file.transferTo(dest);

        ConferencePhoto photo = new ConferencePhoto();
        photo.setFileName(uniqueName);
        photo.setFileType(file.getContentType());
        photo.setFilePath(dest.getAbsolutePath());

        return conferencePhotoRepo.save(photo);
    }
}
