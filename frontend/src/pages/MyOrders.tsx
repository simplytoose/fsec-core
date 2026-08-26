import React, { useEffect, useState } from 'react';
import { getMyOrders } from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  shippingAddress?: string;
  items?: Array<{
    id: string;
    productTitle: string;
    quantity: number;
    priceAtPurchase: number;
  }>;
}

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(data);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, navigate]);

  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">My Orders</h2>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="loader large"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Package size={48} style={{ opacity: 0.5, marginBottom: '16px' }} />
          <p>You haven't placed any orders yet.</p>
          <button onClick={() => navigate('/')} className="buy-btn" style={{ marginTop: '20px', display: 'inline-flex' }}>Start Shopping</button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">Order #{order.id.substring(0, 8)}</span>
                <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-details">
                <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                <p>Shipping Address: {order.shippingAddress || 'Digital / Default'}</p>
                <div style={{ margin: '15px 0', padding: '10px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>Items:</h4>
                  {order.items && order.items.map((item: any) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px', fontSize: '0.9rem' }}>
                      <span>{item.quantity}x {item.productTitle}</span>
                      <span>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <p className="order-total" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                  Total: ${order.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
};

export default MyOrders;
