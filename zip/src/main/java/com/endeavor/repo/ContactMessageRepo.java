package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ContactMessage;

@Repository
public interface ContactMessageRepo extends JpaRepository<ContactMessage, Long> {

    List<ContactMessage> findByConferenceId(Long conferenceId);
}
