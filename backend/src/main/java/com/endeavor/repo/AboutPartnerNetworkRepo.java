package com.endeavor.repo;

import com.endeavor.entity.AboutPartnerNetwork;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutPartnerNetworkRepo extends JpaRepository<AboutPartnerNetwork, Long> {
    List<AboutPartnerNetwork> findAllByOrderByDisplayOrderAsc();
}
