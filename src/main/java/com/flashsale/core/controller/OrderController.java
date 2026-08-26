package com.flashsale.core.controller;

import com.flashsale.core.domain.entity.User;
import com.flashsale.core.dto.CreateOrderDto;
import com.flashsale.core.dto.OrderResponseDto;
import com.flashsale.core.service.OrderService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import com.flashsale.core.annotation.Idempotent;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @Idempotent
    public ResponseEntity<OrderResponseDto> createOrder(
            @Valid @RequestBody CreateOrderDto dto,
            @AuthenticationPrincipal User user) {
        OrderResponseDto response = orderService.createOrder(dto, user.getId());
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(orderService.getMyOrders(user.getId()));
    }

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<OrderResponseDto>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    @PatchMapping("/{id}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponseDto> updateOrderStatus(
            @PathVariable java.util.UUID id,
            @Valid @RequestBody com.flashsale.core.dto.UpdateOrderStatusDto dto) {
        return ResponseEntity.ok(orderService.updateOrderStatus(id, dto.status()));
    }
}
