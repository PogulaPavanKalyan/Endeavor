package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.ConferenceSectionItem;
import java.util.List;

@Repository
public interface ConferenceSectionItemRepository extends JpaRepository<ConferenceSectionItem, Long> {

    List<ConferenceSectionItem> findBySectionIdOrderByDisplayOrderAsc(Long sectionId);

    void deleteBySectionId(Long sectionId);
}
