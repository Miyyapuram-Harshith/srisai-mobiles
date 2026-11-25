import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FlashSale, Device } from '../types';
import { 
  Flame, Timer, ShoppingCart, Heart, GitCompare, MessageCircle, Database
} from 'lucide-react';

interface FlashSaleCardProps {
  sale: FlashSale;
  device: Device;
}

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({ sale, device }) => {
  const { 
    navigateTo, addToCart, showToast, wishlist, toggleWishlist, 
    comparisonList, addToCompare, removeFromCompare, whatsAppSettings, trackWhatsAppClick 
  } = useApp();

  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  const isWishlisted = wishlist.includes(device.id);
  const isCompared = comparisonList.includes(device.id);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(sale.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('ENDED');
        setIsExpired(true);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}h ${pad(minutes)}m`);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [sale.endTime]);

  if (isExpired) return null;

  const flashPrice = sale.discountPercentage > 0
    ? Math.round(device.price * (1 - sale.discountPercentage / 100))
    : device.offerPrice;

  const stockRemaining = Math.max(0, sale.stockLimit - sale.soldCount);
  const percentSold = sale.stockLimit > 0 ? Math.min(100, Math.round((sale.soldCount / sale.stockLimit) * 100)) : 50;
  const emiPrice = Math.round(flashPrice / 12);

  const getTypeBadge = () => {
    switch (device.deviceType) {
      case 'brand_new':
        return { text: '🟢 Brand New Sealed', bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--success)', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'open_box':
        return { text: '🟡 Open Box', bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent)', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'refurbished':
        return { text: '🔵 Refurbished', bg: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)', border: '1px solid rgba(59, 130, 246, 0.3)' };
      case 'demo_unit':
        return { text: '🟣 Demo Unit', bg: 'rgba(139, 92, 246, 0.15)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.3)' };
      case 'used':
      default:
        return { text: '🟠 Certified Pre-Owned', bg: 'rgba(249, 115, 22, 0.15)', color: 'var(--warning)', border: '1px solid rgba(249, 115, 22, 0.3)' };
    }
  };
  const typeBadge = getTypeBadge();

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      const added = addToCompare(device.id);
      if (!added) {
        alert('You can compare up to 4 devices at a time.');
        e.target.checked = false;
      }
    } else {
      removeFromCompare(device.id);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    const color = device.colors && device.colors.length > 0 ? device.colors[0] : 'Standard';
    addToCart(device.id, color);
    showToast(`Claimed deal for ${device.brand} ${device.modelName}! Added to cart at ₹${flashPrice.toLocaleString('en-IN')}`, 'success');
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    const color = device.colors && device.colors.length > 0 ? device.colors[0] : 'Standard';
    addToCart(device.id, color);
    navigateTo('cart');
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackWhatsAppClick('product', device.id);

    const countryCode = whatsAppSettings?.countryCode || '91';
    const number = whatsAppSettings?.salesNumber || '9876543210';
    const link = `${window.location.origin}/#product/${device.id}`;
    
    const messageText = `Hello Sri Sai Mobiles,\nI want to claim the Flash Deal for:\n\nProduct: ${device.brand} ${device.modelName}\nStorage: ${device.variant}\nSpecial Deal Price: ₹${flashPrice.toLocaleString('en-IN')} (Save ${sale.discountPercentage}%)\nLink: ${link}\n\nIs this in stock for quick delivery or store pickup?`;

    const url = `https://api.whatsapp.com/send?phone=${countryCode}${number}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={() => navigateTo(`product/${device.id}`)}
      className="glass-card product-card-container" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        boxShadow: '0 4px 20px rgba(239, 68, 68, 0.08)'
      }}
    >
      {/* Top Badges Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 700,
          padding: '3px 8px',
          borderRadius: '20px',
          backgroundColor: typeBadge.bg,
          color: typeBadge.color,
          border: typeBadge.border,
          lineHeight: 1.2
        }}>
          {typeBadge.text}
        </span>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(device.id);
          }}
          className={`wishlist-btn ${isWishlisted ? 'active' : ''}`}
          aria-label={isWishlisted ? `Remove ${device.modelName} from wishlist` : `Add ${device.modelName} to wishlist`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            color: isWishlisted ? 'var(--error)' : 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 4
          }}
        >
          <Heart size={18} fill={isWishlisted ? 'var(--error)' : 'none'} />
        </button>
      </div>

      {/* Flash Sale Banner & Live Countdown Timer Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '6px',
        flexWrap: 'wrap',
        marginBottom: '10px'
      }}>
        {/* Deal Tag */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          color: 'var(--error)',
          padding: '4px 10px',
          borderRadius: '16px',
          fontSize: '11px',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.3px'
        }}>
          <Flame size={13} fill="var(--error)" />
          <span>Save {sale.discountPercentage}%</span>
        </div>

        {/* Live Timer Pill */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          backgroundColor: 'rgba(15, 23, 42, 0.9)',
          color: '#f8fafc',
          padding: '4px 9px',
          borderRadius: '8px',
          fontSize: '12px',
          fontFamily: 'monospace',
          fontWeight: 800,
          border: '1px solid rgba(245, 158, 11, 0.3)'
        }}>
          <Timer size={13} style={{ color: '#f59e0b' }} />
          <span>{timeLeft}</span>
        </div>
      </div>

      {/* Device Image */}
      <div className="product-card-img-wrapper" style={{ height: '170px', padding: '10px 0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <img 
          src={device.images[0] || 'logo.jpg'} 
          alt={device.modelName} 
          style={{
            maxHeight: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
          className="product-img"
        />
      </div>

      {/* Details Section */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: '10px' }}>
        <div className="product-card-brand">{device.brand}</div>
        <h3 className="product-card-title" title={`${device.brand} ${device.modelName}`}>
          {device.modelName}
        </h3>
        <div className="product-card-variant">
          Variant: {device.variant}
        </div>

        {/* Spec Chips (RAM/Storage) */}
        {device.ram && device.storage && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', margin: '6px 0 10px 0' }}>
            <Database size={12} style={{ color: 'var(--primary)' }} />
            <span>{device.ram} RAM • {device.storage} ROM</span>
          </div>
        )}

        {/* Pricing */}
        <div className="product-card-price-row">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
            <span className="product-card-price" style={{ color: 'var(--error)' }}>
              ₹{flashPrice.toLocaleString('en-IN')}
            </span>
            {device.price > flashPrice && (
              <span className="product-card-original-price">
                ₹{device.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="badge badge-sale" style={{ fontSize: '10px', backgroundColor: 'var(--error)' }}>
              {sale.discountPercentage}% OFF
            </span>
          </div>
          <div className="product-card-emi">
            EMI starts at ₹{emiPrice.toLocaleString('en-IN')}/mo* (No Cost EMI)
          </div>
        </div>

        {/* Sold / Stock Progress Bar */}
        <div style={{ margin: '10px 0 12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, marginBottom: '5px' }}>
            <span style={{ color: 'var(--error)' }}>
              {stockRemaining <= 3 ? `🔥 Only ${stockRemaining} units left!` : `${stockRemaining} units in stock`}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{percentSold}% Claimed</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--border-color)',
            borderRadius: '3px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${percentSold}%`,
              height: '100%',
              backgroundColor: 'var(--error)',
              borderRadius: '3px',
              backgroundImage: 'linear-gradient(90deg, #ec4899, #ef4444)'
            }} />
          </div>
        </div>

        {/* Stock Status & Compare Row */}
        <div className="product-card-meta-row" style={{ marginTop: 'auto', marginBottom: '10px' }}>
          <span className="badge badge-stock" style={{ color: 'var(--error)', backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
            ⚡ Flash Deal
          </span>

          <label 
            onClick={(e) => e.stopPropagation()}
            className="product-card-compare"
          >
            <input 
              type="checkbox" 
              checked={isCompared}
              onChange={handleCompareChange}
              style={{
                cursor: 'pointer',
                width: '13px',
                height: '13px',
                accentColor: 'var(--primary)'
              }}
            />
            <GitCompare size={11} />
            <span>Compare</span>
          </label>
        </div>

        {/* Action Buttons Row */}
        <div className="product-card-actions">
          <button
            onClick={handleAddToCart}
            className="premium-btn btn-secondary btn-icon-action"
            aria-label={`Add ${device.brand} ${device.modelName} to cart`}
            title="Add to Cart"
          >
            <ShoppingCart size={14} />
          </button>

          <button
            onClick={handleWhatsAppInquiry}
            className="premium-btn btn-secondary btn-icon-action btn-whatsapp"
            aria-label={`Inquire about ${device.brand} ${device.modelName} on WhatsApp`}
            title="Inquire on WhatsApp"
          >
            <MessageCircle size={14} fill="#25D366" style={{ color: '#128C7E' }} />
          </button>

          <button
            onClick={handleBuyNow}
            className="premium-btn btn-primary btn-buy-now"
            style={{ backgroundImage: 'linear-gradient(135deg, #ef4444, #dc2626)' }}
          >
            <span>Buy Now</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export const FlashSaleSection: React.FC = () => {
  const { flashSales, devices } = useApp();

  const activeSales = flashSales.filter(sale => {
    if (!sale.enabled) return false;
    const now = Date.now();
    const end = new Date(sale.endTime).getTime();
    const isFuture = isNaN(end) || end > now;
    return isFuture && (sale.soldCount < sale.stockLimit || sale.stockLimit === 0);
  });

  if (activeSales.length === 0) return null;

  return (
    <section style={{ margin: '30px 0' }} className="flash-sale-section">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: 'var(--error)'
          }}>
            <Flame size={22} fill="var(--error)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0 }}>Limited Time Deals</h2>
              <span style={{
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                color: 'var(--error)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.3)'
              }}>
                ⚡ Live Now
              </span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Exclusive countdown discounts on top smartphones — limited quantities available!
            </p>
          </div>
        </div>
      </div>

      <div className={`flash-sale-grid ${activeSales.length === 1 ? 'flash-sale-grid-single' : ''}`}>
        {activeSales.map(sale => {
          const device = devices.find(d => d.id === sale.deviceId);
          if (!device) return null;
          return (
            <FlashSaleCard 
              key={sale.id} 
              sale={sale} 
              device={device} 
            />
          );
        })}
      </div>
    </section>
  );
};
