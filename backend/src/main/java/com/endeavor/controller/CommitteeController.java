package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.CommitteeMember;
import com.endeavor.service.CommitteeMemberService;
import java.util.List;
import java.util.Optional;
import java.io.File;
import java.util.UUID;

@RestController
public class CommitteeController {

    @Autowired
    private CommitteeMemberService service;

    @GetMapping("/api/committee")
    public ResponseEntity<List<CommitteeMember>> getPublicCommittee(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @GetMapping("/api/admin/committee")
    public ResponseEntity<List<CommitteeMember>> getAdminCommittee(@RequestParam Long conferenceId) {
        return ResponseEntity.ok(service.getByConferenceId(conferenceId));
    }

    @PostMapping("/api/admin/committee")
    public ResponseEntity<CommitteeMember> createMember(@RequestBody CommitteeMember member) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.save(member));
    }

    @PutMapping("/api/admin/committee/{id}")
    public ResponseEntity<CommitteeMember> updateMember(@PathVariable Long id, @RequestBody CommitteeMember details) {
        return service.getById(id).map(member -> {
            member.setName(details.getName());
            member.setRole(details.getRole());
            member.setInstitution(details.getInstitution());
            member.setCountry(details.getCountry());
            member.setPhotoUrl(details.getPhotoUrl());
            member.setDisplayOrder(details.getDisplayOrder());
            member.setDesignation(details.getDesignation());
            member.setBiography(details.getBiography());
            member.setIsActive(details.getIsActive());
            return ResponseEntity.ok(service.save(member));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/api/admin/committee/{id}")
    public ResponseEntity<Void> deleteMember(@PathVariable Long id) {
        if (service.getById(id).isPresent()) {
            service.delete(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping(value = "/api/admin/committee/{id}/photo", consumes = "multipart/form-data")
    public ResponseEntity<CommitteeMember> uploadCommitteePhoto(@PathVariable Long id, @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return service.getById(id).map(member -> {
            try {
                String folder = "uploads/committee/";
                String absolutePath = System.getProperty("user.dir") + "/" + folder;
                File uploadDir = new File(absolutePath);
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
                
                member.setPhotoUrl("/uploads/committee/" + fileName);
                return ResponseEntity.ok(service.save(member));
            } catch (Exception e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<CommitteeMember>build();
            }
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/api/admin/committee/reorder")
    public ResponseEntity<Void> reorderCommittee(@RequestBody List<Long> ids) {
        for (int i = 0; i < ids.size(); i++) {
            Optional<CommitteeMember> opt = service.getById(ids.get(i));
            if (opt.isPresent()) {
                CommitteeMember m = opt.get();
                m.setDisplayOrder(i);
                service.save(m);
            }
        }
        return ResponseEntity.ok().build();
    }
}
