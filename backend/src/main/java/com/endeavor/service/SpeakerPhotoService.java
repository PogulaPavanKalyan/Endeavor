package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.SpeakerPhoto;
import com.endeavor.repo.SpeakerPhotoRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class SpeakerPhotoService {

    @Autowired
    private SpeakerPhotoRepo speakerPhotoRepo;

    private final String uploadDir = "uploads/speakers";

    public SpeakerPhoto saveSpeakerPhoto(MultipartFile file) throws IOException {
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

        SpeakerPhoto photo = new SpeakerPhoto();
        photo.setFileName(uniqueName);
        photo.setFileType(file.getContentType());
        photo.setFilePath(dest.getAbsolutePath());

        return speakerPhotoRepo.save(photo);
    }
}
