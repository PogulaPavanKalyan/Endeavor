package com.endeavor.repo;

import com.endeavor.entity.AboutMapConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AboutMapConnectionRepo extends JpaRepository<AboutMapConnection, Long> {
}
