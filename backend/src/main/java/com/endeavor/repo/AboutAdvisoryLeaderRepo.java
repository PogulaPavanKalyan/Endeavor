package com.endeavor.repo;

import com.endeavor.entity.AboutAdvisoryLeader;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutAdvisoryLeaderRepo extends JpaRepository<AboutAdvisoryLeader, Long> {
    List<AboutAdvisoryLeader> findAllByOrderByDisplayOrderAsc();
}
