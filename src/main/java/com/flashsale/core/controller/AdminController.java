package com.flashsale.core.controller;

import lombok.RequiredArgsConstructor;
import org.redisson.api.RedissonClient;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final JdbcTemplate jdbcTemplate;
    private final RedissonClient redissonClient;

    @GetMapping("/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        try {
            jdbcTemplate.execute("SELECT 1");
            status.put("database", "UP");
        } catch (Exception e) {
            status.put("database", "DOWN");
        }

        try {
            boolean isRedisUp = redissonClient.getNodesGroup().pingAll();
            status.put("redis", isRedisUp ? "UP" : "DOWN");
        } catch (Exception e) {
            status.put("redis", "DOWN");
        }

        status.put("overall", "UP".equals(status.get("database")) && "UP".equals(status.get("redis")) ? "UP" : "DOWN");

        return ResponseEntity.ok(status);
    }
}
