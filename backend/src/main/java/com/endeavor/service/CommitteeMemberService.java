package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.endeavor.entity.CommitteeMember;
import com.endeavor.repo.CommitteeMemberRepo;
import java.util.List;
import java.util.Optional;

@Service
public class CommitteeMemberService {

    @Autowired
    private CommitteeMemberRepo repo;

    public List<CommitteeMember> getAllCommitteeMembers() {
        return repo.findAll();
    }

    public List<CommitteeMember> getByConferenceId(Long conferenceId) {
        return repo.findByConferenceId(conferenceId);
    }

    public Optional<CommitteeMember> getById(Long id) {
        return repo.findById(id);
    }

    public CommitteeMember save(CommitteeMember member) {
        return repo.save(member);
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }
}
