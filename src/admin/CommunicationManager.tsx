import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Settings, Clock, BarChart2, ShieldCheck, MapPin, Upload, RefreshCw, Smartphone } from 'lucide-react';
import { WhatsAppSettings } from '../types';

export const CommunicationManager: React.FC = () => {
  const { 
    whatsAppSettings, setWhatsAppSettings, whatsAppAnalytics, clearWhatsAppAnalytics, devices, addAuditLog, currentUser 
  } = useApp();

  // Settings Forms states
  const [enabled, setEnabled] = useState(whatsAppSettings.enabled);
  const [countryCode, setCountryCode] = useState(whatsAppSettings.countryCode);
  const [salesNumber, setSalesNumber] = useState(whatsAppSettings.salesNumber);
  const [supportNumber, setSupportNumber] = useState(whatsAppSettings.supportNumber);
  const [warrantyNumber, setWarrantyNumber] = useState(whatsAppSettings.warrantyNumber);
  const [usedPhonesNumber, setUsedPhonesNumber] = useState(whatsAppSettings.usedPhonesNumber);
  const [enableProductInquiry, setEnableProductInquiry] = useState(whatsAppSettings.enableProductInquiry);
  const [enableCartSupport, setEnableCartSupport] = useState(whatsAppSettings.enableCartSupport);
  const [enableOrderSupport, setEnableOrderSupport] = useState(whatsAppSettings.enableOrderSupport);
  const [position, setPosition] = useState<WhatsAppSettings['position']>(whatsAppSettings.position);
  const [workingDays, setWorkingDays] = useState<string[]>(whatsAppSettings.workingDays);
  const [openingTime, setOpeningTime] = useState(whatsAppSettings.openingTime);
  const [closingTime, setClosingTime] = useState(whatsAppSettings.closingTime);
  const [productTemplate, setProductTemplate] = useState(whatsAppSettings.productTemplate);
  const [cartTemplate, setCartTemplate] = useState(whatsAppSettings.cartTemplate);
  const [orderTemplate, setOrderTemplate] = useState(whatsAppSettings.orderTemplate);
  const [generalTemplate, setGeneralTemplate] = useState(whatsAppSettings.generalTemplate);
  const [customIcon, setCustomIcon] = useState(whatsAppSettings.customIcon || '');

  // Days options
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Handle Working Days selection
  const handleDayToggle = (day: string) => {
    setWorkingDays(prev => 
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  // Icon upload converter
  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCustomIcon(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsAppSettings({
      enabled,
      countryCode,
      salesNumber,
      supportNumber,
      warrantyNumber,
      usedPhonesNumber,
      enableProductInquiry,
      enableCartSupport,
      enableOrderSupport,
      position,
      workingDays,
      openingTime,
      closingTime,
      productTemplate,
      cartTemplate,
      orderTemplate,
      generalTemplate,
      customIcon: customIcon || undefined
    });
    alert('WhatsApp Communication Settings saved successfully!');
    addAuditLog('Updated WhatsApp Communication & Support configurations', currentUser?.name || 'Admin');
  };

  // Reset Analytics
  const handleResetAnalytics = () => {
    if (window.confirm('Are you sure you want to clear WhatsApp widget click analytics?')) {
      clearWhatsAppAnalytics();
      alert('WhatsApp Analytics reset successfully!');
      addAuditLog('Reset WhatsApp support click metrics', currentUser?.name || 'Admin');
    }
  };

  // Resolve popular contact devices Names
  const popularDevices = Object.entries(whatsAppAnalytics.mostContactedProducts || {})
    .map(([id, count]) => {
      const d = devices.find(x => x.id === id);
      return {
        modelName: d ? d.modelName : id,
        brand: d ? d.brand : 'Unknown',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
      
      {/* LEFT COLUMN: EDITABLE SETTINGS FORM */}
      <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          <Settings size={20} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Configure WhatsApp Widget</h2>
        </div>

        {/* 1. Global Enable Toggles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ width: '16px', height: '16px' }} />
            <div>
              <strong>Enable Support Widget</strong>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Shows floating widget on storefront</div>
            </div>
          </label>
          
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>WIDGET POSITION</label>
            <select value={position} onChange={(e) => setPosition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
              <option value="bottom-right">Bottom Right Corner</option>
              <option value="bottom-left">Bottom Left Corner</option>
            </select>
          </div>
        </div>

        {/* 2. Routing department numbers */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>DEPARTMENT DIRECT ROUTING NUMBERS</span>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3.5fr', gap: '8px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Country Code</label>
              <input type="text" value={countryCode} onChange={(e) => setCountryCode(e.target.value)} className="input-field" placeholder="91" />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Sales Department WhatsApp</label>
              <input type="tel" value={salesNumber} onChange={(e) => setSalesNumber(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '8px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Customer Support WhatsApp</label>
              <input type="tel" value={supportNumber} onChange={(e) => setSupportNumber(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Warranty Claims WhatsApp</label>
              <input type="tel" value={warrantyNumber} onChange={(e) => setWarrantyNumber(e.target.value)} className="input-field" required />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pre-Owned Phones Expert WhatsApp</label>
            <input type="tel" value={usedPhonesNumber} onChange={(e) => setUsedPhonesNumber(e.target.value)} className="input-field" required />
          </div>
        </div>

        {/* 3. Business working hours */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>WORKING DAYS & HOURS</span>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {daysOfWeek.map(day => {
              const isSelected = workingDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => handleDayToggle(day)}
                  style={{
                    padding: '4px 10px', borderRadius: '6px', fontSize: '11px',
                    border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    color: isSelected ? 'var(--primary)' : 'var(--text-muted)',
                    cursor: 'pointer', fontWeight: isSelected ? 700 : 'normal'
                  }}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Opening Time (Shop Opens)</label>
              <input type="time" value={openingTime} onChange={(e) => setOpeningTime(e.target.value)} className="input-field" required />
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Closing Time (Shop Closes)</label>
              <input type="time" value={closingTime} onChange={(e) => setClosingTime(e.target.value)} className="input-field" required />
            </div>
          </div>
        </div>

        {/* 4. Message templates */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>CUSTOM TEXT MESSAGE TEMPLATES</span>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                <span>Product Page Inquiry Text</span>
                <input type="checkbox" checked={enableProductInquiry} onChange={(e) => setEnableProductInquiry(e.target.checked)} />
              </label>
              <textarea 
                value={productTemplate} onChange={(e) => setProductTemplate(e.target.value)} 
                className="input-field" style={{ height: '70px', padding: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                disabled={!enableProductInquiry}
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                <span>Cart Support Inquiry Text</span>
                <input type="checkbox" checked={enableCartSupport} onChange={(e) => setEnableCartSupport(e.target.checked)} />
              </label>
              <textarea 
                value={cartTemplate} onChange={(e) => setCartTemplate(e.target.value)} 
                className="input-field" style={{ height: '50px', padding: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                disabled={!enableCartSupport}
              />
            </div>

            <div>
              <label style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', marginBottom: '2px' }}>
                <span>Order Support Inquiry Text</span>
                <input type="checkbox" checked={enableOrderSupport} onChange={(e) => setEnableOrderSupport(e.target.checked)} />
              </label>
              <textarea 
                value={orderTemplate} onChange={(e) => setOrderTemplate(e.target.value)} 
                className="input-field" style={{ height: '60px', padding: '6px', fontSize: '11px', fontFamily: 'monospace' }}
                disabled={!enableOrderSupport}
              />
            </div>
            
            <div>
              <label style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '2px' }}>General Inquiry Text</label>
              <textarea 
                value={generalTemplate} onChange={(e) => setGeneralTemplate(e.target.value)} 
                className="input-field" style={{ height: '50px', padding: '6px', fontSize: '11px', fontFamily: 'monospace' }}
              />
            </div>
          </div>
        </div>

        {/* 5. Custom Upload Icon selector */}
        <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
          <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>CUSTOM WIDGET BRANDING ICON</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden'
            }}>
              {customIcon ? (
                <img src={customIcon} alt="Widget Brand Icon" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <MessageCircle size={20} style={{ color: '#25D366' }} />
              )}
            </div>
            
            <div style={{ flex: 1 }}>
              <input type="file" accept="image/*" id="widget-icon-uploader" onChange={handleIconUpload} style={{ display: 'none' }} />
              <label htmlFor="widget-icon-uploader" className="premium-btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                <Upload size={12} />
                <span>Upload Custom Image</span>
              </label>
              {customIcon && (
                <button type="button" onClick={() => setCustomIcon('')} style={{ border: 'none', background: 'none', color: 'var(--error)', marginLeft: '8px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }}>Reset to default</button>
              )}
            </div>
          </div>
        </div>

        <button type="submit" className="premium-btn btn-primary" style={{ padding: '10px 20px', width: '100%', borderRadius: '12px', fontSize: '13px' }}>
          Save WhatsApp Configurations
        </button>

      </form>

      {/* RIGHT COLUMN: ANALYTICS WIDGETS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* KPI strip clicks */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
          <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
              <span>WhatsApp Clicks Metrics</span>
            </span>
            
            <button onClick={handleResetAnalytics} className="premium-btn btn-secondary" style={{ padding: '4px 8px', fontSize: '10px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <RefreshCw size={10} />
              <span>Reset</span>
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{whatsAppAnalytics.totalClicks}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>TOTAL WIDGET CLICKS</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--success)' }}>{whatsAppAnalytics.productClicks}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>PRODUCT INQUIRIES</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#8b5cf6' }}>{whatsAppAnalytics.cartClicks}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>CART SUPPORT CLICKS</div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ec4899' }}>{whatsAppAnalytics.orderClicks}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, marginTop: '2px' }}>ORDER HELP CLICKS</div>
            </div>
          </div>
        </div>

        {/* Most Contacted Devices list */}
        <div className="glass-card" style={{ padding: '20px', borderRadius: '20px', flex: 1 }}>
          <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px' }}>
            <Smartphone size={16} style={{ color: 'var(--accent)' }} />
            <span>Most Contacted Devices Catalog</span>
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {popularDevices.length > 0 ? (
              popularDevices.map((d, index) => (
                <div 
                  key={index}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '13px'
                  }}
                >
                  <div>
                    <strong>{d.modelName}</strong>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Brand: {d.brand}</div>
                  </div>
                  <span style={{
                    fontSize: '11px', backgroundColor: 'rgba(37, 211, 102, 0.1)', color: '#128C7E',
                    padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold'
                  }}>
                    {d.count} Click(s)
                  </span>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '13px' }}>
                No device contact clicks logged yet.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
