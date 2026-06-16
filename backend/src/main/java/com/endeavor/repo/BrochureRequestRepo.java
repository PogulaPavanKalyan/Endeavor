package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.BrochureRequest;

@Repository
public interface BrochureRequestRepo extends JpaRepository<BrochureRequest, Long> {

    List<BrochureRequest> findByConferenceId(Long conferenceId);
}
