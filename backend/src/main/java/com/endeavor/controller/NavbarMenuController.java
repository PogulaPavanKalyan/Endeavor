package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.endeavor.entity.NavbarMenu;
import com.endeavor.service.NavbarMenuService;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*", allowedHeaders = "*")
@RequestMapping("/api/navbar-menus")
public class NavbarMenuController {

    @Autowired
    private NavbarMenuService service;

    @GetMapping
    public ResponseEntity<List<NavbarMenu>> getPublicMenus(@RequestParam Long conferenceId) {
        // Fetch menus and filter for only active and visible ones
        List<NavbarMenu> activeMenus = service.getMenusByConference(conferenceId)
                .stream()
                .filter(m -> Boolean.TRUE.equals(m.getIsActive()) && Boolean.TRUE.equals(m.getIsVisible()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(activeMenus);
    }

    @GetMapping("/page")
    public ResponseEntity<NavbarMenu> getPublicPage(@RequestParam Long conferenceId, @RequestParam String slug) {
        Optional<NavbarMenu> pageOpt = service.getMenuBySlug(conferenceId, slug);
        if (pageOpt.isPresent() && Boolean.TRUE.equals(pageOpt.get().getIsActive())) {
            return ResponseEntity.ok(pageOpt.get());
        }
        return ResponseEntity.notFound().build();
    }
}
