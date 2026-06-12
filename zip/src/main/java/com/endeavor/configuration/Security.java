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
import java.util.Collections;

@Configuration
public class Security {

	@Autowired
	private JWTFilter jwtFilter;

	@Autowired
	private UserDetailsService userDetailsService;

	@Bean
	public SecurityFilterChain chain(HttpSecurity http) throws Exception {
		http.cors(Customizer.withDefaults());
		http.authorizeHttpRequests(req -> req.requestMatchers(
				"/errors",
				"/error",
				"/auth/**",
				"/api/speakers",
				"/api/sessions/**",
				"/api/contact",
				"/api/brochure",
				"/api/abstracts",
				"/api/register/**",
				"/api/conference-details",
				"/api/conferences",
				"/api/sponsors",
				"/api/hero",
				"/api/statistics",
				"/api/trust-badges",
				"/api/homepage-dynamic-data",
				"/api/info-updates",
				"/api/suggest-speaker",
				"/api/committee",
				"/api/venue",
				"/api/gallery",
				"/api/conference-pages",
				"/api/webinars",
				"/api/webinars/**",
				"/uploads/**"
			).permitAll()
			.requestMatchers("/api/admin/**").authenticated()
			.anyRequest().authenticated());
		
		http.sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
		http.csrf(c -> c.disable());
		http.formLogin(f -> f.disable());
		http.httpBasic(Customizer.withDefaults());
		http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
		return http.build();
	}

	@Bean
	public CorsConfigurationSource corsConfigurationSource() {
		CorsConfiguration configuration = new CorsConfiguration();
		configuration.setAllowedOriginPatterns(Arrays.asList(
			"http://localhost:*",
			"http://127.0.0.1:*",
			"http://*.localhost:*",
			"http://*.127.0.0.1:*"
		));
		configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
		configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Conference-Slug"));
		configuration.setAllowCredentials(true);
		UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
		source.registerCorsConfiguration("/**", configuration);
		return source;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}

	@Bean
	public AuthenticationProvider authprovider() {
		DaoAuthenticationProvider pro = new DaoAuthenticationProvider(userDetailsService);
		pro.setPasswordEncoder(passwordEncoder());
		return pro;
	}

	@Bean
	public AuthenticationManager authManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}
}
