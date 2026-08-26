package com.flashsale.core.service;

import com.flashsale.core.domain.entity.User;
import com.flashsale.core.domain.enums.Role;
import com.flashsale.core.dto.AuthResponse;
import com.flashsale.core.dto.LoginRequest;
import com.flashsale.core.dto.RegisterRequest;
import com.flashsale.core.repository.UserRepository;
import com.flashsale.core.exception.EmailAlreadyExistsException;
import com.flashsale.core.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.email()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already in use");
        }

        var user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .role(Role.USER)
                .build();
        
        userRepository.save(user);
        var jwtToken = jwtService.generateToken(user);
        
        return new AuthResponse(
                jwtToken,
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.email(),
                        request.password()
                )
        );
        
        var user = userRepository.findByEmail(request.email())
                .orElseThrow();
                
        var jwtToken = jwtService.generateToken(user);
        
        return new AuthResponse(
                jwtToken,
                user.getId(),
                user.getEmail(),
                user.getRole()
        );
    }
}
