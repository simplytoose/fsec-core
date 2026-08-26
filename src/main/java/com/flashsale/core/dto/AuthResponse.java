package com.flashsale.core.dto;

import com.flashsale.core.domain.enums.Role;
import java.util.UUID;

public record AuthResponse(
    String token,
    UUID userId,
    String email,
    Role role
) {}
