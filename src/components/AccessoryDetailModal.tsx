import React, { useState } from 'react';
import { Accessory } from '../types';
import { useApp } from '../context/AppContext';
import { X, ShoppingCart, Heart, Send } from 'lucide-react';

interface AccessoryDetailModalProps {
  accessory: Accessory;
  onClose: () => void;
  onOpenCart: () => void;
}

export const AccessoryDetailModal: React.FC<AccessoryDetailModalProps> = ({
  accessory, onClose, onOpenCart
}) => {
  const { 
    addToCart, updateCartQty, toggleWishlist, wishlist, trackWhatsAppClick, whatsAppSettings 
  } = useApp();

  const [selectedColor, setSelectedColor] = useState(accessory.colors[0] || 'Default');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(accessory.images[0] || 'logo.jpg');

  const isWishlisted = wishlist.includes(accessory.id);

  const handleAddToCart = () => {
    addToCart(accessory.id, selectedColor);
    if (quantity > 1) {
      updateCartQty(accessory.id, selectedColor, quantity);
    }
    onOpenCart();
  };

  const handleBuyNow = () => {
    addToCart(accessory.id, selectedColor);
    if (quantity > 1) {
      updateCartQty(accessory.id, selectedColor, quantity);
    }
    onOpenCart();
  };

  const handleWhatsAppInquiry = () => {
    trackWhatsAppClick('product', accessory.id);
    
    // Build prefilled message replacing placeholders if customized, or use standard
    const productLink = `${window.location.origin}/#accessories?id=${accessory.id}`;
    let template = whatsAppSettings.customGreeting || 
      "Hello Sri Sai Mobiles,\nI am interested in this product:\n\nProduct Name: {product_name}\nPrice: ₹{price}\nProduct Link: {product_link}\n\nPlease provide more details.";
    
    const formattedMessage = template
      .replace(/{customer_name}/g, "Customer")
      .replace(/{product_name}/g, `${accessory.brand} ${accessory.name}`)
      .replace(/{variant}/g, selectedColor)
      .replace(/{price}/g, accessory.offerPrice.toString())
      .replace(/{order_id}/g, "N/A")
      .replace(/{cart_total}/g, accessory.offerPrice.toString())
      .replace(/{product_link}/g, productLink);

    const whatsappUrl = `https://wa.me/918688303048?text=${encodeURIComponent(formattedMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  const mrp = accessory.price;
  const price = accessory.offerPrice;
  const discountPercent = mrp > price ? Math.round(((mrp - price) / mrp) * 100) : 0;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(6px)', padding: '16px'
    }}>
      <div className="glass-card animate-scale-up accessory-modal-grid" style={{
        width: 'min(100%, 850px)', maxHeight: '90vh',
        overflowY: 'auto', borderRadius: '24px', padding: '24px',
        border: '1px solid var(--border-color)', position: 'relative',
        display: 'grid', gap: '24px'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px', zIndex: 10,
            border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer',
            padding: '8px', borderRadius: '50%', color: 'var(--text-main)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}
        >
          <X size={18} />
        </button>

        {/* Column 1: Images Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{
            position: 'relative', width: '100%', aspectRatio: '1',
            borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            <img 
              src={activeImage} 
              alt={accessory.name} 
              style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
            />
            {discountPercent > 0 && (
              <span style={{
                position: 'absolute', top: '12px', left: '12px',
                backgroundColor: 'var(--success)', color: 'white',
                fontSize: '11px', fontWeight: 800, padding: '4px 10px',
                borderRadius: '8px', boxShadow: 'var(--shadow-sm)'
              }}>
                {discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Thumbnails list */}
          {accessory.images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
              {accessory.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  style={{
                    width: '60px', height: '60px', borderRadius: '8px',
                    overflow: 'hidden', border: activeImage === img ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    padding: 0, cursor: 'pointer', flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Product Info details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
          <div>
            <span style={{
              fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
              backgroundColor: 'rgba(59,130,246,0.12)', color: 'var(--primary)',
              padding: '3px 8px', borderRadius: '6px'
            }}>
              {accessory.category.replace('_', ' ')}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginTop: '8px', color: 'var(--text-main)', lineHeight: 1.2 }}>
              {accessory.brand} {accessory.name}
            </h2>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Motto: We Value Your Money.</span>
          </div>

          {/* Pricing */}
          <div style={{
            display: 'flex', alignItems: 'baseline', gap: '10px',
            borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)',
            padding: '12px 0'
          }}>
            <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-main)' }}>₹{price.toLocaleString('en-IN')}</span>
            {discountPercent > 0 && (
              <>
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '15px' }}>₹{mrp.toLocaleString('en-IN')}</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold', fontSize: '13px' }}>Save ₹{(mrp - price).toLocaleString('en-IN')}</span>
              </>
            )}
          </div>

          {/* Colors Selection */}
          {accessory.colors.length > 0 && (
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Select Color Variant</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {accessory.colors.map(col => (
                  <button
                    key={col}
                    onClick={() => setSelectedColor(col)}
                    style={{
                      border: selectedColor === col ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: selectedColor === col ? 'rgba(59,130,246,0.06)' : 'var(--bg-subtle)',
                      color: selectedColor === col ? 'var(--primary)' : 'var(--text-main)',
                      padding: '6px 12px', borderRadius: '8px', cursor: 'pointer',
                      fontSize: '12px', fontWeight: 600
                    }}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector & Stock Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Order Quantity</span>
              <span style={{ fontSize: '12px', color: accessory.stockCount <= 5 ? 'var(--warning)' : 'var(--text-muted)' }}>
                {accessory.stockCount === 0 ? '❌ Out of Stock' : accessory.stockCount <= 5 ? `⚠️ Only ${accessory.stockCount} units remaining` : '🟢 In Stock'}
              </span>
            </div>
            {accessory.stockCount > 0 && (
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '6px' }}>
                <button 
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', cursor: 'pointer' }}
                >-</button>
                <span style={{ fontWeight: 'bold', width: '20px', textAlign: 'center' }}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(prev => Math.min(accessory.stockCount, prev + 1))}
                  style={{ width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)', cursor: 'pointer' }}
                >+</button>
              </div>
            )}
          </div>

          {/* Description & Features */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '13px', color: 'var(--text-main)', lineHeight: 1.4 }}>
              {accessory.description}
            </p>
            {accessory.features && accessory.features.length > 0 && (
              <ul style={{ fontSize: '12px', color: 'var(--text-muted)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {accessory.features.map((f, idx) => (
                  <li key={idx}>{f}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Technical Specifications Table */}
          {accessory.specifications && Object.keys(accessory.specifications).length > 0 && (
            <div style={{
              backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
              borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px'
            }}>
              <span style={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', borderBottom: '1px dashed var(--border-color)', paddingBottom: '4px' }}>
                Technical Details
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '12px' }}>
                {Object.entries(accessory.specifications).map(([key, val]) => (
                  <React.Fragment key={key}>
                    <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{val}</span>
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* Actions CTA buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '10px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={handleAddToCart}
                disabled={accessory.stockCount === 0}
                className="premium-btn btn-secondary"
                style={{ flex: 1, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '12px' }}
              >
                <ShoppingCart size={16} />
                <span>Add to Cart</span>
              </button>
              
              <button
                onClick={handleBuyNow}
                disabled={accessory.stockCount === 0}
                className="premium-btn btn-primary"
                style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', fontWeight: 'bold' }}
              >
                Buy Now
              </button>

              <button
                onClick={() => toggleWishlist(accessory.id)}
                style={{
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-subtle)',
                  color: isWishlisted ? 'var(--error)' : 'var(--text-muted)',
                  cursor: 'pointer', borderRadius: '12px', padding: '12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <Heart size={18} fill={isWishlisted ? 'var(--error)' : 'none'} />
              </button>
            </div>

            {/* WhatsApp Inquiry Button */}
            <button
              onClick={handleWhatsAppInquiry}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                backgroundColor: '#25D366', color: 'white', border: 'none', borderRadius: '12px',
                padding: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)', transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Send size={14} fill="white" />
              <span>Inquire & Order via WhatsApp</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
