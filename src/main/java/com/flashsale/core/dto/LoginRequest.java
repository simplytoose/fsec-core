package com.flashsale.core.dto;

public record LoginRequest(
    String email,
    String password
) {}
