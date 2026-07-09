package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.endeavor.entity.AdvisoryBoardMember;
import java.util.List;

public interface AdvisoryBoardMemberRepo extends JpaRepository<AdvisoryBoardMember, Long> {
    List<AdvisoryBoardMember> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);
    List<AdvisoryBoardMember> findByConferenceId(Long conferenceId);
}
