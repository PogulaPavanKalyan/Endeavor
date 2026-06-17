package com.endeavor.repo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.endeavor.entity.NavbarMenu;
import java.util.List;
import java.util.Optional;

@Repository
public interface NavbarMenuRepository extends JpaRepository<NavbarMenu, Long> {

    List<NavbarMenu> findByConferenceIdOrderByDisplayOrderAsc(Long conferenceId);

    Optional<NavbarMenu> findByConferenceIdAndSlug(Long conferenceId, String slug);

    boolean existsByConferenceIdAndSlug(Long conferenceId, String slug);

    boolean existsByConferenceIdAndSlugAndIdNot(Long conferenceId, String slug, Long id);
}
