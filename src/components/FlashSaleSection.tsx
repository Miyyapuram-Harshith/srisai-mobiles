import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FlashSale, Device } from '../types';
import { Flame, Timer, ShoppingBag } from 'lucide-react';

interface FlashSaleCardProps {
  sale: FlashSale;
  device: Device;
}

const FlashSaleCard: React.FC<FlashSaleCardProps> = ({ sale, device }) => {
  const { navigateTo, addToCart } = useApp();
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = Date.now();
      const end = new Date(sale.endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      const hStr = hours.toString().padStart(2, '0');
      const mStr = minutes.toString().padStart(2, '0');
      const sStr = seconds.toString().padStart(2, '0');

      setTimeLeft(`${hStr}:${mStr}:${sStr}`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [sale.endTime]);

  if (isExpired) return null;

  const stockRemaining = Math.max(0, sale.stockLimit - sale.soldCount);
  const percentSold = Math.round((sale.soldCount / sale.stockLimit) * 100);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(device.id, device.colors[0]);
    navigateTo('cart');
  };

  return (
    <div 
      onClick={() => navigateTo(`product/${device.id}`)}
      className="glass-card" 
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        overflow: 'hidden',
        border: '1px solid rgba(239, 68, 68, 0.15)'
      }}
    >
      {/* Top Banner Tag */}
      <div style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        backgroundColor: 'rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        color: 'var(--error)',
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '11px',
        fontWeight: 'bold',
        textTransform: 'uppercase'
      }}>
        <Flame size={12} fill="var(--error)" />
        <span>Save {sale.discountPercentage}%</span>
      </div>

      {/* Countdown Timer */}
      <div style={{
        position: 'absolute',
        top: '12px',
        right: '12px',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        color: '#f8fafc',
        padding: '4px 10px',
        borderRadius: '6px',
        fontSize: '12px',
        fontFamily: 'monospace',
        fontWeight: 'bold'
      }}>
        <Timer size={13} style={{ color: 'var(--accent)' }} />
        <span>{timeLeft}</span>
      </div>

      {/* Device Media */}
      <div style={{
        height: '180px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px 0',
        marginTop: '20px'
      }}>
        <img 
          src={device.images[0]} 
          alt={device.modelName} 
          style={{
            height: '100%',
            objectFit: 'contain',
            transition: 'transform 0.3s ease'
          }}
          className="product-img"
        />
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: '12px' }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{device.brand}</span>
        <h3 style={{ fontSize: '16px', margin: '4px 0 8px 0', height: '48px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {device.modelName} ({device.variant})
        </h3>

        {/* Pricing */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
          <span style={{ fontSize: '20px', fontWeight: 800, color: 'var(--error)' }}>
            ₹{device.offerPrice.toLocaleString('en-IN')}
          </span>
          <span style={{ fontSize: '14px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>
            ₹{device.price.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Sold / Stock Progress Bar */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, marginBottom: '6px' }}>
            <span style={{ color: 'var(--error)' }}>
              {stockRemaining <= 3 ? `Only ${stockRemaining} units left!` : `${stockRemaining} units in stock`}
            </span>
            <span style={{ color: 'var(--text-muted)' }}>{percentSold}% Sold</span>
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

        {/* Action Button */}
        <button 
          onClick={handleBuyNow}
          className="premium-btn btn-accent"
          style={{ width: '100%', padding: '10px', fontSize: '13px' }}
        >
          <ShoppingBag size={14} />
          <span>Claim Offer</span>
        </button>
      </div>
    </div>
  );
};

export const FlashSaleSection: React.FC = () => {
  const { flashSales, devices } = useApp();

  const activeSales = flashSales.filter(sale => {
    if (!sale.enabled) return false;
    const now = Date.now();
    const start = new Date(sale.startTime).getTime();
    const end = new Date(sale.endTime).getTime();
    return now >= start && now <= end && sale.soldCount < sale.stockLimit;
  });

  if (activeSales.length === 0) return null;

  return (
    <section style={{ margin: '40px 0' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--error)'
        }}>
          <Flame size={20} fill="var(--error)" />
        </div>
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: 800 }}>Limited Time Deals</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Grab these hot smartphone discounts before they sell out!</p>
        </div>
      </div>

      <div className="grid-responsive">
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
