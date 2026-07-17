package com.endeavor.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.jdbc.core.JdbcTemplate;

import com.endeavor.entity.Users;
import com.endeavor.entity.Role;
import com.endeavor.repo.UserRepo;
import com.endeavor.service.AdminActivityLogService;

import jakarta.servlet.http.HttpServletRequest;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
public class AdminManagementController {

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AdminActivityLogService activityLogService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @GetMapping("/fix-db")
    public ResponseEntity<?> fixDb() {
        jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(255);");
        return ResponseEntity.ok("Database fixed");
    }

    // POST /api/admin/create-admin
    @PostMapping("/create-admin")
    public ResponseEntity<?> createAdmin(@RequestBody Users adminDetails, Principal principal, HttpServletRequest request) {
        if (adminDetails.getUsername() == null || adminDetails.getUsername().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Username is required");
        }
        if (adminDetails.getPassword() == null || adminDetails.getPassword().trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Password is required");
        }
        if (userRepo.findByUsername(adminDetails.getUsername()) != null) {
            return ResponseEntity.badRequest().body("Username already exists");
        }

        Users newAdmin = new Users();
        newAdmin.setUsername(adminDetails.getUsername());
        newAdmin.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
        newAdmin.setName(adminDetails.getName());
        newAdmin.setEmail(adminDetails.getEmail());
        newAdmin.setConferenceId(adminDetails.getConferenceId());
        newAdmin.setForcePasswordChange(true); // Force password change on first login

        // Default role is ADMIN if none specified
        Role role = adminDetails.getRole();
        if (role == null || role == Role.USER) {
            role = Role.ADMIN;
        }
        newAdmin.setRole(role);

        Users saved = userRepo.save(newAdmin);

        // Audit Logging
        String creator = principal != null ? principal.getName() : "system";
        String ip = request.getRemoteAddr();
        activityLogService.logActivity(creator, "CREATE_ADMIN", 
            "Created admin account: " + saved.getUsername() + " with role: " + saved.getRole(), ip);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // PUT /api/admin/update-admin/{id}
    @PutMapping("/update-admin/{id}")
    public ResponseEntity<?> updateAdmin(@PathVariable Long id, @RequestBody Users adminDetails, Principal principal, HttpServletRequest request) {
        Optional<Users> userOpt = userRepo.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Users existingUser = userOpt.get();

        // Prevent modification of default SUPER_ADMIN pavan to prevent lockout/security bypasses
        if ("pavan".equalsIgnoreCase(existingUser.getUsername())) {
            if (adminDetails.getRole() != null && adminDetails.getRole() != Role.SUPER_ADMIN) {
                return ResponseEntity.badRequest().body("Default SUPER_ADMIN 'pavan' role cannot be modified");
            }
        }

        // Update username if provided
        if (adminDetails.getUsername() != null && !adminDetails.getUsername().trim().isEmpty()) {
            if (!existingUser.getUsername().equals(adminDetails.getUsername())) {
                if (userRepo.findByUsername(adminDetails.getUsername()) != null) {
                    return ResponseEntity.badRequest().body("Username already exists");
                }
                existingUser.setUsername(adminDetails.getUsername());
            }
        }

        // Update password if provided (properly BCrypted)
        if (adminDetails.getPassword() != null && !adminDetails.getPassword().trim().isEmpty()) {
            existingUser.setPassword(passwordEncoder.encode(adminDetails.getPassword()));
        }

        // Update role if provided
        if (adminDetails.getRole() != null) {
            existingUser.setRole(adminDetails.getRole());
        }

        if (adminDetails.getName() != null) existingUser.setName(adminDetails.getName());
        if (adminDetails.getEmail() != null) existingUser.setEmail(adminDetails.getEmail());
        if (adminDetails.getConferenceId() != null) existingUser.setConferenceId(adminDetails.getConferenceId());
        // forcePasswordChange might be toggled by Super Admin to force reset
        if (adminDetails.isForcePasswordChange()) existingUser.setForcePasswordChange(true);

        Users updated = userRepo.save(existingUser);

        // Audit Logging
        String updater = principal != null ? principal.getName() : "system";
        String ip = request.getRemoteAddr();
        activityLogService.logActivity(updater, "UPDATE_ADMIN", 
            "Updated admin account: " + updated.getUsername() + " with role: " + updated.getRole(), ip);

        return ResponseEntity.ok(updated);
    }

    // DELETE /api/admin/delete-admin/{id}
    @DeleteMapping("/delete-admin/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Long id, Principal principal, HttpServletRequest request) {
        Optional<Users> userOpt = userRepo.findById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Users target = userOpt.get();

        // Prevent deleting default SUPER_ADMIN pavan
        if ("pavan".equalsIgnoreCase(target.getUsername())) {
            return ResponseEntity.badRequest().body("Default SUPER_ADMIN 'pavan' cannot be deleted");
        }

        userRepo.delete(target);

        // Audit Logging
        String deleter = principal != null ? principal.getName() : "system";
        String ip = request.getRemoteAddr();
        activityLogService.logActivity(deleter, "DELETE_ADMIN", 
            "Deleted admin account: " + target.getUsername(), ip);

        return ResponseEntity.ok(Map.of("message", "Admin deleted successfully"));
    }

    // GET /api/admin/admins
    @GetMapping("/admins")
    public ResponseEntity<List<Users>> getAllAdmins() {
        return ResponseEntity.ok(userRepo.findAll());
    }
}
