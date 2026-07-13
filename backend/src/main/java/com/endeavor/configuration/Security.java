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
                        .hasAnyRole("SUPER_ADMIN", "ADMIN")

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

}
