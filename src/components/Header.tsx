import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Moon, Sun, ShoppingCart, User, MapPin, 
  GitCompare, Heart, LogOut, ShieldAlert
} from 'lucide-react';

const Instagram: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 20, style }) => (
  <svg 
    viewBox="0 0 24 24" 
    width={size} 
    height={size} 
    stroke="currentColor" 
    strokeWidth="2" 
    fill="none" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    style={style}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

interface HeaderProps {
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenAddress: () => void;
  onOpenCompare: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart, onOpenLogin, onOpenAddress, onOpenCompare, onOpenSearch
}) => {
  const { 
    theme, toggleTheme, currentUser, setCurrentUser, 
    selectedAddress, cart, comparisonList, wishlist, navigateTo, currentRoute 
  } = useApp();

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const handleLogout = () => {
    setCurrentUser(null);
    navigateTo('home');
  };

  return (
    <header className="glass sticky-nav" style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-color)',
      padding: '12px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px'
      }}>
        
        {/* Brand Logo */}
        <div 
          onClick={() => navigateTo('home')} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px', 
            cursor: 'pointer' 
          }}
        >
          <img 
            src="/logo.jpg" 
            alt="Sri Sai Mobiles" 
            style={{ 
              height: '42px', 
              width: '42px', 
              borderRadius: '50%',
              border: '2px solid var(--primary)',
              objectFit: 'cover'
            }} 
            onError={(e) => {
              // Fail-safe if image isn't loaded yet
              (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40"><rect width="40" height="40" fill="%233b82f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="20" font-family="Outfit">S</text></svg>';
            }}
          />
          <div className="logo-text" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontWeight: 800, 
              fontSize: '18px', 
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              background: 'linear-gradient(90deg, var(--primary), var(--accent))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              SRI SAI MOBILES
            </span>
            <span style={{ 
              fontSize: '10px', 
              letterSpacing: '0.15em', 
              color: 'var(--text-muted)',
              fontWeight: 700
            }}>
              JAGITIAL
            </span>
          </div>
        </div>

        {/* Address Selector (Desktop) */}
        <div 
          onClick={onOpenAddress}
          className="desktop-only"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: '20px',
            backgroundColor: 'var(--border-color)',
            fontSize: '12px',
            fontWeight: 500,
            maxWidth: '180px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}
        >
          <MapPin size={14} className="animate-pulse-slow" style={{ color: 'var(--primary)' }} />
          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <span style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Deliver to</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {selectedAddress ? `${selectedAddress.city} (${selectedAddress.pincode})` : 'Select pincode'}
            </span>
          </div>
        </div>

        {/* Compact Address Selector (Mobile) */}
        <button
          onClick={onOpenAddress}
          className="mobile-only"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-subtle)',
            width: '38px',
            height: '38px'
          }}
          title="Delivery Address"
        >
          <MapPin size={18} style={{ color: 'var(--primary)' }} />
        </button>

        {/* Search Bar Trigger (Desktop) */}
        <div 
          onClick={onOpenSearch}
          className="desktop-only search-trigger"
          style={{
            flex: 1,
            maxWidth: '450px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '14px',
            transition: 'border-color 0.2s'
          }}
        >
          <Search size={16} />
          <span>Search for Apple, Samsung, OnePlus...</span>
        </div>

        {/* Compact Search Trigger (Mobile) */}
        <button
          onClick={onOpenSearch}
          className="mobile-only"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            color: 'var(--text-main)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--bg-subtle)',
            width: '38px',
            height: '38px'
          }}
          title="Search"
        >
          <Search size={18} />
        </button>

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
          {/* Instagram Link (Desktop) */}
          <a 
            href="https://www.instagram.com/sri_sai_mobiles3048/"
            target="_blank"
            rel="noopener noreferrer"
            className="desktop-only"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              width: '38px',
              height: '38px',
              transition: 'color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#E1306C'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-main)'}
            title="Follow us on Instagram"
          >
            <Instagram size={18} />
          </a>

          {/* Theme Toggle (Desktop) */}
          <button 
            onClick={toggleTheme}
            className="desktop-only"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              width: '38px',
              height: '38px'
            }}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Product Compare (Desktop) */}
          <button 
            onClick={onOpenCompare}
            className="desktop-only"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              width: '38px',
              height: '38px',
              position: 'relative'
            }}
            title="Compare Products"
          >
            <GitCompare size={18} />
            {comparisonList.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--accent)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {comparisonList.length}
              </span>
            )}
          </button>

          {/* Wishlist Indicator */}
          <button 
            onClick={() => navigateTo('wishlist')}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: wishlist.length > 0 ? 'var(--error)' : 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              width: '38px',
              height: '38px',
              position: 'relative'
            }}
            title="Wishlist"
          >
            <Heart size={18} fill={wishlist.length > 0 ? 'var(--error)' : 'none'} />
            {wishlist.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--error)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={onOpenCart}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-subtle)',
              width: '38px',
              height: '38px',
              position: 'relative'
            }}
            title="Shopping Cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {cartCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-color)', margin: '0 4px' }} />

          {/* Auth Action Button */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div 
                onClick={() => navigateTo(currentUser.role !== 'customer' ? 'admin' : 'home')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  padding: '6px 12px',
                  borderRadius: '18px',
                  backgroundColor: currentUser.role !== 'customer' 
                    ? 'rgba(245, 158, 11, 0.15)' 
                    : 'var(--border-color)',
                  color: currentUser.role !== 'customer' ? 'var(--accent)' : 'var(--text-main)',
                  border: currentUser.role !== 'customer' ? '1px solid rgba(245, 158, 11, 0.3)' : 'none',
                  fontSize: '13px',
                  fontWeight: 600
                }}
              >
                {currentUser.role !== 'customer' ? (
                  <ShieldAlert size={14} style={{ color: 'var(--accent)' }} />
                ) : (
                  <User size={14} />
                )}
                <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentUser.role !== 'customer' ? 'Admin Portal' : currentUser.email.split('@')[0]}
                </span>
              </div>
              <button
                onClick={handleLogout}
                style={{
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  color: 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenLogin}
              className="premium-btn btn-primary"
              style={{
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '13px'
              }}
            >
              <User size={14} />
              <span>Login</span>
            </button>
          )}

        </div>
      </div>

      {/* Sub-Header Navigation Row */}
      <div style={{
        backgroundColor: 'var(--bg-subtle)',
        borderTop: '1px solid var(--border-color)',
        padding: '8px 0',
        fontSize: '12px',
        marginTop: '10px',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none'
      }} className="sub-header-nav">
        <div className="container" style={{ display: 'flex', gap: '20px', alignItems: 'center', whiteSpace: 'nowrap', overflowX: 'auto' }}>
          <button onClick={() => navigateTo('home')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: currentRoute === 'home' ? 700 : 500, color: currentRoute === 'home' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '12px' }}>Mobiles Store</button>
          <button onClick={() => navigateTo('accessories')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: currentRoute === 'accessories' ? 700 : 500, color: currentRoute === 'accessories' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '12px' }}>Accessories Store</button>
          <button onClick={() => { navigateTo('home'); window.location.hash = '#filter?offers=exchange'; }} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: 500, color: 'var(--text-muted)', fontSize: '12px' }}>Exchange Offers</button>
          <button onClick={() => navigateTo('wishlist')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: currentRoute === 'wishlist' ? 700 : 500, color: currentRoute === 'wishlist' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '12px' }}>Wishlist</button>
          <button onClick={() => navigateTo('contact')} style={{ border: 'none', background: 'none', cursor: 'pointer', fontWeight: currentRoute === 'contact' ? 700 : 500, color: currentRoute === 'contact' ? 'var(--primary)' : 'var(--text-muted)', fontSize: '12px' }}>Contact Us</button>
        </div>
      </div>
    </header>
  );
};
