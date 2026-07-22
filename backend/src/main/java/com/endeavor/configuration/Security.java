package com.endeavor.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.endeavor.filter.JWTFilter;

import java.util.Arrays;

@Configuration
public class Security {

    @Autowired
    private JWTFilter jwtFilter;

    @Autowired
    private UserDetailsService userDetailsService;

    @Bean
    public SecurityFilterChain chain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults())
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        // PUBLIC APIs
                        .requestMatchers(
                                "/auth/**",
                                "/error",
                                "/errors",

                                "/api/speakers/**",
                                "/api/advisory-board/**",
                                "/api/agenda/**",
                                "/api/tracks/**",
                                "/api/sessions/**",
                                "/api/contact/**",
                                "/api/brochure/**",
                                "/api/abstracts/**",
                                "/api/register/**",

                                "/api/conference-details/**",
                                "/api/conferences/**",
                                "/api/sponsors/**",
                                "/api/hero/**",
                                "/api/statistics/**",
                                "/api/trust-badges/**",
                                "/api/homepage-dynamic-data/**",
                                "/api/info-updates/**",
                                "/api/suggest-speaker/**",
                                "/api/committee/**",
                                "/api/venue/**",
                                "/api/gallery/**",
                                "/api/conference-pages/**",
                                "/api/conference-sections/**",
                                "/api/navbar-menus/**",
                                "/api/webinars/**",
                                "/api/about/**",
                                "/api/navigation/**",

                                "/api/speaker-categories/**",
                                "/api/program-categories/**",
                                "/api/footer/**",
                                "/api/footer",

                                "/uploads/**")
                        .permitAll()

                        // ADMIN
                        .requestMatchers(
                                "/api/admin/create-admin",
                                "/api/admin/update-admin/**",
                                "/api/admin/delete-admin/**",
                                "/api/admin/admins") 
                        .hasRole("SUPER_ADMIN")

                        .requestMatchers("/api/admin/**")
                        .hasAnyRole("SUPER_ADMIN", "ADMIN", "CONFERENCE_ADMIN")

                        // everything else
                        .anyRequest()
                        .authenticated());

        http.formLogin(form -> form.disable());
        http.httpBasic(basic -> basic.disable());

        http.exceptionHandling(exception -> exception

                .authenticationEntryPoint(
                        (request, response, e) -> {
                            response.setStatus(401);
                            response.getWriter()
                                    .write("Unauthorized");
                        })

                .accessDeniedHandler(
                        (request, response, e) -> {
                            response.setStatus(403);
                            response.getWriter()
                                    .write("Forbidden");
                        }));

        http.addFilterBefore(
                jwtFilter,
                UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOriginPatterns(
                Arrays.asList(
                        "http://51.21.159.47",
                        "http://51.21.159.47:*",
                        "https://51.21.159.47",
                        "https://51.21.159.47:*",
                        "http://localhost",
                        "http://localhost:*",
                        "http://127.0.0.1",
                        "http://127.0.0.1:*",
                        "http://*.intelevoresearch.org",
                        "http://*.intelevoresearch.org:*",
                        "https://*.intelevoresearch.org",
                        "https://*.intelevoresearch.org:*",
                        "http://intelevoresearch.org",
                        "http://intelevoresearch.org:*",
                        "https://intelevoresearch.org",
                        "https://intelevoresearch.org:*",
                        "https://www.intelevoresearch.org",
                        "https://www.intelevoresearch.org:*"));

        config.setAllowedMethods(
                Arrays.asList(
                        "GET",
                        "POST",
                        "PUT",
                        "DELETE",
                        "OPTIONS"));

        config.setAllowedHeaders(
                Arrays.asList(
                        "Authorization",
                        "Content-Type",
                        "X-Conference-Slug"));

        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                config);

        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {

        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authprovider() {

        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(
                userDetailsService);

        provider.setPasswordEncoder(
                passwordEncoder());

        return provider;
    }

    @Bean
    public AuthenticationManager authManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public org.springframework.boot.CommandLineRunner initDb(org.springframework.jdbc.core.JdbcTemplate jdbcTemplate, com.endeavor.repo.UserRepo userRepo, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        return args -> {
            try {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(255)");
                System.out.println(">>> DATABASE ROLE COLUMN EXPANDED SUCCESSFULLY <<<");
            } catch (Exception e) {
                System.out.println(">>> DATABASE FIX ERROR: " + e.getMessage());
            }

            // Create a test Conference Admin user for verification
            try {
                if (userRepo.findByUsername("testadmin") == null) {
                    com.endeavor.entity.Users testUser = new com.endeavor.entity.Users();
                    testUser.setUsername("testadmin");
                    testUser.setPassword(passwordEncoder.encode("testpass123"));
                    testUser.setRole(com.endeavor.entity.Role.CONFERENCE_ADMIN);
                    testUser.setName("Test Admin");
                    testUser.setEmail("testadmin@intelevo.org");
                    // Assign to the first available conference
                    Long confId = jdbcTemplate.queryForObject("SELECT id FROM conference_details LIMIT 1", Long.class);
                    if (confId != null) {
                        testUser.setConferenceId(confId);
                        userRepo.save(testUser);
                        System.out.println(">>> TEST CONFERENCE ADMIN CREATED: testadmin / testpass123 (ConfID: " + confId + ") <<<");
                    }
                }
            } catch (Exception e) {
                System.out.println(">>> FAILED TO CREATE TEST ADMIN: " + e.getMessage());
            }
        };
    }

}
