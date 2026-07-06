import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, X, Check, Clock, HeartHandshake, PhoneCall, Smartphone } from 'lucide-react';

export const WhatsAppWidget: React.FC = () => {
  const { 
    whatsAppSettings, trackWhatsAppClick, currentRoute, devices, accessories, cart, orders, currentUser 
  } = useApp();

  const [isOpen, setIsOpen] = useState(false);
  const [pulseActive, setPulseActive] = useState(false);

  // Trigger pulse animation every 15 seconds
  useEffect(() => {
    if (!whatsAppSettings?.enabled) return;

    const interval = setInterval(() => {
      setPulseActive(true);
      setTimeout(() => setPulseActive(false), 2000); // Pulse duration 2s
    }, 15000);

    return () => clearInterval(interval);
  }, [whatsAppSettings]);

  if (!whatsAppSettings || !whatsAppSettings.enabled) return null;

  // 1. BUSINESS HOURS CHECK
  const checkIsWorkingHours = (): boolean => {
    try {
      const now = new Date();
      // Days Array mapping: ["Sunday", "Monday", ...]
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const currentDayName = days[now.getDay()];

      // Check working days
      if (!whatsAppSettings.workingDays.includes(currentDayName)) {
        return false;
      }

      // Check hours
      const openParts = whatsAppSettings.openingTime.split(':').map(Number);
      const closeParts = whatsAppSettings.closingTime.split(':').map(Number);

      const openMinutes = openParts[0] * 60 + (openParts[1] || 0);
      const closeMinutes = closeParts[0] * 60 + (closeParts[1] || 0);
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      return currentMinutes >= openMinutes && currentMinutes <= closeMinutes;
    } catch (e) {
      return true; // Fallback to online
    }
  };

  const isOnline = checkIsWorkingHours();

  // 2. RESOLVE CONTEXTUAL PRE-FILLED MESSAGES
  const getContextMessage = (category: string): string => {
    let template = whatsAppSettings.customGreeting || whatsAppSettings.generalTemplate;
    
    // If not customized, choose context-specific template
    if (!whatsAppSettings.customGreeting) {
      if (currentRoute.startsWith('product/') && whatsAppSettings.enableProductInquiry) {
        template = whatsAppSettings.productTemplate;
      } else if (currentRoute === 'cart' && whatsAppSettings.enableCartSupport && cart.length > 0) {
        template = whatsAppSettings.cartTemplate;
      } else if (orders.length > 0 && whatsAppSettings.enableOrderSupport) {
        template = whatsAppSettings.orderTemplate;
      }
    }

    const customer_name = currentUser?.name || "Customer";
    let product_name = "N/A";
    let variant = "N/A";
    let price = "0";
    let product_link = window.location.href;

    if (currentRoute.startsWith('product/')) {
      const deviceId = currentRoute.split('/')[1];
      const device = devices.find(d => d.id === deviceId);
      if (device) {
        product_name = `${device.brand} ${device.modelName}`;
        variant = device.variant || "Default";
        price = device.offerPrice.toLocaleString('en-IN');
        product_link = `${window.location.origin}/#product/${device.id}`;
      }
    } else if (currentRoute.includes('accessories?id=')) {
      const id = new URLSearchParams(window.location.hash.split('?')[1] || '').get('id');
      const accessory = accessories?.find(a => a.id === id);
      if (accessory) {
        product_name = `${accessory.brand} ${accessory.name}`;
        variant = accessory.colors[0] || "Default";
        price = accessory.offerPrice.toLocaleString('en-IN');
        product_link = `${window.location.origin}/#accessories?id=${accessory.id}`;
      }
    }

    const lastOrder = orders[0];
    const order_id = lastOrder ? lastOrder.id : "N/A";

    const cartTotalVal = cart.reduce((acc, item) => {
      const d = devices.find(x => x.id === item.deviceId);
      const a = !d ? accessories?.find(y => y.id === item.deviceId) : null;
      return acc + ((d?.offerPrice || a?.offerPrice || 0) * item.quantity);
    }, 0);
    const cart_total = cartTotalVal.toLocaleString('en-IN');

    const cartItemsStr = cart.map(item => {
      const d = devices.find(x => x.id === item.deviceId);
      const a = !d ? accessories?.find(y => y.id === item.deviceId) : null;
      return (d || a) ? `- ${d?.brand || a?.brand} ${d?.modelName || a?.name} (${item.selectedColor}) x${item.quantity}` : '';
    }).filter(Boolean).join('\n');

    let text = template
      .replace(/{customer_name}/g, customer_name)
      .replace(/{product_name}/g, product_name)
      .replace(/{variant}/g, variant)
      .replace(/{price}/g, price)
      .replace(/{order_id}/g, order_id)
      .replace(/{cart_total}/g, cart_total)
      .replace(/{cart_items}/g, cartItemsStr)
      .replace(/{product_link}/g, product_link)
      .replace(/{link}/g, product_link);

    return text;
  };

  // Click Action: Launch WhatsApp web / native deep link
  const handleDepartmentClick = (dept: 'sales' | 'support' | 'warranty' | 'used') => {
    let number = whatsAppSettings.salesNumber;
    let category: 'product' | 'cart' | 'order' | 'general' = 'general';

    // Map Category
    if (currentRoute.startsWith('product/')) category = 'product';
    else if (currentRoute === 'cart') category = 'cart';
    else if (orders.length > 0) category = 'order';

    if (dept === 'support') number = whatsAppSettings.supportNumber;
    else if (dept === 'warranty') number = whatsAppSettings.warrantyNumber;
    else if (dept === 'used') number = whatsAppSettings.usedPhonesNumber;

    const messageText = getContextMessage(category);
    const countryCode = whatsAppSettings.countryCode || '91';
    
    // Increment Analytics clicks
    const activeDeviceId = currentRoute.startsWith('product/') ? currentRoute.split('/')[1] : undefined;
    trackWhatsAppClick(category, activeDeviceId);

    // native app link trigger
    const url = `https://api.whatsapp.com/send?phone=${countryCode}${number}&text=${encodeURIComponent(messageText)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  // CSS injected dynamic styles
  const widgetStyles = `
    @keyframes floatAnimation {
      0% { transform: translateY(0px); }
      50% { transform: translateY(-8px); }
      100% { transform: translateY(0px); }
    }
    @keyframes pulseRing {
      0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
      70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
      100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
    }
    .whatsapp-float-btn {
      position: fixed;
      bottom: 24px;
      z-index: 90;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #25D366 0%, #128C7E 100%);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 50px;
      box-shadow: 0 10px 25px rgba(18, 140, 126, 0.4);
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      animation: floatAnimation 3s ease-in-out infinite;
      height: 52px;
      padding: 0 16px;
      gap: 8px;
    }
    .whatsapp-float-btn.pulse-active {
      animation: floatAnimation 3s ease-in-out infinite, pulseRing 2s infinite;
    }
    .whatsapp-float-btn:hover {
      transform: translateY(-5px) scale(1.05);
      box-shadow: 0 15px 30px rgba(18, 140, 126, 0.5);
    }
    .whatsapp-label {
      max-width: 0;
      overflow: hidden;
      white-space: nowrap;
      transition: max-width 0.3s ease;
      font-weight: 700;
      font-size: 13px;
    }
    .whatsapp-float-btn:hover .whatsapp-label {
      max-width: 150px;
    }
    @media (max-width: 768px) {
      .whatsapp-float-btn {
        width: 52px;
        padding: 0;
      }
      .whatsapp-label {
        display: none !important;
      }
    }
  `;

  const isPositionRight = whatsAppSettings.position === 'bottom-right';

  return (
    <>
      <style>{widgetStyles}</style>

      {/* FLOATING WIDGET POPOVER DEPARTMENTS SELECTOR */}
      {isOpen && (
        <div 
          className="glass-card animate-slide"
          style={{
            position: 'fixed',
            bottom: '90px',
            right: isPositionRight ? '24px' : 'auto',
            left: !isPositionRight ? '24px' : 'auto',
            width: '320px',
            borderRadius: '20px',
            boxShadow: 'var(--glass-shadow)',
            border: '1px solid var(--border-color)',
            zIndex: 95,
            overflow: 'hidden'
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #128C7E 0%, #075E54 100%)',
            color: 'white',
            padding: '16px 20px',
            position: 'relative'
          }}>
            <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800 }}>SriSai Customer Support</h4>
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', opacity: 0.85 }}>
              Choose a department below to start chat:
            </p>
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', right: '12px', top: '16px', background: 'none', 
                border: 'none', color: 'white', cursor: 'pointer', opacity: 0.8
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Working hours indicator banner */}
          <div style={{
            backgroundColor: isOnline ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            borderBottom: '1px solid var(--border-color)',
            padding: '10px 20px',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: isOnline ? 'var(--success)' : 'var(--error)',
            fontWeight: 600
          }}>
            <Clock size={12} />
            <span>
              {isOnline 
                ? 'We are online. How can we help you?' 
                : "We are currently offline. We'll reply as soon as possible."
              }
            </span>
          </div>

          {/* Departments selector list */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            
            {/* Sales Department */}
            <button
              onClick={() => handleDepartmentClick('sales')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)',
                background: 'var(--card-bg)', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(59, 130, 246, 0.12)',
                color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <PhoneCall size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Sales Department</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mobiles availability, exchange inquiries</div>
              </div>
            </button>

            {/* Customer Support */}
            <button
              onClick={() => handleDepartmentClick('support')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)',
                background: 'var(--card-bg)', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--success)', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <HeartHandshake size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Customer Support</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Order status, billing help, payments</div>
              </div>
            </button>

            {/* Warranty Claims */}
            <button
              onClick={() => handleDepartmentClick('warranty')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)',
                background: 'var(--card-bg)', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(139, 92, 246, 0.12)',
                color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Clock size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Warranty Claims</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Official claims, extended warranties</div>
              </div>
            </button>

            {/* Used/Refurbished Expert */}
            <button
              onClick={() => handleDepartmentClick('used')}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%',
                padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-color)',
                background: 'var(--card-bg)', cursor: 'pointer', textAlign: 'left',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.12)',
                color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Smartphone size={14} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)' }}>Pre-Owned Phones</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Diagnostics logs, condition evaluations</div>
              </div>
            </button>

          </div>
        </div>
      )}

      {/* FLOATING ACTION BUTTON */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`whatsapp-float-btn ${pulseActive ? 'pulse-active' : ''}`}
        style={{
          right: isPositionRight ? '24px' : 'auto',
          left: !isPositionRight ? '24px' : 'auto',
          backgroundColor: '#25D366'
        }}
      >
        {whatsAppSettings.customIcon ? (
          <img 
            src={whatsAppSettings.customIcon} 
            alt="WhatsApp Icon" 
            style={{ width: '22px', height: '22px', borderRadius: '50%' }}
          />
        ) : (
          <MessageCircle size={22} fill="white" />
        )}
        <span className="whatsapp-label">Chat on WhatsApp</span>
      </button>
    </>
  );
};
