package com.flashsale.core.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class ProductResponseDto {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private Long version;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
