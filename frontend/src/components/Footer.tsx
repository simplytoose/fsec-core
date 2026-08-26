import React from 'react';
import { Zap, Mail } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <div className="logo">
            <Zap className="logo-icon" size={24} />
            <span className="logo-text">FlashGear</span>
          </div>
          <p className="footer-desc">
            Premium gaming hardware at unbelievable prices. Blink and you'll miss it.
          </p>
        </div>
        
        <div className="footer-links">
          <div className="link-group">
            <h3>Shop</h3>
            <a href="#">Components</a>
            <a href="#">Peripherals</a>
            <a href="#">Consoles</a>
          </div>
          <div className="link-group">
            <h3>Support</h3>
            <a href="#">FAQ</a>
            <a href="#">Shipping</a>
            <a href="#">Returns</a>
          </div>
          <div className="link-group">
            <h3>Connect</h3>
            <div className="social-icons">
              <a href="#"><Mail size={20} /></a>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} FlashGear Inc. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
