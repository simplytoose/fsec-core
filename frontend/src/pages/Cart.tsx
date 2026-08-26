import React from 'react';
import { useCart } from '../CartContext';
import { Trash2, Plus, Minus, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Your Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <ShoppingCart size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/')} className="buy-btn" style={{ marginTop: '20px', display: 'inline-flex' }}>Start Shopping</button>
        </div>
      ) : (
        <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
          <div className="cart-items">
            {cart.map(item => (
              <div key={item.product.id} className="order-card" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '15px' }}>
                {item.product.imageUrl ? (
                  <img src={item.product.imageUrl} alt={item.product.title} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '80px', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>No Image</span>
                  </div>
                )}
                <div style={{ flex: 1 }}>
                  <h4 style={{ margin: '0 0 5px 0' }}>{item.product.title}</h4>
                  <p style={{ margin: 0, color: '#10b981', fontWeight: 'bold' }}>${item.product.price.toFixed(2)}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: '8px' }}>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }}>
                    <Minus size={16} />
                  </button>
                  <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: '5px' }} disabled={item.quantity >= item.product.stock}>
                    <Plus size={16} />
                  </button>
                </div>
                <button onClick={() => removeFromCart(item.product.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '10px' }}>
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="admin-card" style={{ height: 'fit-content' }}>
            <h3>Order Summary</h3>
            <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span>Shipping</span>
                <span>Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total</span>
                <span style={{ color: '#10b981' }}>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="buy-btn" style={{ width: '100%', display: 'block', textAlign: 'center' }}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default Cart;
