package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import com.endeavor.entity.AgendaSession;

public interface AgendaSessionRepo extends JpaRepository<AgendaSession, Long> {
}
