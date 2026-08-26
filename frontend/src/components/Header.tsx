import React from 'react';
import { Zap, User, LogOut, Shield, ShoppingBag, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { useCart } from '../CartContext';

const Header: React.FC = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header-content">
        <Link to="/" className="logo" style={{ textDecoration: 'none' }}>
          <Zap className="logo-icon" size={28} />
          <span className="logo-text">FlashGear</span>
        </Link>
        
        <nav className="nav-links">
          <Link to="/" className="active">Flash Sales</Link>
        </nav>
        
        <div className="header-actions">
          <Link to="/cart" className="icon-btn" title="Cart" style={{ position: 'relative' }}>
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: -5, right: -5, background: '#ef4444', color: 'white', borderRadius: '50%', width: '18px', height: '18px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>
          
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <Link to="/admin" className="icon-btn" title="Admin Dashboard">
                  <Shield size={22} />
                </Link>
              )}
              <Link to="/my-orders" className="icon-btn" title="My Orders">
                <ShoppingBag size={22} />
              </Link>
              <div className="user-info">
                <User size={18} />
                <span className="user-email">{user?.email.split('@')[0]}</span>
              </div>
              <button onClick={handleLogout} className="icon-btn" title="Logout">
                <LogOut size={22} />
              </button>
            </>
          ) : (
            <Link to="/login" className="login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
