package com.flashsale.core.config;

import com.flashsale.core.domain.entity.Product;
import com.flashsale.core.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class RedisSyncRunner implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final RedissonClient redissonClient;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        log.info("Starting synchronization of product stock from DB to Redis...");
        List<Product> products = productRepository.findAll();
        for (Product product : products) {
            String key = "product:stock:" + product.getId();
            RBucket<Integer> bucket = redissonClient.getBucket(key);
            bucket.set(product.getStock());
            log.info("Synced stock for product {}: {}", product.getId(), product.getStock());
        }
        log.info("Completed synchronization of product stock to Redis.");
    }
}
