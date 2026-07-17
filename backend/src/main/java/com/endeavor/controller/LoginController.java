package com.endeavor.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.endeavor.dto.LoginDTO;
import com.endeavor.entity.Users;
import com.endeavor.service.Service;
import com.endeavor.repo.UserRepo;

@RestController
@RequestMapping("/auth")
public class LoginController {

    @Autowired
    private Service service;

    @Autowired
    private UserRepo userRepo;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO loginDto) {
        String token = service.verify(loginDto);
        if (token != null) {
            Users user = userRepo.findByUsername(loginDto.getUsername());
            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            if (user != null) {
                response.put("role", user.getRole() != null ? user.getRole().name() : "USER");
                response.put("conferenceId", user.getConferenceId());
                response.put("forcePasswordChange", user.isForcePasswordChange());
            }
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody Users user) {
        try {
            Users savedUser = service.signUp(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}
