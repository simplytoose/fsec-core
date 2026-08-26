package com.flashsale.core.controller;

import com.flashsale.core.dto.AuthResponse;
import com.flashsale.core.dto.LoginRequest;
import com.flashsale.core.dto.RegisterRequest;
import com.flashsale.core.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public ResponseEntity<com.flashsale.core.dto.UserResponseDto> getMe(@org.springframework.security.core.annotation.AuthenticationPrincipal com.flashsale.core.domain.entity.User user) {
        return ResponseEntity.ok(new com.flashsale.core.dto.UserResponseDto(
                user.getId(),
                user.getEmail(),
                user.getRole()
        ));
    }
}
