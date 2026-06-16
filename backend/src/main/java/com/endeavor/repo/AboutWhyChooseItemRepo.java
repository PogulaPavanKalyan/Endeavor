package com.endeavor.repo;

import com.endeavor.entity.AboutWhyChooseItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutWhyChooseItemRepo extends JpaRepository<AboutWhyChooseItem, Long> {
    List<AboutWhyChooseItem> findAllByOrderByDisplayOrderAsc();
}
