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
        String extension = ".jpg"; // default to jpg for compression
        if (originalFileName != null && originalFileName.contains(".")) {
            String origExt = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            if (origExt.equals(".png") || origExt.equals(".webp") || origExt.equals(".jpeg") || origExt.equals(".jpg")) {
                extension = origExt;
            }
        }
        
        String uniqueName = UUID.randomUUID().toString() + (extension.equals(".png") ? ".png" : ".jpg"); // convert non-png to jpg for optimal compression
        File dest = new File(dir.getAbsolutePath(), uniqueName);

        File tempFile = File.createTempFile("upload-", ".tmp");
        file.transferTo(tempFile);

        try {
            compressImage(tempFile, dest, file.getContentType());
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }

        ConferencePhoto photo = new ConferencePhoto();
        photo.setFileName(uniqueName);
        photo.setFileType(extension.equals(".png") ? "image/png" : "image/jpeg");
        photo.setFilePath(dest.getAbsolutePath());

        return conferencePhotoRepo.save(photo);
    }

    public String saveAboutImage(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        String originalFileName = file.getOriginalFilename();
        String extension = ".jpg";
        if (originalFileName != null && originalFileName.contains(".")) {
            String origExt = originalFileName.substring(originalFileName.lastIndexOf(".")).toLowerCase();
            if (origExt.equals(".png") || origExt.equals(".webp") || origExt.equals(".jpeg") || origExt.equals(".jpg")) {
                extension = origExt;
            }
        }
        String uniqueName = "about-" + UUID.randomUUID().toString() + (extension.equals(".png") ? ".png" : ".jpg");
        File dest = new File(dir.getAbsolutePath(), uniqueName);

        File tempFile = File.createTempFile("about-", ".tmp");
        file.transferTo(tempFile);
        try {
            compressImage(tempFile, dest, file.getContentType());
        } finally {
            if (tempFile.exists()) {
                tempFile.delete();
            }
        }
        return uniqueName;
    }

    private void compressImage(File inputFile, File outputFile, String contentType) {
        try {
            java.awt.image.BufferedImage image = javax.imageio.ImageIO.read(inputFile);
            if (image == null) {
                // If not an image ImageIO can read, just copy/keep it as is
                java.nio.file.Files.copy(inputFile.toPath(), outputFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                return;
            }

            // We only compress if it is JPEG/JPG or PNG
            String formatName = "jpg";
            if (contentType != null && contentType.toLowerCase().contains("png")) {
                formatName = "png";
            }

            // Create image writer
            java.util.Iterator<javax.imageio.ImageWriter> writers = javax.imageio.ImageIO.getImageWritersByFormatName(formatName);
            if (!writers.hasNext()) {
                java.nio.file.Files.copy(inputFile.toPath(), outputFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
                return;
            }

            javax.imageio.ImageWriter writer = writers.next();
            try (javax.imageio.stream.ImageOutputStream ios = javax.imageio.ImageIO.createImageOutputStream(outputFile)) {
                writer.setOutput(ios);
                
                javax.imageio.ImageWriteParam param = writer.getDefaultWriteParam();
                if (param.canWriteCompressed() && formatName.equals("jpg")) {
                    param.setCompressionMode(javax.imageio.ImageWriteParam.MODE_EXPLICIT);
                    param.setCompressionQuality(0.75f); // 75% quality for excellent compression vs quality
                }
                
                writer.write(null, new javax.imageio.IIOImage(image, null, null), param);
            } finally {
                writer.dispose();
            }
        } catch (Exception e) {
            System.err.println("Image compression failed, using original file: " + e.getMessage());
            try {
                java.nio.file.Files.copy(inputFile.toPath(), outputFile.toPath(), java.nio.file.StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception ex) {
                ex.printStackTrace();
            }
        }
    }
}
