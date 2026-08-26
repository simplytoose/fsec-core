package com.flashsale.core.service;

import com.flashsale.core.domain.entity.Order;
import com.flashsale.core.domain.entity.OrderItem;
import com.flashsale.core.domain.entity.Product;
import com.flashsale.core.domain.enums.OrderStatus;
import com.flashsale.core.dto.CartItemDto;
import com.flashsale.core.dto.CreateOrderDto;
import com.flashsale.core.dto.OrderItemResponseDto;
import com.flashsale.core.dto.OrderResponseDto;
import com.flashsale.core.exception.InsufficientStockException;
import com.flashsale.core.repository.OrderRepository;
import com.flashsale.core.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final RedissonClient redissonClient;

    public OrderResponseDto createOrder(CreateOrderDto dto, UUID userId) {
        if (dto.items() == null || dto.items().isEmpty()) {
            throw new IllegalArgumentException("Order must contain at least one item");
        }

        // Sort items by product ID to prevent distributed deadlocks
        List<CartItemDto> sortedItems = dto.items().stream()
                .sorted(Comparator.comparing(CartItemDto::productId))
                .toList();

        RLock[] locks = sortedItems.stream()
                .map(item -> redissonClient.getLock("product:lock:" + item.productId()))
                .toArray(RLock[]::new);

        RLock multiLock = redissonClient.getMultiLock(locks);
        boolean isLocked = false;

        try {
            // waitTime = 1000ms, leaseTime = 3000ms
            isLocked = multiLock.tryLock(1000, 3000, TimeUnit.MILLISECONDS);
            if (!isLocked) {
                throw new RuntimeException("System is busy, could not acquire locks for products");
            }

            // Verify all stocks before deducting
            for (CartItemDto item : sortedItems) {
                RBucket<Integer> stockBucket = redissonClient.getBucket("product:stock:" + item.productId());
                Integer currentStock = stockBucket.get();
                if (currentStock == null || currentStock < item.quantity()) {
                    throw new InsufficientStockException("Insufficient stock for product: " + item.productId());
                }
            }

            // Deduct stock in Redis
            for (CartItemDto item : sortedItems) {
                RBucket<Integer> stockBucket = redissonClient.getBucket("product:stock:" + item.productId());
                stockBucket.set(stockBucket.get() - item.quantity());
            }

            try {
                // Save to DB
                return saveOrderToDatabase(dto, userId);
            } catch (Exception e) {
                // Compensation: Rollback stock in Redis if DB save fails
                log.error("Failed to save order to database, rolling back Redis stock.", e);
                for (CartItemDto item : sortedItems) {
                    RBucket<Integer> stockBucket = redissonClient.getBucket("product:stock:" + item.productId());
                    Integer currentStock = stockBucket.get();
                    if (currentStock != null) {
                        stockBucket.set(currentStock + item.quantity());
                    }
                }
                throw new RuntimeException("Database error during order creation", e);
            }

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while trying to acquire lock", e);
        } finally {
            if (isLocked) {
                multiLock.unlock();
            }
        }
    }

    @Transactional
    protected OrderResponseDto saveOrderToDatabase(CreateOrderDto dto, UUID userId) {
        Order order = Order.builder()
                .userId(userId)
                .status(OrderStatus.PENDING)
                .shippingAddress(dto.shippingAddress())
                .paymentMethod(dto.paymentMethod())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItemDto itemDto : dto.items()) {
            Product product = productRepository.findById(itemDto.productId())
                    .orElseThrow(() -> new EntityNotFoundException("Product not found: " + itemDto.productId()));
            
            // Update product stock in DB
            product.setStock(product.getStock() - itemDto.quantity());
            productRepository.save(product);

            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemDto.quantity()));
            totalAmount = totalAmount.add(itemTotal);

            OrderItem item = OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.quantity())
                    .priceAtPurchase(product.getPrice())
                    .build();

            order.addItem(item);
        }

        order.setTotalAmount(totalAmount);
        Order savedOrder = orderRepository.save(order);

        return mapToOrderResponseDto(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getMyOrders(UUID userId) {
        return orderRepository.findByUserId(userId).stream()
                .map(this::mapToOrderResponseDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<OrderResponseDto> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(this::mapToOrderResponseDto)
                .toList();
    }

    @Transactional
    public OrderResponseDto updateOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Order not found with id: " + id));
        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);
        return mapToOrderResponseDto(savedOrder);
    }

    private OrderResponseDto mapToOrderResponseDto(Order order) {
        List<OrderItemResponseDto> items = order.getItems().stream()
                .map(item -> new OrderItemResponseDto(
                        item.getId(),
                        item.getProduct().getId(),
                        item.getProduct().getTitle(),
                        item.getQuantity(),
                        item.getPriceAtPurchase()
                ))
                .toList();

        return new OrderResponseDto(
                order.getId(),
                order.getUserId(),
                order.getStatus(),
                order.getTotalAmount(),
                order.getShippingAddress(),
                order.getPaymentMethod(),
                items,
                order.getCreatedAt()
        );
    }
}
