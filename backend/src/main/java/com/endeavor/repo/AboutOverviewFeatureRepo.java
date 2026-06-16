package com.endeavor.repo;

import com.endeavor.entity.AboutOverviewFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutOverviewFeatureRepo extends JpaRepository<AboutOverviewFeature, Long> {
    List<AboutOverviewFeature> findAllByOrderByDisplayOrderAsc();
}
