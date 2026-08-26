import React, { useState } from 'react';
import { useCart } from '../CartContext';
import { useNavigate } from 'react-router-dom';
import { createOrder } from '../api';
import { useAuth } from '../AuthContext';
import { CreditCard, Truck } from 'lucide-react';

const Checkout: React.FC = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('CREDIT_CARD');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await createOrder({
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress,
        paymentMethod
      });
      
      clearCart();
      navigate('/my-orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to place order. High traffic or out of stock.');
      setLoading(false);
    }
  };

  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Checkout</h2>
      </div>

      <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '30px' }}>
        <div className="admin-card">
          <h3>Shipping & Payment</h3>
          {error && <div className="notification error" style={{ position: 'relative', transform: 'none', marginBottom: '20px', animation: 'none' }}>{error}</div>}
          
          <form onSubmit={handlePlaceOrder} className="auth-form" style={{ marginTop: '20px' }}>
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Truck size={18} /> Shipping Address</label>
              <textarea 
                value={shippingAddress} 
                onChange={e => setShippingAddress(e.target.value)} 
                required 
                style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }} 
                rows={3}
                placeholder="123 Gaming Street, NY 10001"
              ></textarea>
            </div>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCard size={18} /> Payment Method</label>
              <select 
                value={paymentMethod} 
                onChange={e => setPaymentMethod(e.target.value)}
                style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }}
              >
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="PAYPAL">PayPal</option>
                <option value="STRIPE">Stripe</option>
              </select>
            </div>

            <button type="submit" className="buy-btn auth-submit" disabled={loading} style={{ marginTop: '30px' }}>
              {loading ? 'Processing...' : `Pay $${cartTotal.toFixed(2)} & Place Order`}
            </button>
          </form>
        </div>

        <div className="admin-card" style={{ height: 'fit-content' }}>
          <h3>Order Items</h3>
          <div style={{ margin: '20px 0', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
            {cart.map(item => (
              <div key={item.product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>{item.quantity}x</span>
                  <span>{item.product.title}</span>
                </div>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px', fontSize: '1.2rem', fontWeight: 'bold' }}>
              <span>Total</span>
              <span style={{ color: '#10b981' }}>${cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Checkout;
