package com.flashsale.core.dto;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CreateOrderDto(
    @NotNull(message = "Items cannot be null")
    List<CartItemDto> items,
    
    @NotNull(message = "Shipping address is required")
    String shippingAddress,
    
    @NotNull(message = "Payment method is required")
    String paymentMethod
) {}
