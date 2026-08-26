import React, { useState } from 'react';
import type { Product } from '../api';
import { ShoppingBag, AlertTriangle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onBuy: (productId: string) => Promise<void>;
  maxStock?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onBuy, maxStock = 20 }) => {
  const [isBuying, setIsBuying] = useState(false);

  const handleBuy = async () => {
    setIsBuying(true);
    await onBuy(product.id);
    setIsBuying(false);
  };

  const stockPercentage = Math.min(100, Math.max(0, (product.stock / maxStock) * 100));
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOut = product.stock <= 0;

  return (
    <div className={`product-card ${isOut ? 'sold-out' : ''}`}>
      {product.imageUrl ? (
        <div className="product-image-container" style={{ width: '100%', height: '200px', overflow: 'hidden' }}>
          <img src={product.imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {isOut && <div className="sold-out-badge">SOLD OUT</div>}
        </div>
      ) : (
        <div className="product-image-placeholder">
          {isOut && <div className="sold-out-badge">SOLD OUT</div>}
          <span className="placeholder-text">FlashGear Item</span>
        </div>
      )}
      
      <div className="product-info">
        <h3>{product.title}</h3>
        <p className="product-desc">{product.description}</p>
        
        <div className="stock-container">
          <div className="stock-info">
            <span className="stock-label">
              {isOut ? 'Sold Out' : isLowStock ? 'Almost Gone!' : 'Available'}
            </span>
            <span className="stock-count">{product.stock} left</span>
          </div>
          <div className="progress-bar-bg">
            <div 
              className={`progress-bar-fill ${isLowStock ? 'danger' : ''}`}
              style={{ width: `${stockPercentage}%` }}
            ></div>
          </div>
          {isLowStock && (
            <div className="low-stock-warning">
              <AlertTriangle size={14} /> High demand
            </div>
          )}
        </div>
        
        <div className="product-footer">
          <span className="price">${product.price.toFixed(2)}</span>
          <button 
            className={`buy-btn ${isBuying ? 'loading' : ''}`}
            onClick={handleBuy}
            disabled={isOut || isBuying}
          >
            {isBuying ? (
              <span className="loader"></span>
            ) : (
              <>
                <ShoppingBag size={18} />
                <span>{isOut ? 'Unavailable' : 'Add to Cart'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
