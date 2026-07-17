package com.endeavor.service;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import org.jspecify.annotations.Nullable;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import com.endeavor.entity.Users;

public class principal implements UserDetails {
	
	private final Users user;
	
	public principal(Users user)
	{
		this.user=user;
	}
	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		if (user.getRole() != null) {
			return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
		}
		return List.of(new SimpleGrantedAuthority("ROLE_USER"));
	}

	@Override
	public @Nullable String getPassword() {
	
		return user.getPassword();
	}

	@Override
	public String getUsername() {
		return user.getUsername();
	}

	public Long getConferenceId() {
		return user.getConferenceId();
	}

	public String getRoleName() {
		return user.getRole() != null ? user.getRole().name() : "USER";
	}
	
}
