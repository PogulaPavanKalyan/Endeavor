package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.CommitteeMember;
import com.endeavor.service.CommitteeMemberService;
import java.util.List;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
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
}
