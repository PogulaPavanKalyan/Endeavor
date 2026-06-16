package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.AdminActivityLog;

@Repository
public interface AdminActivityLogRepo extends JpaRepository<AdminActivityLog, Long> {
}
