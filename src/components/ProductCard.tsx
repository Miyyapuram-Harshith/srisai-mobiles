import React from 'react';
import { Device } from '../types';
import { useApp } from '../context/AppContext';
import { 
  Heart, GitCompare, ShoppingCart, Smartphone, Cpu, 
  Layers, Database, Battery, Camera, Check, Tag, Gift, AlertCircle, MessageCircle
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

  return (
    <div 
      className="glass-card" 
      onClick={() => navigateTo(`product/${device.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        height: '100%',
        padding: '16px'
      }}
    >
      {/* Top Badges */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        right: '12px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5
      }}>
        {/* Classification Badge */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
          <span style={{
            fontSize: '11px',
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: '20px',
            backgroundColor: typeBadge.bg,
            color: typeBadge.color,
            border: typeBadge.border
          }}>
            {typeBadge.text}
          </span>
          {device.seenOnInstagram && (
            <span style={{
              fontSize: '9px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(225, 48, 108, 0.12)',
              color: '#E1306C',
              border: '1px solid rgba(225, 48, 108, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Instagram size={10} />
              <span>Seen on Instagram</span>
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(device.id);
          }}
          style={{
            border: 'none',
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            cursor: 'pointer',
            padding: '8px',
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
          <Heart size={16} fill={isWishlisted ? 'var(--error)' : 'none'} />
        </button>
      </div>

      {/* Product Image */}
      <div style={{
        height: '160px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '10px 0',
        marginTop: '25px'
      }}>
        <img 
          src={device.images[0] || 'logo.jpg'} 
          alt={device.modelName} 
          loading="lazy"
          style={{
            height: '100%',
            maxWidth: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
          className="product-img"
        />
      </div>

      {/* Brand & Name */}
      <div style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            {device.brand}
          </span>
          {discountPercent > 0 && (
            <span style={{ fontSize: '10px', color: 'var(--error)', fontWeight: 'bold' }}>
              {discountPercent}% OFF
            </span>
          )}
        </div>
        
        <h3 style={{
          fontSize: '15px',
          fontWeight: 700,
          margin: '2px 0 6px 0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {device.modelName}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
          Variant: {device.variant}
        </p>
      </div>

      {/* Specs Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '6px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        backgroundColor: 'var(--bg-subtle)',
        padding: '8px',
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Layers size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.ram} RAM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Database size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.storage} ROM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', gridColumn: 'span 2' }}>
          <Cpu size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.processor.split(' ')[0]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', gridColumn: 'span 2' }}>
          <Smartphone size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.display.split(',')[0]}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Battery size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.battery.split(' ')[0]} mAh</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Camera size={12} />
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{device.cameras.split(' ')[0]}</span>
        </div>
      </div>

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
      <div style={{ margin: 'auto 0 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-main)' }}>
            ₹{device.offerPrice.toLocaleString('en-IN')}
          </span>
          {device.price > device.offerPrice && (
            <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
              ₹{device.price.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <div style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 600, marginTop: '2px' }}>
          EMI starts at ₹{emiPrice.toLocaleString('en-IN')}/mo* (No Cost EMI)
        </div>
      </div>

      {/* Stock Status & Compare */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px',
        fontSize: '12px'
      }}>
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
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer',
            fontWeight: 600,
            color: isCompared ? 'var(--primary)' : 'var(--text-muted)'
          }}
        >
          <input 
            type="checkbox" 
            checked={isCompared}
            onChange={handleCompareChange}
            style={{
              cursor: 'pointer',
              width: '14px',
              height: '14px',
              accentColor: 'var(--primary)'
            }}
          />
          <GitCompare size={12} />
          <span>Compare</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="product-card-actions" style={{ gap: '6px' }}>
        <button
          onClick={handleAddToCart}
          className="premium-btn btn-secondary"
          disabled={device.stockCount === 0}
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            fontSize: '12px',
            opacity: device.stockCount === 0 ? 0.5 : 1
          }}
          title="Add to Cart"
        >
          <ShoppingCart size={13} />
        </button>

        <button
          onClick={handleWhatsAppInquiry}
          className="premium-btn btn-secondary"
          style={{
            padding: '8px 10px',
            borderRadius: '8px',
            borderColor: '#25D366',
            color: '#128C7E',
            backgroundColor: 'rgba(37, 211, 102, 0.08)'
          }}
          title="Inquire on WhatsApp"
        >
          <MessageCircle size={13} fill="#25D366" style={{ color: '#128C7E' }} />
        </button>

        <button
          onClick={handleBuyNow}
          className="premium-btn btn-primary"
          disabled={device.stockCount === 0}
          style={{
            flex: 1,
            padding: '8px',
            borderRadius: '8px',
            fontSize: '12px',
            opacity: device.stockCount === 0 ? 0.5 : 1
          }}
        >
          <span>Buy Now</span>
        </button>
      </div>
    </div>
  );
};
