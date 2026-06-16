package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.endeavor.entity.ContactMessage;
import com.endeavor.repo.ContactMessageRepo;

import java.util.List;

@Service
public class ContactMessageService {

    @Autowired
    private ContactMessageRepo contactMessageRepo;

    public List<ContactMessage> getAllContacts() {
        return contactMessageRepo.findAll();
    }

    public ContactMessage saveContact(ContactMessage message) {
        return contactMessageRepo.save(message);
    }

    public List<ContactMessage> getByConferenceId(Long conferenceId) {
        return contactMessageRepo.findByConferenceId(conferenceId);
    }

    public java.util.Optional<ContactMessage> getById(Long id) {
        return contactMessageRepo.findById(id);
    }

    public void delete(Long id) {
        contactMessageRepo.deleteById(id);
    }
}
