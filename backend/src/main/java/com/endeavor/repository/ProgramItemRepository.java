package com.endeavor.repository;

import com.endeavor.entity.ProgramItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramItemRepository extends JpaRepository<ProgramItem, Long> {
    List<ProgramItem> findByCategoryIdOrderByDisplayOrderAsc(Long categoryId);
    long countByCategoryId(Long categoryId);
    long countByCategoryIdAndStatusTrue(Long categoryId);
}
