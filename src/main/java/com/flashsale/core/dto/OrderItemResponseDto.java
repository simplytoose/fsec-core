package com.flashsale.core.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record OrderItemResponseDto(
    UUID id,
    UUID productId,
    String productTitle,
    Integer quantity,
    BigDecimal priceAtPurchase
) {}
