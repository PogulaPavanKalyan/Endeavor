package com.endeavor.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static Long getTenantConferenceId(Long requestedId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof principal) {
            principal userPrincipal = (principal) auth.getPrincipal();
            if ("CONFERENCE_ADMIN".equals(userPrincipal.getRoleName())) {
                // Force the user's assigned conference ID
                return userPrincipal.getConferenceId();
            }
        }
        // SUPER_ADMIN can request a specific one, or get all if null
        return requestedId;
    }
    
    public static boolean isConferenceAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof principal) {
            principal userPrincipal = (principal) auth.getPrincipal();
            return "CONFERENCE_ADMIN".equals(userPrincipal.getRoleName());
        }
        return false;
    }

    public static Long getTenantConferenceId() {
        return getTenantConferenceId(null);
    }
}
