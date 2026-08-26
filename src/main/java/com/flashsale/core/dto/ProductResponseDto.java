package com.flashsale.core.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

public record ProductResponseDto(
    UUID id,
    String title,
    String description,
    String imageUrl,
    String category,
    BigDecimal price,
    Integer stock,
    Long version,
    OffsetDateTime createdAt,
    OffsetDateTime updatedAt
) {}
