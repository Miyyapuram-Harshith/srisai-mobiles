import React from 'react';
import { Device } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, GitCompare, ShoppingCart, Smartphone, Cpu, 
  Layers, Database, Battery, Camera, MessageCircle
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

interface ProductCardProps {
  device: Device;
}

export const ProductCard: React.FC<ProductCardProps> = ({ device }) => {
  const { 
    wishlist, toggleWishlist, comparisonList, addToCompare, 
    removeFromCompare, addToCart, navigateTo, whatsAppSettings, trackWhatsAppClick
  } = useApp();

  const isWishlisted = wishlist.includes(device.id);
  const isCompared = comparisonList.includes(device.id);

  const discountPercent = Math.round(((device.price - device.offerPrice) / device.price) * 100);
  const emiPrice = Math.round(device.offerPrice / 12);

  const handleCompareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    addToCart(device.id, device.colors[0]);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigateTo(`product/${device.id}`);
  };

  const handleWhatsAppInquiry = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Log analytics click
    trackWhatsAppClick('product', device.id);

    // Build template message text
    const countryCode = whatsAppSettings?.countryCode || '91';
    const number = whatsAppSettings?.salesNumber || '9876543210';
    const link = `${window.location.origin}/#product/${device.id}`;
    
    const messageText = `Hello Sri Sai Mobiles,\nI am interested in:\n\nProduct: ${device.brand} ${device.modelName}\nStorage Variant: ${device.variant}\nPrice: ₹${device.offerPrice.toLocaleString('en-IN')}\nLink: ${link}\n\nCan you provide availability details?`;

    const url = `https://api.whatsapp.com/send?phone=${countryCode}${number}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  // Device type badge color resolver
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
        return { text: '🟠 Used Phone', bg: 'rgba(249, 115, 22, 0.15)', color: 'var(--warning)', border: '1px solid rgba(249, 115, 22, 0.3)' };
    }
  };

  const typeBadge = getTypeBadge();

  // Helper: Format Condition Grade
  const getGradeText = (grade?: string) => {
    if (!grade) return '';
    if (grade === 'A_plus') return 'A+ Grade (Like New)';
    if (grade === 'A') return 'A Grade (Excellent)';
    if (grade === 'B_plus') return 'B+ Grade (Good)';
    if (grade === 'B') return 'B Grade (Average)';
    return 'C Grade (Heavy Usage)';
  };

  // Helper: Format Warranty Expiration
  const getWarrantyExpiryString = (dateString?: string) => {
    if (!dateString) return 'No Warranty';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  const purchaseYear = device.originalPurchaseDate 
    ? new Date(device.originalPurchaseDate).getFullYear() 
    : null;

  // Extract and sanitize specs — ensures NO empty icons or orphaned "mAh" units render
  const cleanRam = device.ram && device.ram.trim() ? device.ram.trim() : '';
  const cleanStorage = device.storage && device.storage.trim() ? device.storage.trim() : '';
  const cleanProcessor = device.processor && device.processor.trim() && device.processor.trim() !== '0'
    ? device.processor.trim().split(' ')[0]
    : '';
  const cleanDisplay = device.display && device.display.trim()
    ? device.display.trim().split(',')[0]
    : '';
  
  let cleanBattery = '';
  if (device.battery && device.battery.trim()) {
    const bMatch = device.battery.match(/\d+/);
    if (bMatch && parseInt(bMatch[0], 10) >= 500) {
      cleanBattery = `${bMatch[0]} mAh`;
    }
  }

  const cleanCameras = device.cameras && device.cameras.trim() && device.cameras.trim() !== '0'
    ? device.cameras.trim().split(' ')[0]
    : '';

  const validSpecs = [
    cleanRam ? { icon: Layers, text: `${cleanRam} RAM` } : null,
    cleanStorage ? { icon: Database, text: `${cleanStorage} ROM` } : null,
    cleanBattery ? { icon: Battery, text: cleanBattery } : null,
    cleanProcessor ? { icon: Cpu, text: cleanProcessor } : null,
    cleanDisplay ? { icon: Smartphone, text: cleanDisplay } : null,
    cleanCameras ? { icon: Camera, text: cleanCameras } : null,
  ].filter(Boolean) as { icon: React.FC<{ size?: number }>; text: string }[];

  return (
    <div 
      className="glass-card product-card-container" 
      onClick={() => navigateTo(`product/${device.id}`)}
    >
      {/* Top Badges */}
      <div className="product-card-top-badges">
        {/* Classification Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '10px',
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
          {device.seenOnInstagram && (
            <a 
              href="https://www.instagram.com/sri_sai_mobiles3048/"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              title="View on Sri Sai Mobiles Instagram Reels"
              style={{
                fontSize: '9px',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: 'rgba(225, 48, 108, 0.12)',
                color: '#E1306C',
                border: '1px solid rgba(225, 48, 108, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                textDecoration: 'none',
                cursor: 'pointer'
              }}
            >
              <Instagram size={10} />
              <span>Seen on Instagram ↗</span>
            </a>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(device.id);
          }}
          aria-label={isWishlisted ? `Remove ${device.brand} ${device.modelName} from wishlist` : `Add ${device.brand} ${device.modelName} to wishlist`}
          className="wishlist-btn"
          style={{
            border: 'none',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            padding: 0,
            borderRadius: '50%',
            color: isWishlisted ? 'var(--error)' : 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={15} fill={isWishlisted ? 'var(--error)' : 'none'} />
        </button>
      </div>

      {/* Product Image */}
      <div className="product-card-img-wrapper">
        <img 
          src={device.images[0] || 'logo.jpg'} 
          alt={`${device.brand} ${device.modelName}`}
          width="160"
          height="160"
          loading="lazy"
          decoding="async"
          className="product-img"
        />
      </div>

      {/* Brand & Name */}
      <div style={{ marginTop: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
            {device.brand}
          </span>
          {discountPercent > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 'bold', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1px 6px', borderRadius: '4px' }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        <h3 className="product-card-title">
          {device.modelName}
        </h3>
        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
          Variant: {device.variant}
        </p>
      </div>

      {/* Specs Summary - Only renders when valid, meaningful specs exist */}
      {validSpecs.length > 0 && (
        <div className="product-specs-container">
          {validSpecs.map((spec, sIdx) => {
            const Icon = spec.icon;
            return (
              <div key={sIdx} className="spec-badge">
                <Icon size={11} />
                <span>{spec.text}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* USED Phones Details Panel */}
      {device.deviceType === 'used' && (
        <div style={{
          border: '1px solid rgba(249, 115, 22, 0.2)',
          backgroundColor: 'rgba(249, 115, 22, 0.04)',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid rgba(249, 115, 22, 0.1)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--warning)' }}>USED • {getGradeText(device.deviceConditionGrade).split(' ')[0]}</span>
            {purchaseYear && <span style={{ color: 'var(--text-muted)' }}>Year: {purchaseYear}</span>}
          </div>
          {device.batteryHealth !== undefined && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Battery Health:</span>
              <strong style={{ color: device.batteryHealth >= 90 ? 'var(--success)' : 'inherit' }}>{device.batteryHealth}%</strong>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Warranty:</span>
            <strong>
              {device.currentWarrantyStatus === 'under_brand' && device.warrantyExpiryDate
                ? `Warranty till ${getWarrantyExpiryString(device.warrantyExpiryDate)}`
                : device.currentWarrantyStatus === 'under_extended' && device.warrantyExpiryDate
                ? `Extended till ${getWarrantyExpiryString(device.warrantyExpiryDate)}`
                : 'Warranty Expired'
              }
            </strong>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
            {device.boxAvailable && (
              <span style={{ backgroundColor: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>Box Included</span>
            )}
            {device.originalChargerAvailable && (
              <span style={{ backgroundColor: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>Charger Included</span>
            )}
          </div>
        </div>
      )}

      {/* Refurbished Details Panel */}
      {device.deviceType === 'refurbished' && (
        <div style={{
          border: '1px solid rgba(59, 130, 246, 0.2)',
          backgroundColor: 'rgba(59, 130, 246, 0.04)',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid rgba(59, 130, 246, 0.1)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--primary)' }}>REFURBISHED • {device.refurbishedGrade || 'Grade A'}</span>
            <span>By: {device.refurbishedBy || 'SriSai'}</span>
          </div>
          {device.refurbishedPartsReplaced && (
            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              Replaced: <strong>{device.refurbishedPartsReplaced}</strong>
            </div>
          )}
          <div>
            Warranty: <strong>{device.refurbishedWarrantyOffered || 'No Warranty'}</strong>
          </div>
        </div>
      )}

      {/* Open Box Details Panel */}
      {device.deviceType === 'open_box' && (
        <div style={{
          border: '1px solid rgba(245, 158, 11, 0.2)',
          backgroundColor: 'rgba(245, 158, 11, 0.04)',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid rgba(245, 158, 11, 0.1)', paddingBottom: '4px' }}>
            <span style={{ color: 'var(--accent)' }}>OPEN BOX</span>
            <span>Remaining: {device.openBoxWarrantyRemaining}</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '2px' }}>
            {device.openBoxBoxAvailable && <span style={{ backgroundColor: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>Box Available</span>}
            {device.openBoxAccessoriesAvailable && <span style={{ backgroundColor: 'var(--border-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '9px', fontWeight: 'bold' }}>Accessories Ok</span>}
          </div>
        </div>
      )}

      {/* Demo Unit Panel */}
      {device.deviceType === 'demo_unit' && (
        <div style={{
          border: '1px solid rgba(139, 92, 246, 0.2)',
          backgroundColor: 'rgba(139, 92, 246, 0.04)',
          borderRadius: '10px',
          padding: '10px',
          fontSize: '11px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', borderBottom: '1px solid rgba(139, 92, 246, 0.1)', paddingBottom: '4px' }}>
            <span style={{ color: '#8b5cf6' }}>DEMO UNIT</span>
            <span>Usage: {device.demoUsageHours}</span>
          </div>
          <div>Condition: <strong>{device.demoPhysicalCondition}</strong></div>
        </div>
      )}

      {/* Pricing and EMI */}
      <div className="product-card-pricing" style={{ margin: 'auto 0 10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', flexWrap: 'wrap' }}>
          <span className="product-card-price">
            ₹{device.offerPrice.toLocaleString('en-IN')}
          </span>
          {device.price > device.offerPrice && (
            <span className="product-card-original-price">
              ₹{device.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div className="product-card-emi">
          EMI from ₹{emiPrice.toLocaleString('en-IN')}/mo*
        </div>
      </div>

      {/* Stock Status & Compare */}
      <div className="product-card-meta-row">
        {/* Stock Badge */}
        {device.stockCount === 0 ? (
          <span className="badge badge-out">Out of stock</span>
        ) : device.stockCount <= 2 ? (
          <span className="badge badge-low-stock">Only {device.stockCount} left</span>
        ) : (
          <span className="badge badge-stock">In stock</span>
        )}

        {/* Compare Checkbox */}
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

      {/* Action Buttons */}
      <div className="product-card-actions">
        <button
          onClick={handleAddToCart}
          className="premium-btn btn-secondary btn-icon-action"
          disabled={device.stockCount === 0}
          aria-label={`Add ${device.brand} ${device.modelName} to cart`}
          title="Add to Cart"
        >
          <ShoppingCart size={13} />
        </button>

        <button
          onClick={handleWhatsAppInquiry}
          className="premium-btn btn-secondary btn-icon-action btn-whatsapp"
          aria-label={`Inquire about ${device.brand} ${device.modelName} on WhatsApp`}
          title="Inquire on WhatsApp"
        >
          <MessageCircle size={13} fill="#25D366" style={{ color: '#128C7E' }} />
        </button>

        <button
          onClick={handleBuyNow}
          className="premium-btn btn-primary btn-buy-now"
          disabled={device.stockCount === 0}
        >
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};
