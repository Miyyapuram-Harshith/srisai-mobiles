import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Moon, Sun, ShoppingCart, User, MapPin, 
  GitCompare, Heart, LogOut, ShieldAlert, Menu, X
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

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
      {/* DESKTOP HEADER ROW */}
      <div className="container desktop-header-row" style={{
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

        {/* Toolbar Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          
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

          <button 
            onClick={() => navigateTo('wishlist')}
            className="desktop-only"
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

          {/* User profile / Login dropdown */}
          {currentUser ? (
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }} className="user-profile-menu">
              <button 
                onClick={() => navigateTo(currentUser.role !== 'customer' ? 'admin' : 'home')}
                className="premium-btn btn-secondary"
                style={{
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div style={{ 
                  width: '20px', 
                  height: '20px', 
                  borderRadius: '50%', 
                  backgroundColor: 'var(--primary)', 
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: '10px'
                }}>
                  {currentUser.email[0].toUpperCase()}
                </div>
                <span className="desktop-only">{currentUser.email.split('@')[0]}</span>
              </button>

              <button 
                onClick={handleLogout}
                className="premium-btn btn-secondary"
                style={{
                  padding: '8px 12px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  marginLeft: '6px',
                  color: 'var(--error)'
                }}
                title="Logout"
              >
                <LogOut size={14} />
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

      {/* ========================================================================= */}
      {/* MOBILE NAVBAR ROW LAYOUT                                                 */}
      {/* ========================================================================= */}
      <div className="container mobile-header-layout" style={{
        display: 'none',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {/* First Row: Menu, Logo, Cart */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-main)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Menu size={24} />
            </button>
            
            {/* Brand Logo & Name */}
            <div 
              onClick={() => navigateTo('home')} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                cursor: 'pointer' 
              }}
            >
              <img 
                src="/logo.jpg" 
                alt="Sri Sai Mobiles" 
                style={{ 
                  height: '32px', 
                  width: '32px', 
                  borderRadius: '50%',
                  border: '1.5px solid var(--primary)',
                  objectFit: 'cover'
                }} 
              />
              <span style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 800, 
                fontSize: '16px', 
                letterSpacing: '-0.02em',
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                SRI SAI MOBILES
              </span>
            </div>
          </div>

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
        </div>

        {/* Second Row: Full Width Search Bar */}
        <div 
          onClick={onOpenSearch}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '24px',
            cursor: 'pointer',
            color: 'var(--text-muted)',
            fontSize: '13px',
            width: '100%'
          }}
        >
          <Search size={16} />
          <span>Search for Apple, Samsung, OnePlus...</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE HAMBURGER MENU DRAWER OVERLAY                                      */}
      {/* ========================================================================= */}
      {isMobileMenuOpen && (
        <div 
          className="mobile-drawer-overlay animate-fade" 
          style={{ zIndex: 1000 }} 
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="mobile-drawer-content" 
            style={{ 
              width: 'min(100%, 300px)',
              maxWidth: '100%',
              display: 'flex', 
              flexDirection: 'column',
              padding: '20px',
              backgroundColor: 'var(--bg-solid)',
              borderRight: '1px solid var(--border-color)',
              height: '100%'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src="/logo.jpg" alt="Logo" style={{ width: '28px', height: '28px', borderRadius: '50%' }} />
                <span style={{ fontWeight: 800, fontSize: '15px' }}>Menu</span>
              </div>
              <button 
                onClick={() => setIsMobileMenuOpen(false)} 
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Menu Items List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, overflowY: 'auto' }}>
              
              {/* Delivery Address */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onOpenAddress(); }}
                className="mobile-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: 'var(--text-main)', fontSize: '14px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <MapPin size={18} style={{ color: 'var(--primary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deliver to</span>
                  <span>{selectedAddress ? `${selectedAddress.city} (${selectedAddress.pincode})` : 'Select Location'}</span>
                </div>
              </button>

              {/* Wishlist */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigateTo('wishlist'); }}
                className="mobile-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: 'var(--text-main)', fontSize: '14px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <Heart size={18} fill={wishlist.length > 0 ? 'var(--error)' : 'none'} style={{ color: wishlist.length > 0 ? 'var(--error)' : 'var(--text-main)' }} />
                <span>Wishlist ({wishlist.length})</span>
              </button>

              {/* Compare */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); onOpenCompare(); }}
                className="mobile-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: 'var(--text-main)', fontSize: '14px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                <GitCompare size={18} style={{ color: 'var(--accent)' }} />
                <span>Compare ({comparisonList.length})</span>
              </button>

              {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="mobile-menu-item"
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: 'var(--text-main)', fontSize: '14px', cursor: 'pointer', textAlign: 'left'
                }}
              >
                {theme === 'dark' ? <Sun size={18} style={{ color: 'var(--warning)' }} /> : <Moon size={18} />}
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
              </button>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '12px 0' }} />

              {/* Store Sections */}
              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigateTo('home'); }}
                className="mobile-menu-item"
                style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: currentRoute === 'home' ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: currentRoute === 'home' ? 700 : 500,
                  fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                Mobiles Store
              </button>

              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigateTo('accessories'); }}
                className="mobile-menu-item"
                style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: currentRoute === 'accessories' ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: currentRoute === 'accessories' ? 700 : 500,
                  fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                Accessories Store
              </button>

              <button 
                onClick={() => { setIsMobileMenuOpen(false); navigateTo('contact'); }}
                className="mobile-menu-item"
                style={{
                  padding: '12px', borderRadius: '8px', border: 'none', background: 'none',
                  color: currentRoute === 'contact' ? 'var(--primary)' : 'var(--text-main)', 
                  fontWeight: currentRoute === 'contact' ? 700 : 500,
                  fontSize: '14px', cursor: 'pointer', textAlign: 'left', width: '100%'
                }}
              >
                Contact Us
              </button>

            </div>

            {/* Drawer Footer User Profile */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: 'auto' }}>
              {currentUser ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ 
                      width: '32px', height: '32px', borderRadius: '50%', 
                      backgroundColor: 'var(--primary)', color: 'white', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                    }}>
                      {currentUser.email[0].toUpperCase()}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{currentUser.email.split('@')[0]}</span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{currentUser.role}</span>
                    </div>
                  </div>
                  {currentUser.role !== 'customer' && (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigateTo('admin'); }}
                      className="premium-btn btn-secondary"
                      style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    >
                      <ShieldAlert size={14} />
                      <span>Admin Portal</span>
                    </button>
                  )}
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                    className="premium-btn btn-secondary"
                    style={{ width: '100%', padding: '8px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--error)' }}
                  >
                    <LogOut size={14} />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setIsMobileMenuOpen(false); onOpenLogin(); }}
                  className="premium-btn btn-primary"
                  style={{ width: '100%', padding: '10px', borderRadius: '8px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  <User size={14} />
                  <span>Login / Register</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

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
