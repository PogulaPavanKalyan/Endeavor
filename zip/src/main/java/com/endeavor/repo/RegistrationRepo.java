package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.Registration;
import java.util.Optional;

@Repository
public interface RegistrationRepo extends JpaRepository<Registration, Long> {
    Optional<Registration> findByTransactionId(String transactionId);

    List<Registration> findByConferenceId(Long conferenceId);
}
