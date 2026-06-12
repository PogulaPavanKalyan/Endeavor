package com.endeavor.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.endeavor.dto.LoginDTO;
import com.endeavor.entity.Users;
import com.endeavor.repo.UserRepo;

@org.springframework.stereotype.Service
public class Service {
	
	@Autowired
	private jwtservice jwtservice;
	
	@Autowired
	private UserRepo uRepo;
	
	@Autowired
	private AuthenticationManager authManager;

	@Autowired
	private PasswordEncoder passwordEncoder;
	
	public String verify(LoginDTO login) {
		Authentication auth=authManager.authenticate(new UsernamePasswordAuthenticationToken(login.getUsername(),login.getPassword()));
		
		if(auth !=null)
		{
			return jwtservice.generateToken(login.getUsername());
		}
		return null;
	}

	public Users signUp(Users user) {
		if (uRepo.findByUsername(user.getUsername()) != null) {
			throw new IllegalArgumentException("Username already exists");
		}
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		return uRepo.save(user);
	}
}
