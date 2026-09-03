package com.flashsale.core.service;

import com.flashsale.core.domain.entity.Product;
import com.flashsale.core.dto.CreateProductDto;
import com.flashsale.core.dto.ProductResponseDto;
import com.flashsale.core.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.redisson.api.RBucket;
import org.redisson.api.RedissonClient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final RedissonClient redissonClient;

    private final Map<String, CachedPage> productPageCache = new ConcurrentHashMap<>();
    private final Map<UUID, ProductResponseDto> productCache = new ConcurrentHashMap<>();

    private record CachedPage(Page<ProductResponseDto> page, long expireAt) {}

    private void clearCache() {
        productPageCache.clear();
        productCache.clear();
    }

    @Transactional
    public ProductResponseDto createProduct(CreateProductDto dto) {
        Product product = Product.builder()
                .title(dto.title())
                .description(dto.description())
                .imageUrl(dto.imageUrl())
                .category(dto.category())
                .price(dto.price())
                .stock(dto.stock())
                .build();
        
        Product savedProduct = productRepository.save(product);
        
        RBucket<Integer> stockBucket = redissonClient.getBucket("product:stock:" + savedProduct.getId());
        stockBucket.set(savedProduct.getStock());
        
        clearCache();
        return mapToDto(savedProduct);
    }

    @Transactional(readOnly = true)
    public ProductResponseDto getProductById(UUID id) {
        ProductResponseDto cached = productCache.get(id);
        if (cached != null) {
            return cached;
        }
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        ProductResponseDto dto = mapToDto(product);
        productCache.put(id, dto);
        return dto;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponseDto> getAllProducts(Pageable pageable) {
        String cacheKey = pageable.getPageNumber() + ":" + pageable.getPageSize() + ":" + pageable.getSort();
        long now = System.currentTimeMillis();
        CachedPage cached = productPageCache.get(cacheKey);
        if (cached != null && cached.expireAt() > now) {
            return cached.page();
        }

        Page<ProductResponseDto> page = productRepository.findAll(pageable).map(this::mapToDto);
        productPageCache.put(cacheKey, new CachedPage(page, now + 5000));
        for (ProductResponseDto p : page) {
            productCache.put(p.id(), p);
        }
        return page;
    }

    @Transactional
    public ProductResponseDto updateProduct(UUID id, CreateProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));

        product.setTitle(dto.title());
        product.setDescription(dto.description());
        product.setImageUrl(dto.imageUrl());
        product.setCategory(dto.category());
        product.setPrice(dto.price());
        
        // If stock is updated, update Redis too
        if (!product.getStock().equals(dto.stock())) {
            product.setStock(dto.stock());
            RBucket<Integer> stockBucket = redissonClient.getBucket("product:stock:" + product.getId());
            stockBucket.set(dto.stock());
        }

        Product savedProduct = productRepository.save(product);
        clearCache();
        return mapToDto(savedProduct);
    }

    @Transactional
    public void deleteProduct(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + id));
        
        // Delete from Redis
        redissonClient.getBucket("product:stock:" + id).delete();
        
        productRepository.delete(product);
        clearCache();
    }

    private ProductResponseDto mapToDto(Product product) {
        return new ProductResponseDto(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getImageUrl(),
                product.getCategory(),
                product.getPrice(),
                product.getStock(),
                product.getVersion(),
                product.getCreatedAt(),
                product.getUpdatedAt()
        );
    }
}
