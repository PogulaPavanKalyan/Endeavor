package com.endeavor.service;

import java.util.Base64;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.endeavor.entity.Users;
import com.endeavor.repo.UserRepo;

import ch.qos.logback.core.subst.Token;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

@Service
public class jwtservice {
	@Autowired
	private UserRepo userRepo;
	
	String Key="";
	public jwtservice() {
		KeyGenerator keyGen;
		
		try
		{
			keyGen=KeyGenerator.getInstance("HmacSHA256");
			SecretKey sKey=keyGen.generateKey();
			Key=Base64.getEncoder().encodeToString(sKey.getEncoded());
		}
		catch (Exception e) {
			
		}
	}
	

	public String generateToken(String username) {
		Users u=userRepo.findByUsername(username);
		Map<String, Object>claims=new HashMap<String, Object>();
		
		return Jwts.builder()
				.claims()
				.add(claims)
				.subject(username)
				.issuedAt(new Date(System.currentTimeMillis()))
				.expiration(new Date(System.currentTimeMillis() + 6 * 60 * 60 * 1000))
				.and()
				.signWith(getKey())
				.compact();
		
	}

	private SecretKey getKey() {
		byte[] keyByte=Decoders.BASE64.decode(Key);
		return Keys.hmacShaKeyFor(keyByte);	
	}


	public String extractUsername(String token) {
		
		return extractClaims(token,Claims::getSubject);
	}
	
	
   private <T>T  extractClaims(String token, Function<Claims,T>claimResolver) {
		
	   final Claims claims=extractClaims(token);
		return claimResolver.apply(claims);
	}

	private Claims extractClaims(String token) {
	
	return Jwts.parser().verifyWith(getKey()).build().parseSignedClaims(token).getPayload();
}


	public  boolean validate(String token, UserDetails userDetails) {
		
		
		final String username=extractUsername(token);
		return (username.equals(userDetails.getUsername())&& !  isExpried(token));
	}
	
	
  private boolean isExpried(String token) {
	  return extractExp(token).before(new Date());
	  
  }


  private Date extractExp(String token) {
	
	return extractClaims(token,Claims::getExpiration);
  }
	

}
