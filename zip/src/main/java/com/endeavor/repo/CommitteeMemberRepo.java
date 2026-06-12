package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.CommitteeMember;
import java.util.List;

@Repository
public interface CommitteeMemberRepo extends JpaRepository<CommitteeMember, Long> {
    List<CommitteeMember> findByConferenceId(Long conferenceId);
}
