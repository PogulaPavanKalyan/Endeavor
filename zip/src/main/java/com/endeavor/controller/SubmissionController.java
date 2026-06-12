package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.endeavor.entity.AbstractSubmission;
import com.endeavor.entity.BrochureRequest;
import com.endeavor.entity.ContactMessage;
import com.endeavor.entity.Registration;
import com.endeavor.entity.SpeakerSuggestion;
import com.endeavor.service.ContactMessageService;
import com.endeavor.service.BrochureRequestService;
import com.endeavor.service.RegistrationService;
import com.endeavor.service.AbstractSubmissionService;
import com.endeavor.service.SpeakerSuggestionService;

import java.io.IOException;
import java.util.Optional;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://127.0.0.1:5173", "http://127.0.0.1:5174"})
public class SubmissionController {

    @Autowired
    private ContactMessageService contactMessageService;

    @Autowired
    private BrochureRequestService brochureRequestService;

    @Autowired
    private RegistrationService registrationService;

    @Autowired
    private AbstractSubmissionService abstractSubmissionService;

    @Autowired
    private SpeakerSuggestionService speakerSuggestionService;

    @PostMapping("/contact")
    public ResponseEntity<ContactMessage> submitContact(@RequestBody ContactMessage message) {
        ContactMessage saved = contactMessageService.saveContact(message);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/brochure")
    public ResponseEntity<BrochureRequest> submitBrochureRequest(@RequestBody BrochureRequest request) {
        BrochureRequest saved = brochureRequestService.saveBrochureRequest(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/register")
    public ResponseEntity<Registration> submitRegistration(@RequestBody Registration registration) {
        Registration saved = registrationService.register(registration);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PostMapping("/register/confirm")
    public ResponseEntity<?> confirmPayment(@RequestParam Long registrationId, @RequestParam String transactionId) {
        Optional<Registration> regOpt = registrationService.confirmPayment(registrationId, transactionId);
        if (regOpt.isPresent()) {
            return ResponseEntity.ok(regOpt.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Registration not found");
    }

    @PostMapping(value = "/abstracts", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitAbstract(
        @RequestParam("fullName") String fullName,
        @RequestParam("designation") String designation,
        @RequestParam("company") String company,
        @RequestParam("email") String email,
        @RequestParam("phone") String phone,
        @RequestParam("country") String country,
        @RequestParam("presentationType") String presentationType,
        @RequestParam("sessionName") String sessionName,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "conferenceId", required = false) Long conferenceId) {

        try {
            AbstractSubmission saved = abstractSubmissionService.saveAbstract(
                fullName, designation, company, email, phone, country, presentationType, sessionName, file, conferenceId
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Failed to store file: " + e.getMessage());
        }
    }

    @PostMapping("/suggest-speaker")
    public ResponseEntity<SpeakerSuggestion> submitSpeakerSuggestion(@RequestBody SpeakerSuggestion suggestion) {
        SpeakerSuggestion saved = speakerSuggestionService.saveSuggestion(suggestion);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
