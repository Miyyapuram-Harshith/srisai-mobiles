import React from 'react';
import { useApp } from '../context/AppContext';
import { X, Check, ArrowRight, GitCompare } from 'lucide-react';

interface ProductCompareProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductCompare: React.FC<ProductCompareProps> = ({ isOpen, onClose }) => {
  const { comparisonList, devices, removeFromCompare, addToCart, navigateTo } = useApp();

  if (!isOpen) return null;

  const compareDevices = devices.filter(d => comparisonList.includes(d.id));

  // Specs Parsing Helper Functions
  const parseNum = (str: string): number => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const getBestValue = (rowType: string): any => {
    if (compareDevices.length === 0) return null;

    if (rowType === 'price') {
      const minPrice = Math.min(...compareDevices.map(d => d.offerPrice));
      return minPrice;
    }

    if (rowType === 'ram') {
      const maxRam = Math.max(...compareDevices.map(d => parseNum(d.ram)));
      return maxRam;
    }

    if (rowType === 'storage') {
      const maxStorage = Math.max(...compareDevices.map(d => parseNum(d.storage)));
      return maxStorage;
    }

    if (rowType === 'battery') {
      const maxBattery = Math.max(...compareDevices.map(d => parseNum(d.battery)));
      return maxBattery;
    }

    if (rowType === 'weight') {
      const minWeight = Math.min(...compareDevices.map(d => parseNum(d.weight)));
      return minWeight;
    }

    if (rowType === 'charging') {
      const maxCharging = Math.max(...compareDevices.map(d => parseNum(d.charging)));
      return maxCharging;
    }

    return null;
  };

  const bestPrice = getBestValue('price');
  const bestRam = getBestValue('ram');
  const bestStorage = getBestValue('storage');
  const bestBattery = getBestValue('battery');
  const bestWeight = getBestValue('weight');
  const bestCharging = getBestValue('charging');

  const isBest = (device: any, rowType: string): boolean => {
    if (compareDevices.length <= 1) return false;

    if (rowType === 'price') return device.offerPrice === bestPrice;
    if (rowType === 'ram') return parseNum(device.ram) === bestRam;
    if (rowType === 'storage') return parseNum(device.storage) === bestStorage;
    if (rowType === 'battery') return parseNum(device.battery) === bestBattery;
    if (rowType === 'weight') return parseNum(device.weight) === bestWeight;
    if (rowType === 'charging') return parseNum(device.charging) === bestCharging;

    return false;
  };

  const handleQuickBuy = (deviceId: string, color: string) => {
    addToCart(deviceId, color);
    onClose();
    navigateTo('cart');
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--overlay-bg)',
      backdropFilter: 'blur(8px)',
      padding: '20px'
    }} className="animate-fade">
      
      <div className="glass animate-slide" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 'var(--glass-shadow)',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <GitCompare style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Compare Devices</h2>
            <span style={{
              fontSize: '12px',
              backgroundColor: 'var(--bg-subtle)',
              padding: '2px 8px',
              borderRadius: '12px',
              fontWeight: 600
            }}>
              {compareDevices.length} / 4 Devices
            </span>
          </div>
          <button 
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--bg-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        {compareDevices.length === 0 ? (
          <div style={{
            padding: '80px 20px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '12px',
            color: 'var(--text-muted)'
          }}>
            <GitCompare size={48} strokeWidth={1} />
            <p>No products selected for comparison.</p>
            <p style={{ fontSize: '13px' }}>Select comparison on device cards to review differences side-by-side.</p>
            <button 
              onClick={onClose}
              className="premium-btn btn-primary"
              style={{ borderRadius: '20px', fontSize: '13px', marginTop: '10px' }}
            >
              Browse Products
            </button>
          </div>
        ) : (
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px'
          }}>
            
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              fontSize: '13px'
            }}>
              <thead>
                <tr>
                  <th style={{ width: '180px', padding: '12px', borderBottom: '2px solid var(--border-color)' }}>Specifications</th>
                  {compareDevices.map(d => (
                    <th key={d.id} style={{ 
                      padding: '12px', 
                      borderBottom: '2px solid var(--border-color)',
                      verticalAlign: 'top',
                      position: 'relative'
                    }}>
                      <button 
                        onClick={() => removeFromCompare(d.id)}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: 'var(--text-muted)'
                        }}
                      >
                        <X size={14} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '8px' }}>
                        <img 
                          src={d.images[0] || 'logo.jpg'} 
                          alt={d.modelName} 
                          style={{ height: '80px', objectFit: 'contain' }}
                        />
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{d.modelName}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.brand} • {d.variant}</div>
                        </div>
                      </div>
                    </th>
                  ))}
                  {/* Fill empty comparison slots */}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => (
                    <th key={i} style={{ 
                      padding: '12px', 
                      borderBottom: '2px solid var(--border-color)',
                      color: 'var(--text-muted)',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      backgroundColor: 'rgba(255,255,255,0.01)'
                    }}>
                      <div style={{ 
                        border: '2px dashed var(--border-color)', 
                        borderRadius: '12px',
                        padding: '30px 10px',
                        fontSize: '12px'
                      }}>
                        Add another device
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* Price Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Price</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'price');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        <span style={{ color: best ? 'var(--success)' : 'inherit' }}>
                          ₹{d.offerPrice.toLocaleString('en-IN')}
                        </span>
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Best Price</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* RAM Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>RAM Memory</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'ram');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        {d.ram}
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Highest</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Storage Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Storage Space</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'storage');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        {d.storage}
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Highest</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Display Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Display Specs</td>
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      {d.display}
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Processor Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Processor</td>
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      {d.processor}
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Battery Capacity Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Battery Capacity</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'battery');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        {d.battery}
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Largest</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Charging Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Charging Tech</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'charging');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        {d.charging}
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Fastest</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Cameras Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Camera Setup</td>
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      {d.cameras}
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Weight Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Weight</td>
                  {compareDevices.map(d => {
                    const best = isBest(d, 'weight');
                    return (
                      <td key={d.id} style={{ 
                        padding: '16px 12px', 
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: best ? 'rgba(16, 185, 129, 0.08)' : 'transparent',
                        fontWeight: best ? 700 : 'normal'
                      }}>
                        {d.weight}
                        {best && <span style={{ fontSize: '10px', display: 'block', color: 'var(--success)' }}>Lightest</span>}
                      </td>
                    );
                  })}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Connectivity Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Connectivity</td>
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      {d.specifications.connectivity}
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Warranty Row */}
                <tr>
                  <td style={{ fontWeight: 600, padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>Warranty</td>
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '16px 12px', borderBottom: '1px solid var(--border-color)' }}>
                      {d.warranty}
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} style={{ borderBottom: '1px solid var(--border-color)' }} />)}
                </tr>

                {/* Action Buttons Row */}
                <tr>
                  <td style={{ padding: '20px 12px' }} />
                  {compareDevices.map(d => (
                    <td key={d.id} style={{ padding: '20px 12px' }}>
                      <button
                        onClick={() => handleQuickBuy(d.id, d.colors[0])}
                        disabled={d.stockCount === 0}
                        className="premium-btn btn-primary"
                        style={{
                          width: '100%',
                          padding: '10px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          opacity: d.stockCount === 0 ? 0.5 : 1
                        }}
                      >
                        Buy Now
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 4 - compareDevices.length }).map((_, i) => <td key={i} />)}
                </tr>
              </tbody>
            </table>

          </div>
        )}

      </div>
    </div>
  );
};
