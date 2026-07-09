package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import com.endeavor.entity.AdvisoryBoardMember;
import com.endeavor.repo.AdvisoryBoardMemberRepo;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@CrossOrigin
public class AdvisoryBoardController {

    @Autowired
    private AdvisoryBoardMemberRepo repo;

    @GetMapping("/api/advisory-board")
    public ResponseEntity<List<AdvisoryBoardMember>> getPublicAdvisoryBoard(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(repo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId));
    }

    @GetMapping("/api/admin/advisory-board")
    public ResponseEntity<List<AdvisoryBoardMember>> getAdminAdvisoryBoard(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(repo.findByConferenceIdOrderByDisplayOrderAsc(conferenceId));
    }

    @PostMapping("/api/admin/advisory-board")
    public ResponseEntity<AdvisoryBoardMember> createMember(@RequestBody AdvisoryBoardMember member) {
        return ResponseEntity.status(HttpStatus.CREATED).body(repo.save(member));
    }

    @PutMapping("/api/admin/advisory-board/{id}")
    public ResponseEntity<AdvisoryBoardMember> updateMember(@PathVariable Long id, @RequestBody AdvisoryBoardMember details) {
        Optional<AdvisoryBoardMember> opt = repo.findById(id);
        if (opt.isPresent()) {
            AdvisoryBoardMember m = opt.get();
            m.setName(details.getName());
            m.setDesignation(details.getDesignation());
            m.setOrganization(details.getOrganization());
            m.setCountry(details.getCountry());
            m.setBio(details.getBio());
            m.setResearchExpertise(details.getResearchExpertise());
            m.setIsActive(details.getIsActive());
            if (details.getImagePath() != null) {
                m.setImagePath(details.getImagePath());
            }
            return ResponseEntity.ok(repo.save(m));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/api/admin/advisory-board/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        if (repo.existsById(id)) {
            repo.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/api/admin/advisory-board/{id}/photo", consumes = "multipart/form-data")
    public ResponseEntity<AdvisoryBoardMember> uploadPhoto(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<AdvisoryBoardMember> opt = repo.findById(id);
        if (!opt.isPresent()) {
            return ResponseEntity.notFound().build();
        }
        try {
            String folder = "uploads/advisory/";
            File uploadDir = new File(folder);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }
            String ext = "";
            String origName = file.getOriginalFilename();
            if (origName != null && origName.contains(".")) {
                ext = origName.substring(origName.lastIndexOf("."));
            }
            String fileName = UUID.randomUUID().toString() + ext;
            File destFile = new File(uploadDir, fileName);
            file.transferTo(destFile);

            AdvisoryBoardMember m = opt.get();
            m.setImagePath("/uploads/advisory/" + fileName);
            return ResponseEntity.ok(repo.save(m));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/api/admin/advisory-board/reorder")
    public ResponseEntity<Void> reorder(@RequestBody List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            Optional<AdvisoryBoardMember> opt = repo.findById(ids.get(i));
            if (opt.isPresent()) {
                AdvisoryBoardMember m = opt.get();
                m.setDisplayOrder(i);
                repo.save(m);
            }
        }
        return ResponseEntity.ok().build();
    }
}
