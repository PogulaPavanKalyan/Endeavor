package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.Registration;
import com.endeavor.repo.RegistrationRepo;

import java.util.List;
import java.util.Optional;

@Service
public class RegistrationService {

    @Autowired
    private RegistrationRepo registrationRepo;

    public List<Registration> getAllRegistrations() {
        return registrationRepo.findAll();
    }

    public Registration register(Registration registration) {
        if (registration.getPaymentStatus() == null) {
            registration.setPaymentStatus("PENDING");
        }
        return registrationRepo.save(registration);
    }

    public Optional<Registration> confirmPayment(Long registrationId, String transactionId) {
        Optional<Registration> regOpt = registrationRepo.findById(registrationId);
        if (regOpt.isPresent()) {
            Registration registration = regOpt.get();
            registration.setPaymentStatus("COMPLETED");
            registration.setTransactionId(transactionId);
            return Optional.of(registrationRepo.save(registration));
        }
        return Optional.empty();
    }

    public List<Registration> getByConferenceId(Long conferenceId) {
        return registrationRepo.findByConferenceId(conferenceId);
    }
}
