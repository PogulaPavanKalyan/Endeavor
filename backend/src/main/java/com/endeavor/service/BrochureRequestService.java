package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.BrochureRequest;
import com.endeavor.repo.BrochureRequestRepo;

import java.util.List;

@Service
public class BrochureRequestService {

    @Autowired
    private BrochureRequestRepo brochureRequestRepo;

    public List<BrochureRequest> getAllBrochures() {
        return brochureRequestRepo.findAll();
    }

    public BrochureRequest saveBrochureRequest(BrochureRequest request) {
        return brochureRequestRepo.save(request);
    }

    public List<BrochureRequest> getByConferenceId(Long conferenceId) {
        return brochureRequestRepo.findByConferenceId(conferenceId);
    }
}
