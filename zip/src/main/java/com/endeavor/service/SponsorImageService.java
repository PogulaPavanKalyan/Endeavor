package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.SponsorImage;
import com.endeavor.repo.SponsorImageRepo;

import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class SponsorImageService {

    @Autowired
    private SponsorImageRepo sponsorImageRepo;

    private final String uploadDir = "uploads/sponsors";

    public SponsorImage saveSponsorImage(MultipartFile file) throws IOException {
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

        SponsorImage image = new SponsorImage();
        image.setFileName(uniqueName);
        image.setFileType(file.getContentType());
        image.setFilePath(dest.getAbsolutePath());

        return sponsorImageRepo.save(image);
    }
}
