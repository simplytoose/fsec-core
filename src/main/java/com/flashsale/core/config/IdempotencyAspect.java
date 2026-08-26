package com.flashsale.core.config;

import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;
import java.util.concurrent.TimeUnit;

@Aspect
@Component
public class IdempotencyAspect {

    private final RedissonClient redissonClient;

    public IdempotencyAspect(RedissonClient redissonClient) {
        this.redissonClient = redissonClient;
    }

    @Around("@annotation(com.flashsale.core.annotation.Idempotent)")
    public Object checkIdempotency(ProceedingJoinPoint joinPoint) throws Throwable {
        HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
        String idempotencyKey = request.getHeader("Idempotency-Key");

        if (idempotencyKey == null || idempotencyKey.trim().isEmpty()) {
            return joinPoint.proceed(); // Or throw error if you strictly require it
        }

        String redisKey = "idempotency:" + idempotencyKey;
        RBucket<String> bucket = redissonClient.getBucket(redisKey);

        boolean isNew = bucket.setIfAbsent("PROCESSING", java.time.Duration.ofHours(24));

        if (!isNew) {
            throw new RuntimeException("Duplicate request detected for idempotency key: " + idempotencyKey);
        }

        try {
            Object result = joinPoint.proceed();
            bucket.set("DONE", java.time.Duration.ofHours(24));
            return result;
        } catch (Throwable e) {
            bucket.delete(); // Allow retry on failure
            throw e;
        }
    }
}
