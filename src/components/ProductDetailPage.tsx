import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { checkPincodeServiceability, getEstimatedDateString, PincodeDetails } from '../utils/pincodeService';
import { 
  Heart, ShoppingCart, GitCompare, ShieldCheck, Truck, 
  Tag, Play, Sparkles, ChevronRight, Check, AlertCircle, Info, MessageCircle
} from 'lucide-react';

interface ProductDetailPageProps {
  deviceId: string;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ deviceId }) => {
  const { 
    devices, wishlist, toggleWishlist, comparisonList, addToCompare, 
    removeFromCompare, addToCart, navigateTo, addRecentlyViewed, 
    recentlyViewed, incrementDeviceViews, whatsAppSettings, trackWhatsAppClick
  } = useApp();

  const device = devices.find(d => d.id === deviceId);

  if (!device) {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Product not found</h2>
        <button className="premium-btn btn-primary" onClick={() => navigateTo('home')}>Go Home</button>
      </div>
    );
  }

  // State Management
  const [activeImage, setActiveImage] = useState(device.images[0] || 'logo.jpg');
  const [selectedColor, setSelectedColor] = useState(device.colors[0] || 'Default');
  const [pincode, setPincode] = useState('');
  const [pincodeResult, setPincodeResult] = useState<PincodeDetails | null>(null);
  const [showVideo, setShowVideo] = useState(false);
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({ display: 'none' });

  useEffect(() => {
    setActiveImage(device.images[0] || 'logo.jpg');
    setSelectedColor(device.colors[0] || 'Default');
    setPincodeResult(null);
    setPincode('');
    setShowVideo(false);
    
    incrementDeviceViews(device.id);
    addRecentlyViewed(device.id);
  }, [deviceId, device.id]);

  const isWishlisted = wishlist.includes(device.id);
  const isCompared = comparisonList.includes(device.id);
  const discountPercent = Math.round(((device.price - device.offerPrice) / device.price) * 100);
  const emiPrice = Math.round(device.offerPrice / 12);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - window.scrollX - left) / width) * 100;
    const y = ((e.pageY - window.scrollY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${activeImage})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '200%'
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkPincodeServiceability(pincode, device.offerPrice);
    setPincodeResult(res);
  };

  const handleCompareClick = () => {
    if (isCompared) {
      removeFromCompare(device.id);
    } else {
      const added = addToCompare(device.id);
      if (!added) alert('You can compare up to 4 devices.');
    }
  };

  const handleAddToCart = () => {
    addToCart(device.id, selectedColor);
    alert(`${device.modelName} (${selectedColor}) added to cart.`);
  };

  const handleBuyNow = () => {
    addToCart(device.id, selectedColor);
    navigateTo('cart');
  };

  const handleWhatsAppInquiry = () => {
    if (!device) return;
    
    // Log analytics click
    trackWhatsAppClick('product', device.id);

    // Build template message text
    const countryCode = whatsAppSettings?.countryCode || '91';
    const number = whatsAppSettings?.salesNumber || '9876543210';
    const link = window.location.href;
    
    const messageText = `Hello Sri Sai Mobiles,\nI am interested in:\n\nProduct: ${device.brand} ${device.modelName}\nStorage Variant: ${device.variant}\nPrice: ₹${device.offerPrice.toLocaleString('en-IN')}\nLink: ${link}\n\nCan you provide availability details?`;

    const url = `https://api.whatsapp.com/send?phone=${countryCode}${number}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
  };

  // Helper: Format Condition Grade
  const getGradeText = (grade?: string) => {
    if (!grade) return '';
    if (grade === 'A_plus') return 'A+ Grade (Like New)';
    if (grade === 'A') return 'A Grade (Excellent)';
    if (grade === 'B_plus') return 'B+ Grade (Good)';
    if (grade === 'B') return 'B Grade (Average)';
    return 'C Grade (Heavy Usage)';
  };

  const getWarrantyExpiryString = (dateString?: string) => {
    if (!dateString) return 'No Warranty';
    return new Date(dateString).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Related & Similar Lists
  const relatedProducts = devices.filter(d => d.brand === device.brand && d.id !== device.id && d.status !== 'archived').slice(0, 4);
  const similarProducts = devices.filter(d => Math.abs(d.offerPrice - device.offerPrice) <= 25000 && d.id !== device.id && d.status !== 'archived').slice(0, 4);
  const viewedDevices = devices.filter(d => recentlyViewed.includes(d.id) && d.id !== device.id && d.status !== 'archived').slice(0, 4);

  // Device type label resolver
  const getClassificationLabel = () => {
    switch (device.deviceType) {
      case 'brand_new': return 'Brand New Sealed';
      case 'open_box': return 'Open Box';
      case 'refurbished': return 'Refurbished';
      case 'demo_unit': return 'Demo Unit';
      case 'used':
      default: return 'Used / Pre-Owned';
    }
  };

  return (
    <div className="animate-fade" style={{ padding: '20px 0' }}>
      
      {/* Breadcrumb */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '6px', 
        fontSize: '13px', 
        color: 'var(--text-muted)',
        marginBottom: '24px'
      }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>Home</span>
        <ChevronRight size={14} />
        <span>{device.brand}</span>
        <ChevronRight size={14} />
        <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{device.modelName}</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
        gap: '40px',
        marginBottom: '60px'
      }}>
        
        {/* Left Column: Image Gallery & Video Player */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Desktop Zoom Gallery Viewer */}
          <div className="desktop-only-flex" style={{ flexDirection: 'column', gap: '16px', width: '100%' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              {showVideo && device.videoUrl ? (
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '400px',
                  borderRadius: '20px',
                  backgroundColor: 'black',
                  overflow: 'hidden'
                }}>
                  <video src={device.videoUrl} controls autoPlay style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  <button 
                    onClick={() => setShowVideo(false)}
                    style={{
                      position: 'absolute', top: '12px', right: '12px', border: 'none',
                      backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px',
                      borderRadius: '20px', cursor: 'pointer', fontSize: '12px', fontWeight: 600
                    }}
                  >
                    Close Video
                  </button>
                </div>
              ) : (
                <div 
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '400px',
                    borderRadius: '20px',
                    backgroundColor: 'var(--bg-solid)',
                    border: '1px solid var(--border-color)',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'zoom-in'
                  }}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                  <img src={activeImage} alt={device.modelName} loading="lazy" style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }} />
                  <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10, ...zoomStyle }} />
                  {device.videoUrl && (
                    <button 
                      onClick={() => setShowVideo(true)}
                      style={{
                        position: 'absolute', bottom: '16px', right: '16px', border: 'none',
                        backgroundColor: 'var(--primary)', color: 'white', width: '42px', height: '42px',
                        borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
                      }}
                      title="Play Video"
                    >
                      <Play size={18} fill="white" />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Thumbnails row */}
            <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '4px 0' }}>
              {device.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setActiveImage(img);
                    setShowVideo(false);
                  }}
                  style={{
                    flex: '0 0 70px',
                    height: '70px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-solid)',
                    border: activeImage === img && !showVideo ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '6px',
                    overflow: 'hidden'
                  }}
                >
                  <img src={img} alt="thumbnail" loading="lazy" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                </button>
              ))}
              {device.videoUrl && (
                <button
                  onClick={() => setShowVideo(true)}
                  style={{
                    flex: '0 0 70px', height: '70px', borderRadius: '10px',
                    backgroundColor: '#000', border: showVideo ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', position: 'relative'
                  }}
                >
                  <Play size={20} fill="white" />
                  <span style={{ fontSize: '9px', position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold' }}>VIDEO</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Swipe Gallery */}
          <div className="mobile-only-flex" style={{ flexDirection: 'column', gap: '10px', width: '100%' }}>
            <div style={{ 
              display: 'flex', 
              overflowX: 'auto', 
              scrollSnapType: 'x mandatory', 
              width: '100%', 
              height: '350px', 
              scrollbarWidth: 'none', 
              border: '1px solid var(--border-color)', 
              borderRadius: '20px', 
              backgroundColor: 'var(--bg-solid)',
              position: 'relative'
            }}>
              {device.images.map((img, i) => (
                <div key={i} style={{ flex: '0 0 100%', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', scrollSnapAlign: 'center' }}>
                  <img src={img} alt={`${device.modelName}-${i}`} loading="lazy" style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
            {/* Swiping Dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '4px' }}>
              {device.images.map((_, i) => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--text-muted)', opacity: 0.5 }} />
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Pricing & Spec Config */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
              {device.brand}
            </span>
            <span style={{
              fontSize: '11px',
              backgroundColor: 'var(--border-color)',
              color: 'var(--text-main)',
              padding: '2px 8px',
              borderRadius: '10px',
              fontWeight: 'bold'
            }}>
              {getClassificationLabel()}
            </span>
          </div>

          <h1 style={{ fontSize: '28px', fontWeight: 800, margin: '0 0 8px 0', lineHeight: 1.1 }}>
            {device.modelName}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Specification: {device.ram} RAM • {device.storage} Storage ({device.variant})
          </p>

          {/* Pricing Info */}
          <div style={{ 
            backgroundColor: 'var(--bg-subtle)',
            borderRadius: '16px',
            padding: '16px 20px',
            border: '1px solid var(--border-color)',
            marginBottom: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
              <span style={{ fontSize: '32px', fontWeight: 900, color: 'var(--text-main)' }}>
                ₹{device.offerPrice.toLocaleString('en-IN')}
              </span>
              {device.price > device.offerPrice && (
                <>
                  <span style={{ fontSize: '16px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
                    ₹{device.price.toLocaleString('en-IN')}
                  </span>
                  <span className="badge badge-sale" style={{ fontSize: '12px' }}>
                    {discountPercent}% OFF
                  </span>
                </>
              )}
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Inclusive of all taxes
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginTop: '12px', 
              paddingTop: '12px', 
              borderTop: '1px solid var(--border-color)',
              fontSize: '13px',
              color: 'var(--success)',
              fontWeight: 600
            }}>
              <Tag size={14} />
              <span>No Cost EMI available from ₹{emiPrice.toLocaleString('en-IN')}/month. 100% Interest waiver.</span>
            </div>
          </div>

          {/* Color Selector */}
          <div style={{ marginBottom: '24px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, display: 'block', marginBottom: '8px' }}>
              Select Color: <span style={{ color: 'var(--text-muted)' }}>{selectedColor}</span>
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {device.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: selectedColor === color ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectedColor === color ? 'var(--bg-solid)' : 'var(--bg-subtle)',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 600,
                    transition: 'all 0.2s'
                  }}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Delivery & Pincode Checker */}
          <div style={{ 
            border: '1px solid var(--border-color)',
            borderRadius: '16px',
            padding: '16px',
            marginBottom: '24px'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
              <Truck size={16} style={{ color: 'var(--primary)' }} />
              <span>Delivery Serviceability Check</span>
            </span>
            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 505327)"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                className="input-field"
                style={{ padding: '8px 12px', fontSize: '13px' }}
                maxLength={6}
              />
              <button 
                type="submit" 
                className="premium-btn btn-primary"
                style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '13px' }}
              >
                Check
              </button>
            </form>

            {pincodeResult && (
              <div style={{ 
                marginTop: '12px', 
                padding: '10px 12px', 
                borderRadius: '8px', 
                backgroundColor: pincodeResult.serviceable ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                border: pincodeResult.serviceable ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                fontSize: '12px'
              }}>
                <div style={{ fontWeight: 'bold', color: pincodeResult.serviceable ? 'var(--success)' : 'var(--error)' }}>
                  {pincodeResult.serviceable ? `Serviceable - ${pincodeResult.locationName}` : 'Unserviceable'}
                </div>
                <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>
                  {pincodeResult.message}
                </div>
                {pincodeResult.serviceable && (
                  <div style={{ fontWeight: 600, color: 'var(--primary)', marginTop: '4px' }}>
                    Estimated Delivery: {getEstimatedDateString(pincodeResult.estimatedDays)}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
            <button
              onClick={handleAddToCart}
              disabled={device.stockCount === 0}
              className="premium-btn btn-secondary"
              style={{ flex: 1, padding: '12px', borderRadius: '12px', fontSize: '14px', opacity: device.stockCount === 0 ? 0.5 : 1 }}
            >
              <ShoppingCart size={16} />
              <span>Add to Cart</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={device.stockCount === 0}
              className="premium-btn btn-primary"
              style={{ flex: 1.5, padding: '12px', borderRadius: '12px', fontSize: '14px', opacity: device.stockCount === 0 ? 0.5 : 1 }}
            >
              <span>Buy Now</span>
            </button>
          </div>

          {/* WhatsApp Product Inquiry Button */}
          <button
            onClick={handleWhatsAppInquiry}
            className="premium-btn btn-secondary"
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              fontSize: '14px',
              borderColor: '#25D366',
              color: '#128C7E',
              backgroundColor: 'rgba(37, 211, 102, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: 700,
              marginBottom: '24px'
            }}
          >
            <MessageCircle size={16} fill="#25D366" style={{ color: '#128C7E' }} />
            <span>Inquire on WhatsApp</span>
          </button>

          {/* Toolbar Ops */}
          <div style={{ display: 'flex', gap: '20px', fontSize: '13px', color: 'var(--text-muted)' }}>
            <button
              onClick={() => toggleWishlist(device.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: isWishlisted ? 'var(--error)' : 'inherit' }}
            >
              <Heart size={16} fill={isWishlisted ? 'var(--error)' : 'none'} />
              <span>{isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
            </button>

            <button
              onClick={handleCompareClick}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: isCompared ? 'var(--primary)' : 'inherit' }}
            >
              <GitCompare size={16} />
              <span>{isCompared ? 'Comparing' : 'Compare Device'}</span>
            </button>

            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} />
              <span>{device.warranty}</span>
            </span>
          </div>

        </div>

      </div>

      {/* CLASSIFICATION SPECIFIC DETAILS */}
      <div className="glass-card" style={{ marginBottom: '40px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info style={{ color: 'var(--primary)' }} size={20} />
          <span>Device Condition & Inventory Details</span>
        </h2>
        
        {/* Brand New sealed details */}
        {device.deviceType === 'brand_new' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13px' }}>
            <div>Factory Sealed: <strong>{device.factorySealed ? 'Yes (Unopened Box)' : 'No'}</strong></div>
            <div>Invoice Available: <strong>{device.invoiceAvailable ? 'Yes (Official Store Receipt)' : 'No'}</strong></div>
            <div>Brand Warranty: <strong>{device.officialBrandWarrantyAvailable ? `${device.warrantyDuration} Brand Warranty` : 'No'}</strong></div>
            {device.launchDate && <div>Official Launch Date: <strong>{new Date(device.launchDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>}
          </div>
        )}

        {/* Used phone diagnostics */}
        {device.deviceType === 'used' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>Condition Grade: <strong>{getGradeText(device.deviceConditionGrade)}</strong></div>
              <div>Battery Health: <strong>{device.batteryHealth}%</strong></div>
              <div>Ownership: <strong style={{ textTransform: 'capitalize' }}>{device.ownershipDetails?.replace(/_/g, ' ')}</strong></div>
              <div>Usage Duration: <strong>{device.usedDuration}</strong></div>
              {device.originalPurchaseDate && <div>Original Purchase: <strong>{new Date(device.originalPurchaseDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</strong></div>}
              <div>Warranty Status: <strong>
                {device.currentWarrantyStatus === 'under_brand' && device.warrantyExpiryDate
                  ? `Active till ${getWarrantyExpiryString(device.warrantyExpiryDate)}`
                  : device.currentWarrantyStatus === 'under_extended' && device.warrantyExpiryDate
                  ? `Extended Warranty till ${getWarrantyExpiryString(device.warrantyExpiryDate)}`
                  : 'Warranty Expired'
                }
              </strong></div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {/* Accessory checks */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Accessories Included</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>Box Available: <strong>{device.boxAvailable ? 'Yes' : 'No'}</strong></li>
                  <li>Original Charger: <strong>{device.originalChargerAvailable ? 'Yes' : 'No'}</strong></li>
                  <li>Original USB Cable: <strong>{device.originalCableAvailable ? 'Yes' : 'No'}</strong></li>
                  <li>Earphones: <strong>{device.earphonesAvailable ? 'Yes' : 'No'}</strong></li>
                  <li>Back Cover: <strong>{device.backCoverAvailable ? 'Yes' : 'No'}</strong></li>
                  <li>Screen Guard Installed: <strong>{device.screenGuardApplied ? 'Yes' : 'No'}</strong></li>
                </ul>
              </div>

              {/* Hardware diagnostics */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Cosmetic Conditions</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li style={{ textTransform: 'capitalize' }}>Display Screen: <strong>{device.displayCondition?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Frame / Border: <strong>{device.frameCondition?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Back Glass Panel: <strong>{device.backPanelCondition?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Face ID / Fingerprint: <strong>{device.biometricStatus?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Camera Condition: <strong>{device.cameraCondition?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Speaker Sound: <strong>{device.speakerCondition?.replace('_', ' ')}</strong></li>
                </ul>
              </div>

              {/* Repairs & Notes */}
              <div>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px' }}>Repair Logs & Unlock</h4>
                <ul style={{ paddingLeft: '16px', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li style={{ textTransform: 'capitalize' }}>Carrier / SIM Lock: <strong>{device.networkLockStatus?.replace('_', ' ')}</strong></li>
                  <li style={{ textTransform: 'capitalize' }}>Repair History: <strong>{device.repairHistory?.replace('_', ' ')}</strong></li>
                  {device.repairDescription && <li>Repair notes: <em>{device.repairDescription}</em></li>}
                </ul>
              </div>
            </div>

            {/* Quality Checklist */}
            {device.qualityCheckStatus && device.qualityCheckStatus.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '10px' }}>SriSai Lab Quality Checklists (Pass Status)</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {device.qualityCheckStatus.map(chk => (
                    <span key={chk} style={{
                      fontSize: '11px',
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
                      color: 'var(--success)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 600,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Check size={10} strokeWidth={4} />
                      <span>{chk}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Open Box */}
        {device.deviceType === 'open_box' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13px' }}>
            <div>Box Included: <strong>{device.openBoxBoxAvailable ? 'Yes' : 'No'}</strong></div>
            <div>All Inbox Accessories: <strong>{device.openBoxAccessoriesAvailable ? 'Yes' : 'No'}</strong></div>
            <div>Remaining Warranty: <strong>{device.openBoxWarrantyRemaining}</strong></div>
            {device.openBoxActivationDate && <div>Activation Date: <strong>{new Date(device.openBoxActivationDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>}
            {device.openBoxReason && <div style={{ gridColumn: 'span 2' }}>Reason for Open Box: <em>{device.openBoxReason}</em></div>}
          </div>
        )}

        {/* Refurbished */}
        {device.deviceType === 'refurbished' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13px' }}>
            <div>Refurbished Grade: <strong>{device.refurbishedGrade}</strong></div>
            <div>Refurbished By: <strong>{device.refurbishedBy}</strong></div>
            <div>Warranty Offered: <strong>{device.refurbishedWarrantyOffered}</strong></div>
            {device.refurbishedDate && <div>Refurbishment Date: <strong>{new Date(device.refurbishedDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong></div>}
            {device.refurbishedPartsReplaced && <div style={{ gridColumn: 'span 2' }}>Parts Repaired / Replaced: <strong>{device.refurbishedPartsReplaced}</strong></div>}
          </div>
        )}

        {/* Demo Unit */}
        {device.deviceType === 'demo_unit' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', fontSize: '13px' }}>
            <div>Store Demo Duration: <strong>{device.demoStoreUsageDuration}</strong></div>
            <div>Total Screen Usage: <strong>{device.demoUsageHours}</strong></div>
            <div>Cosmetic State: <strong>{device.demoPhysicalCondition}</strong></div>
            <div>Warranty status: <strong>{device.demoWarrantyStatus}</strong></div>
          </div>
        )}

      </div>

      {/* Mid Section: Features Overview */}
      <div className="glass-card" style={{ marginBottom: '40px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles style={{ color: 'var(--accent)' }} size={20} />
          <span>Product Key Features</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {device.features.map((feature, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ 
                color: 'var(--success)', 
                backgroundColor: 'rgba(16, 185, 129, 0.1)', 
                borderRadius: '50%',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Check size={14} />
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.4 }}>{feature}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Specifications Table */}
      <div className="glass-card" style={{ marginBottom: '60px', padding: '24px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '20px' }}>Technical Specifications</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <tbody>
              {Object.entries(device.specifications).map(([key, value]) => (
                <tr key={key} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ 
                    padding: '12px', 
                    fontWeight: 700, 
                    color: 'var(--text-muted)', 
                    width: '200px',
                    textTransform: 'capitalize' 
                  }}>
                    {key.replace(/([A-Z])/g, ' $1')}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-main)' }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recommendations Slider: Related Devices */}
      {relatedProducts.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>More from {device.brand}</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {relatedProducts.map(d => (
              <div key={d.id} className="glass-card" onClick={() => navigateTo(`product/${d.id}`)} style={{ cursor: 'pointer', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <img src={d.images[0]} alt={d.modelName} style={{ height: '120px', objectFit: 'contain', margin: '10px auto' }} />
                <h4 style={{ fontSize: '14px', margin: '12px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.modelName}</h4>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>₹{d.offerPrice.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations Slider: Similar Price range */}
      {similarProducts.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>Similar Smartphones</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {similarProducts.map(d => (
              <div key={d.id} className="glass-card" onClick={() => navigateTo(`product/${d.id}`)} style={{ cursor: 'pointer', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <img src={d.images[0]} alt={d.modelName} style={{ height: '120px', objectFit: 'contain', margin: '10px auto' }} />
                <h4 style={{ fontSize: '14px', margin: '12px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.modelName}</h4>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>₹{d.offerPrice.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recommendations Slider: Recently Viewed */}
      {viewedDevices.length > 0 && (
        <section style={{ marginBottom: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '16px' }}>Recently Viewed Products</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
            gap: '20px' 
          }}>
            {viewedDevices.map(d => (
              <div key={d.id} className="glass-card" onClick={() => navigateTo(`product/${d.id}`)} style={{ cursor: 'pointer', padding: '16px', display: 'flex', flexDirection: 'column' }}>
                <img src={d.images[0]} alt={d.modelName} style={{ height: '120px', objectFit: 'contain', margin: '10px auto' }} />
                <h4 style={{ fontSize: '14px', margin: '12px 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.modelName}</h4>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px' }}>₹{d.offerPrice.toLocaleString('en-IN')}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Actions Bar */}
      <div 
        className="mobile-only"
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border-color)',
          padding: '12px 16px',
          zIndex: 100,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button
            onClick={handleWhatsAppInquiry}
            className="premium-btn btn-secondary"
            style={{ padding: '12px', borderRadius: '12px', borderColor: '#25D366', color: '#128C7E', backgroundColor: 'rgba(37, 211, 102, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', minWidth: '44px' }}
            title="Inquire on WhatsApp"
          >
            <MessageCircle size={18} fill="#25D366" style={{ color: '#128C7E' }} />
          </button>
          <button
            onClick={handleAddToCart}
            disabled={device.stockCount === 0}
            className="premium-btn btn-secondary"
            style={{ flex: 1, height: '44px', borderRadius: '12px', fontSize: '13px', opacity: device.stockCount === 0 ? 0.5 : 1 }}
          >
            Add to Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={device.stockCount === 0}
            className="premium-btn btn-primary"
            style={{ flex: 1.5, height: '44px', borderRadius: '12px', fontSize: '13px', opacity: device.stockCount === 0 ? 0.5 : 1 }}
          >
            Buy Now
          </button>
        </div>
      </div>

    </div>
  );
};
