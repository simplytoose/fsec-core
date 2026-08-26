package com.flashsale.core.dto;

import com.flashsale.core.domain.enums.Role;
import java.util.UUID;

public record UserResponseDto(
    UUID id,
    String email,
    Role role
) {}
