package org.f3.postalmanagement.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Exchange names
    public static final String ORDER_EXCHANGE = "order.exchange";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";

    // Queue names
    public static final String NEW_ORDER_QUEUE = "order.new.queue";
    public static final String ORDER_ASSIGNED_QUEUE = "order.assigned.queue";
    public static final String STAFF_NOTIFICATION_QUEUE = "notification.staff.queue";
    public static final String SHIPPER_NOTIFICATION_QUEUE = "notification.shipper.queue";

    // Routing keys
    public static final String NEW_ORDER_ROUTING_KEY = "order.new";
    public static final String ORDER_ASSIGNED_ROUTING_KEY = "order.assigned";
    public static final String STAFF_NOTIFICATION_ROUTING_KEY = "notification.staff";
    public static final String SHIPPER_NOTIFICATION_ROUTING_KEY = "notification.shipper";

    // ==================== EXCHANGES ====================

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    // ==================== QUEUES ====================

    @Bean
    public Queue newOrderQueue() {
        return QueueBuilder.durable(NEW_ORDER_QUEUE).build();
    }

    @Bean
    public Queue orderAssignedQueue() {
        return QueueBuilder.durable(ORDER_ASSIGNED_QUEUE).build();
    }

    @Bean
    public Queue staffNotificationQueue() {
        return QueueBuilder.durable(STAFF_NOTIFICATION_QUEUE).build();
    }

    @Bean
    public Queue shipperNotificationQueue() {
        return QueueBuilder.durable(SHIPPER_NOTIFICATION_QUEUE).build();
    }

    // ==================== BINDINGS ====================

    @Bean
    public Binding newOrderBinding(Queue newOrderQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(newOrderQueue).to(orderExchange).with(NEW_ORDER_ROUTING_KEY);
    }

    @Bean
    public Binding orderAssignedBinding(Queue orderAssignedQueue, TopicExchange orderExchange) {
        return BindingBuilder.bind(orderAssignedQueue).to(orderExchange).with(ORDER_ASSIGNED_ROUTING_KEY);
    }

    @Bean
    public Binding staffNotificationBinding(Queue staffNotificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(staffNotificationQueue).to(notificationExchange).with(STAFF_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding shipperNotificationBinding(Queue shipperNotificationQueue, TopicExchange notificationExchange) {
        return BindingBuilder.bind(shipperNotificationQueue).to(notificationExchange).with(SHIPPER_NOTIFICATION_ROUTING_KEY);
    }

    // ==================== MESSAGE CONVERTER ====================

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
