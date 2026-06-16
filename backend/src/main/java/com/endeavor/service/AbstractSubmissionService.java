package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.AbstractSubmission;
import com.endeavor.repo.AbstractSubmissionRepo;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class AbstractSubmissionService {

    @Autowired
    private AbstractSubmissionRepo abstractSubmissionRepo;

    private final String uploadDir = "uploads/abstracts";

    public List<AbstractSubmission> getAllAbstracts() {
        return abstractSubmissionRepo.findAll();
    }

    public AbstractSubmission saveAbstract(
            String fullName,
            String designation,
            String company,
            String email,
            String phone,
            String country,
            String presentationType,
            String sessionName,
            MultipartFile file,
            Long conferenceId) throws IOException {

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

        AbstractSubmission submission = new AbstractSubmission();
        submission.setFullName(fullName);
        submission.setDesignation(designation);
        submission.setCompany(company);
        submission.setEmail(email);
        submission.setPhone(phone);
        submission.setCountry(country);
        submission.setPresentationType(presentationType);
        submission.setSessionName(sessionName);
        submission.setFilePath(dest.getAbsolutePath());
        submission.setStatus("SUBMITTED");
        submission.setConferenceId(conferenceId);

        return abstractSubmissionRepo.save(submission);
    }

    public List<AbstractSubmission> getByConferenceId(Long conferenceId) {
        return abstractSubmissionRepo.findByConferenceId(conferenceId);
    }

    public java.util.Optional<AbstractSubmission> getById(Long id) {
        return abstractSubmissionRepo.findById(id);
    }

    public AbstractSubmission save(AbstractSubmission submission) {
        return abstractSubmissionRepo.save(submission);
    }

    public void delete(Long id) {
        abstractSubmissionRepo.deleteById(id);
    }
}
