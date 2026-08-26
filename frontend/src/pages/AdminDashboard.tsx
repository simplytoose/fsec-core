import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { ShieldAlert, Package, ShoppingCart, Activity, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getProducts, deleteProduct, getAllOrders, updateOrderStatus, getSystemStatus, type Product } from '../api';
import axios from '../api'; // use the configured axios instance

const AdminDashboard: React.FC = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'status'>('products');
  
  // State for tabs
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{text: string, type: 'success'|'error'} | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');

  useEffect(() => {
    if (isAdmin) {
      if (activeTab === 'products') fetchProducts();
      if (activeTab === 'orders') fetchOrders();
      if (activeTab === 'status') fetchSystemStatus();
    }
  }, [activeTab, isAdmin]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await getProducts(0, 100);
      if (data && data.content) {
        setProducts(data.content);
      } else if (Array.isArray(data)) {
         setProducts(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await getAllOrders();
      setOrders(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemStatus = async () => {
    setLoading(true);
    try {
      const data = await getSystemStatus();
      setSystemStatus(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    try {
      await axios.post('/v1/products', {
        title,
        description,
        imageUrl,
        category,
        price: parseFloat(price),
        stock: parseInt(stock, 10)
      });
      setMsg({ text: 'Product created successfully!', type: 'success' });
      setTitle('');
      setDescription('');
      setImageUrl('');
      setCategory('');
      setPrice('');
      setStock('');
      fetchProducts();
    } catch (err: any) {
      setMsg({ text: 'Failed to create product.', type: 'error' });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchProducts();
      } catch (err: any) {
        if (err.response?.status === 500 || err.response?.data?.message?.includes('foreign key')) {
          alert('Cannot delete this product because it has already been ordered by customers. Please mark it as out-of-stock instead.');
        } else {
          alert(err.response?.data?.message || 'Failed to delete product');
        }
      }
    }
  };

  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
    } catch (err) {
      alert('Failed to update order status');
    }
  };

  if (!isAdmin) {
    return (
      <div className="auth-container">
        <div className="auth-box" style={{ textAlign: 'center' }}>
          <ShieldAlert size={48} color="#ef4444" style={{ marginBottom: '16px' }} />
          <h2>Access Denied</h2>
          <p>You do not have permission to view this page.</p>
          <button onClick={() => navigate('/')} className="buy-btn" style={{ marginTop: '20px' }}>Go Home</button>
        </div>
      </div>
    );
  }

  return (
    <main className="main-content">
      <div className="section-header">
        <h2 className="section-title">Admin Dashboard</h2>
      </div>
      
      <div className="filter-tabs" style={{ marginBottom: '30px' }}>
        <button className={activeTab === 'products' ? 'active' : ''} onClick={() => setActiveTab('products')}>
          <Package size={18} style={{ marginRight: '8px' }} /> Products
        </button>
        <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
          <ShoppingCart size={18} style={{ marginRight: '8px' }} /> Orders
        </button>
        <button className={activeTab === 'status' ? 'active' : ''} onClick={() => setActiveTab('status')}>
          <Activity size={18} style={{ marginRight: '8px' }} /> System Status
        </button>
      </div>

      {msg && (
        <div className={`notification ${msg.type}`} style={{ position: 'relative', transform: 'none', marginBottom: '20px', animation: 'none' }}>
          {msg.text}
        </div>
      )}

      {loading && <div className="loader"></div>}

      {!loading && activeTab === 'products' && (
        <div className="admin-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '30px' }}>
          <div className="admin-card">
            <h3>Create New Product</h3>
            <form onSubmit={handleCreateProduct} className="auth-form" style={{ marginTop: '20px' }}>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <input type="text" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input type="text" value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} required style={{ width: '100%', padding: '12px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '12px', color: '#fff' }} rows={3}></textarea>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Price ($)</label>
                  <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Initial Stock</label>
                  <input type="number" value={stock} onChange={e => setStock(e.target.value)} required />
                </div>
              </div>
              <button type="submit" className="buy-btn auth-submit">Create Product</button>
            </form>
          </div>
          
          <div className="admin-card">
            <h3>Product Inventory</h3>
            <div className="orders-list" style={{ marginTop: '20px' }}>
              {products.map(product => (
                <div key={product.id} className="order-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: 0, color: '#fff' }}>{product.title}</h4>
                    <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)' }}>
                      Stock: {product.stock} | Price: ${product.price.toFixed(2)}
                    </p>
                  </div>
                  <button onClick={() => handleDeleteProduct(product.id)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
              {products.length === 0 && <p>No products found.</p>}
            </div>
          </div>
        </div>
      )}

      {!loading && activeTab === 'orders' && (
        <div className="admin-card">
          <h3>All Customer Orders</h3>
          <div className="orders-list" style={{ marginTop: '20px' }}>
            {orders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">Order #{order.id.substring(0, 8)}</span>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '4px 8px', borderRadius: '4px' }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                    <span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span>
                  </div>
                </div>
                <div className="order-details">
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Total: ${order.totalAmount.toFixed(2)}</p>
                  <p>Address: {order.shippingAddress}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && <p>No orders found.</p>}
          </div>
        </div>
      )}

      {!loading && activeTab === 'status' && (
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3>System Health Status</h3>
            <button onClick={fetchSystemStatus} style={{ background: 'transparent', border: 'none', color: '#6366f1', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={16} style={{ marginRight: '5px' }} /> Refresh
            </button>
          </div>
          
          {systemStatus && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 10px 0' }}>Overall System</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: systemStatus.overall === 'UP' ? '#10b981' : '#ef4444' }}>
                  {systemStatus.overall}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 10px 0' }}>PostgreSQL Database</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: systemStatus.database === 'UP' ? '#10b981' : '#ef4444' }}>
                  {systemStatus.database}
                </div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
                <h4 style={{ color: 'rgba(255,255,255,0.6)', margin: '0 0 10px 0' }}>Redis Cluster</h4>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: systemStatus.redis === 'UP' ? '#10b981' : '#ef4444' }}>
                  {systemStatus.redis}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
};

export default AdminDashboard;
