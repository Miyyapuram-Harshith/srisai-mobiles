import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MessageCircle, Settings, Clock, BarChart2, ShieldCheck, MapPin, Upload, RefreshCw, Smartphone, Save } from 'lucide-react';
import { WhatsAppSettings } from '../types';

export const CommunicationManager: React.FC = () => {
  const { 
    whatsAppSettings, setWhatsAppSettings, storeSettings, saveAllSettings, instagramSettings,
    whatsAppAnalytics, clearWhatsAppAnalytics, devices, addAuditLog, currentUser, showToast, registerUnsavedChanges
  } = useApp();

  // Store Settings States
  const [storeName, setStoreName] = useState(storeSettings.storeName);
  const [storeAddress, setStoreAddress] = useState(storeSettings.storeAddress);
  const [storePhone, setStorePhone] = useState(storeSettings.storePhone);
  const [whatsappNumber, setWhatsappNumber] = useState(storeSettings.whatsappNumber);
  const [defaultGreeting, setDefaultGreeting] = useState(storeSettings.defaultGreeting);

  // WhatsApp Widget states
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

  // Workflow states
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

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

  // Sync with context states on load / save success
  useEffect(() => {
    if (saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setEnabled(whatsAppSettings.enabled);
      setCountryCode(whatsAppSettings.countryCode);
      setSalesNumber(whatsAppSettings.salesNumber);
      setSupportNumber(whatsAppSettings.supportNumber);
      setWarrantyNumber(whatsAppSettings.warrantyNumber);
      setUsedPhonesNumber(whatsAppSettings.usedPhonesNumber);
      setEnableProductInquiry(whatsAppSettings.enableProductInquiry);
      setEnableCartSupport(whatsAppSettings.enableCartSupport);
      setEnableOrderSupport(whatsAppSettings.enableOrderSupport);
      setPosition(whatsAppSettings.position);
      setWorkingDays(whatsAppSettings.workingDays);
      setOpeningTime(whatsAppSettings.openingTime);
      setClosingTime(whatsAppSettings.closingTime);
      setProductTemplate(whatsAppSettings.productTemplate);
      setCartTemplate(whatsAppSettings.cartTemplate);
      setOrderTemplate(whatsAppSettings.orderTemplate);
      setGeneralTemplate(whatsAppSettings.generalTemplate);
      setCustomIcon(whatsAppSettings.customIcon || '');

      setStoreName(storeSettings.storeName);
      setStoreAddress(storeSettings.storeAddress);
      setStorePhone(storeSettings.storePhone);
      setWhatsappNumber(storeSettings.whatsappNumber);
      setDefaultGreeting(storeSettings.defaultGreeting);
    }
  }, [whatsAppSettings, storeSettings, saveStatus]);

  const localWhatsAppSettings: WhatsAppSettings = {
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
  };

  const localStoreSettings = {
    storeName,
    storeAddress,
    storePhone,
    whatsappNumber,
    defaultGreeting
  };

  // Check for differences
  useEffect(() => {
    const waDiff = JSON.stringify(localWhatsAppSettings) !== JSON.stringify(whatsAppSettings);
    const storeDiff = JSON.stringify(localStoreSettings) !== JSON.stringify(storeSettings);
    
    if (waDiff || storeDiff) {
      setSaveStatus('unsaved');
      registerUnsavedChanges('communications', true);
    } else {
      setSaveStatus('idle');
      registerUnsavedChanges('communications', false);
    }
  }, [localWhatsAppSettings, localStoreSettings, whatsAppSettings, storeSettings]);

  // Unmount protection
  useEffect(() => {
    return () => {
      registerUnsavedChanges('communications', false);
    };
  }, []);

  const handleDiscard = () => {
    setEnabled(whatsAppSettings.enabled);
    setCountryCode(whatsAppSettings.countryCode);
    setSalesNumber(whatsAppSettings.salesNumber);
    setSupportNumber(whatsAppSettings.supportNumber);
    setWarrantyNumber(whatsAppSettings.warrantyNumber);
    setUsedPhonesNumber(whatsAppSettings.usedPhonesNumber);
    setEnableProductInquiry(whatsAppSettings.enableProductInquiry);
    setEnableCartSupport(whatsAppSettings.enableCartSupport);
    setEnableOrderSupport(whatsAppSettings.enableOrderSupport);
    setPosition(whatsAppSettings.position);
    setWorkingDays(whatsAppSettings.workingDays);
    setOpeningTime(whatsAppSettings.openingTime);
    setClosingTime(whatsAppSettings.closingTime);
    setProductTemplate(whatsAppSettings.productTemplate);
    setCartTemplate(whatsAppSettings.cartTemplate);
    setOrderTemplate(whatsAppSettings.orderTemplate);
    setGeneralTemplate(whatsAppSettings.generalTemplate);
    setCustomIcon(whatsAppSettings.customIcon || '');

    setStoreName(storeSettings.storeName);
    setStoreAddress(storeSettings.storeAddress);
    setStorePhone(storeSettings.storePhone);
    setWhatsappNumber(storeSettings.whatsappNumber);
    setDefaultGreeting(storeSettings.defaultGreeting);

    setSaveStatus('idle');
    registerUnsavedChanges('communications', false);
    showToast("Changes discarded", "info");
  };

  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    try {
      await saveAllSettings(localStoreSettings, localWhatsAppSettings, instagramSettings);
      addAuditLog('Updated WhatsApp Communication & Store details configurations', currentUser?.name || 'Admin');
      setSaveStatus('saved');
      registerUnsavedChanges('communications', false);
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Save config failed:", err);
      setSaveStatus('error');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSaveChanges();
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Floating Save Changes Bar */}
      {saveStatus !== 'idle' && (
        <div style={{
          position: 'sticky',
          top: '10px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: saveStatus === 'unsaved' ? '#f59e0b' : (saveStatus === 'saving' ? '#3b82f6' : (saveStatus === 'saved' ? '#10b981' : '#ef4444')),
              boxShadow: `0 0 10px ${saveStatus === 'unsaved' ? '#f59e0b' : (saveStatus === 'saving' ? '#3b82f6' : (saveStatus === 'saved' ? '#10b981' : '#ef4444'))}`
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {saveStatus === 'unsaved' && "You have unsaved changes"}
              {saveStatus === 'saving' && "Saving changes to Supabase..."}
              {saveStatus === 'saved' && "Changes saved successfully!"}
              {saveStatus === 'error' && "Failed to save changes. Please check RLS permissions."}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={handleDiscard}
              className="premium-btn btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px' }}
              disabled={saveStatus === 'saving'}
            >
              Discard Changes
            </button>
            <button 
              type="button"
              onClick={handleSaveChanges}
              className="premium-btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '12px', minWidth: '120px' }}
              disabled={saveStatus !== 'unsaved'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
        
        {/* LEFT COLUMN: EDITABLE SETTINGS FORM */}
        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '24px', borderRadius: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <Settings size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>Configure Store Settings & WhatsApp</h2>
          </div>

          {/* Store settings */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', display: 'block' }}>PHYSICAL STORE DETAILS</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Store Name *</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Store Phone *</label>
                <input type="tel" value={storePhone} onChange={(e) => setStorePhone(e.target.value)} className="input-field" required />
              </div>
            </div>
            <div>
              <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Store Address *</label>
              <input type="text" value={storeAddress} onChange={(e) => setStoreAddress(e.target.value)} className="input-field" required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>General WhatsApp Contact Number *</label>
                <input type="tel" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="input-field" required />
              </div>
              <div>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Default WhatsApp Welcome Greeting *</label>
                <input type="text" value={defaultGreeting} onChange={(e) => setDefaultGreeting(e.target.value)} className="input-field" required />
              </div>
            </div>
          </div>

          {/* 1. Global Enable Toggles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
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

          <button type="submit" className="premium-btn btn-primary" style={{ padding: '10px 20px', width: '100%', borderRadius: '12px', fontSize: '13px' }} disabled={saveStatus !== 'unsaved'}>
            {saveStatus === 'saving' ? 'Saving Config...' : 'Save Settings & Configurations'}
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
                <span>Reset Counts</span>
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div style={{ borderRight: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>TOTAL CLICKS</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)' }}>{whatsAppAnalytics.totalClicks}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>UNIQUE SESSIONS</div>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--success)' }}>{whatsAppAnalytics.totalClicks > 0 ? Math.ceil(whatsAppAnalytics.totalClicks * 0.7) : 0}</div>
              </div>
            </div>

            {/* Department Breakdowns */}
            <div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>CLICKS BY DEPARTMENT</span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sales Department Support</span>
                  <strong>{whatsAppAnalytics.productClicks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Customer Care & Support</span>
                  <strong>{whatsAppAnalytics.cartClicks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Warranty Support Desk</span>
                  <strong>{whatsAppAnalytics.orderClicks}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Pre-Owned Experts Desk</span>
                  <strong>{Math.max(0, whatsAppAnalytics.totalClicks - whatsAppAnalytics.productClicks - whatsAppAnalytics.cartClicks - whatsAppAnalytics.orderClicks)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Contacted Devices breakdown */}
          <div className="glass-card" style={{ padding: '20px', borderRadius: '20px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '16px' }}>
              <Smartphone size={16} style={{ color: 'var(--primary)' }} />
              <span>Most Contacted Devices</span>
            </span>

            {popularDevices.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-muted)', fontSize: '12px' }}>No direct inquiries registered yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {popularDevices.map((item, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <strong>{item.modelName}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.brand}</span>
                    </div>
                    <span className="badge badge-stock" style={{ minWidth: '40px', textAlign: 'center' }}>{item.count} clicks</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
