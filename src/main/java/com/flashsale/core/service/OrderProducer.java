package com.flashsale.core.service;

import com.flashsale.core.dto.OrderEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderProducer {

    private final RabbitTemplate rabbitTemplate;

    @Value("${flashsale.rabbitmq.exchange}")
    private String exchange;

    @Value("${flashsale.rabbitmq.routing-key}")
    private String routingKey;

    public void publishOrderEvent(OrderEvent orderEvent) {
        log.info("Publishing order event for user: {}", orderEvent.getUserId());
        rabbitTemplate.convertAndSend(exchange, routingKey, orderEvent);
    }
}
