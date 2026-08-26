package com.flashsale.core.dto;

import com.flashsale.core.domain.enums.OrderStatus;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

public record OrderResponseDto(
    UUID id,
    UUID userId,
    OrderStatus status,
    BigDecimal totalAmount,
    String shippingAddress,
    String paymentMethod,
    List<OrderItemResponseDto> items,
    OffsetDateTime createdAt
) {}
