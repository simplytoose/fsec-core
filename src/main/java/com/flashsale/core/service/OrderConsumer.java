package com.flashsale.core.service;

import com.flashsale.core.domain.entity.Order;
import com.flashsale.core.domain.entity.OrderItem;
import com.flashsale.core.dto.OrderEvent;
import com.flashsale.core.repository.OrderRepository;
import com.flashsale.core.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderConsumer {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    @RabbitListener(queues = "${flashsale.rabbitmq.queue}")
    @Transactional
    public void consumeOrderEvent(OrderEvent orderEvent) {
        log.info("Received order event for user: {}", orderEvent.getUserId());
        
        try {
            Order order = Order.builder()
                    .userId(orderEvent.getUserId())
                    .status(orderEvent.getStatus())
                    .shippingAddress(orderEvent.getShippingAddress())
                    .paymentMethod(orderEvent.getPaymentMethod())
                    .totalAmount(orderEvent.getTotalAmount())
                    .build();

            if (orderEvent.getItems() != null) {
                orderEvent.getItems().forEach(itemEvent -> {
                    OrderItem orderItem = OrderItem.builder()
                            .product(productRepository.getReferenceById(itemEvent.getProductId()))
                            .quantity(itemEvent.getQuantity())
                            .priceAtPurchase(itemEvent.getPrice())
                            .build();
                    order.addItem(orderItem);
                });
            }

            orderRepository.save(order);
            log.info("Order successfully saved for user: {}", order.getUserId());
        } catch (Exception e) {
            log.error("Failed to process order event for user: {}", orderEvent.getUserId(), e);
            throw e; // throw exception to potentially retry or send to DLQ
        }
    }
}
