package com.flashsale.core.controller;

import com.flashsale.core.dto.CreateProductDto;
import com.flashsale.core.dto.ProductResponseDto;
import com.flashsale.core.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponseDto createProduct(@Valid @RequestBody CreateProductDto dto) {
        return productService.createProduct(dto);
    }

    @GetMapping("/{id}")
    public ProductResponseDto getProduct(@PathVariable UUID id) {
        return productService.getProductById(id);
    }

    @GetMapping
    public Page<ProductResponseDto> getProducts(Pageable pageable) {
        return productService.getAllProducts(pageable);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ProductResponseDto updateProduct(@PathVariable UUID id, @Valid @RequestBody CreateProductDto dto) {
        return productService.updateProduct(id, dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(@PathVariable UUID id) {
        productService.deleteProduct(id);
    }
}
