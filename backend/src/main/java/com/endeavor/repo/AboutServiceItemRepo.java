package com.endeavor.repo;

import com.endeavor.entity.AboutServiceItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AboutServiceItemRepo extends JpaRepository<AboutServiceItem, Long> {
    List<AboutServiceItem> findAllByOrderByDisplayOrderAsc();
}
