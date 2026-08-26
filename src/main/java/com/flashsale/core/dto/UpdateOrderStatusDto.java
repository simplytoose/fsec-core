package com.flashsale.core.dto;

import com.flashsale.core.domain.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateOrderStatusDto(
    @NotNull(message = "Status is required")
    OrderStatus status
) {}
