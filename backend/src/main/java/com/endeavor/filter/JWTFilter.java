package com.endeavor.filter;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationContext;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.web.filter.OncePerRequestFilter;

import com.endeavor.service.MyUserDetailsService;
import com.endeavor.service.jwtservice;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Service
public class JWTFilter extends OncePerRequestFilter {

    @Autowired
    private jwtservice jwtservices;

    @Autowired
    private ApplicationContext context;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String path = request.getServletPath();

        // Skip authentication for public endpoints
        if (path.startsWith("/login") || path.startsWith("/getimage") || path.equals("/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = null;
        String authHeader = request.getHeader("Authorization");
        String username = null;

        // Check Authorization header first
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            token = authHeader.substring(7);
        } else {
            // Check Query Params for streaming media (like video streams)
            token = request.getParameter("token");
        }

        try {
            if(token != null) {
                username = jwtservices.extractUsername(token);
            }

            // Authenticate user
            if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                UserDetails userDetails =
                        context.getBean(MyUserDetailsService.class).loadUserByUsername(username);

                if (jwtservices.validate(token, userDetails)) {

                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    userDetails.getAuthorities()
                            );

                    authToken.setDetails(userDetails);

                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token is expired or invalid.
            // Log the exception if needed, but DO NOT stop the filter chain.
            // Allow Spring Security to decide if the endpoint needs authentication.
            System.out.println("JWT Token validation failed: " + e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
