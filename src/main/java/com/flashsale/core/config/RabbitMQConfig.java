package com.flashsale.core.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${flashsale.rabbitmq.queue}")
    private String queueName;

    @Value("${flashsale.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${flashsale.rabbitmq.routing-key}")
    private String routingKey;

    @Bean
    public Queue orderQueue() {
        return new Queue(queueName, true);
    }

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Binding orderBinding(Queue orderQueue, DirectExchange orderExchange) {
        return BindingBuilder.bind(orderQueue).to(orderExchange).with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
