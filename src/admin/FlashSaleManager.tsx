import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FlashSale } from '../types';
import { Plus, Trash, X, Calendar, Flame, AlertCircle, Save } from 'lucide-react';
import { api } from '../lib/api-client';

// Helper to format Date into local YYYY-MM-DDTHH:mm for datetime-local input
const toLocalDatetime = (dateInput: string | Date | number): string => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const FlashSaleManager: React.FC = () => {
  const { flashSales, devices, showToast, registerUnsavedChanges, refetchFlashSales } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSale, setEditingSale] = useState<FlashSale | null>(null);

  // Form states
  const [deviceId, setDeviceId] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [stockLimit, setStockLimit] = useState(5);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [enabled, setEnabled] = useState(true);

  // Buffer and Edit states
  const [localSales, setLocalSales] = useState<FlashSale[]>([]);
  const [deletedSaleIds, setDeletedSaleIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

  // Sync with context on load / save success
  useEffect(() => {
    if (saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setLocalSales(flashSales);
      setDeletedSaleIds([]);
    }
  }, [flashSales, saveStatus]);

  // Check for unsaved changes
  useEffect(() => {
    const hasDiff = JSON.stringify(localSales) !== JSON.stringify(flashSales)
      || deletedSaleIds.length > 0;
      
    if (hasDiff) {
      setSaveStatus('unsaved');
      registerUnsavedChanges('flash_sales', true);
    } else {
      setSaveStatus('idle');
      registerUnsavedChanges('flash_sales', false);
    }
  }, [localSales, deletedSaleIds, flashSales]);

  // Unmount protection
  useEffect(() => {
    return () => {
      registerUnsavedChanges('flash_sales', false);
    };
  }, []);

  const activeSales = localSales.filter(fs => devices.find(d => d.id === fs.deviceId)?.status !== 'archived');

  const openAddModal = () => {
    setEditingSale(null);
    const available = devices.filter(d => d.status !== 'archived');
    setDeviceId(available[0]?.id || '');
    setDiscountPercentage(15);
    setStockLimit(5);

    const now = new Date();
    const nowLocal = toLocalDatetime(now);
    const futureLocal = toLocalDatetime(new Date(now.getTime() + 24 * 3600000)); // Default 24 hours

    setStartTime(nowLocal);
    setEndTime(futureLocal);
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (fs: FlashSale) => {
    setEditingSale(fs);
    setDeviceId(fs.deviceId);
    setDiscountPercentage(fs.discountPercentage);
    setStockLimit(fs.stockLimit);
    setStartTime(toLocalDatetime(fs.startTime));
    setEndTime(toLocalDatetime(fs.endTime));
    setEnabled(fs.enabled);
    setIsModalOpen(true);
  };

  const handleStartTimeChange = (newVal: string) => {
    setStartTime(newVal);
    if (newVal) {
      const startMs = new Date(newVal).getTime();
      const endMs = new Date(endTime).getTime();
      if (isNaN(endMs) || endMs <= startMs) {
        setEndTime(toLocalDatetime(new Date(startMs + 24 * 3600000)));
      }
    }
  };

  const setDurationPreset = (hours: number) => {
    const baseMs = startTime ? new Date(startTime).getTime() : Date.now();
    const newEndMs = baseMs + hours * 3600000;
    setEndTime(toLocalDatetime(new Date(newEndMs)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceId || !startTime || !endTime) {
      alert('Please fill out all required flash sale fields.');
      return;
    }

    const nowMs = Date.now();
    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();

    if (isNaN(startMs) || isNaN(endMs)) {
      alert('Please enter valid start and end dates.');
      return;
    }

    // Minimum start time check: cannot be in the past for new sales (allow 60s buffer)
    if (!editingSale && startMs < nowMs - 60000) {
      alert('Start time cannot be in the past. It must be set from now onwards.');
      return;
    }

    if (endMs <= startMs) {
      alert('End time must be after the start time.');
      return;
    }

    if (endMs <= nowMs) {
      alert('End time cannot be in the past. It must be in the future.');
      return;
    }

    if (discountPercentage <= 0 || discountPercentage >= 100) {
      alert('Discount percentage must be between 1 and 99.');
      return;
    }

    if (stockLimit <= 0) {
      alert('Total stock limit must be at least 1.');
      return;
    }

    const id = editingSale?.id || `fs-temp-${Date.now()}`;
    const newOrUpdated: FlashSale = {
      id,
      deviceId,
      discountPercentage: Number(discountPercentage),
      stockLimit: Number(stockLimit),
      startTime: new Date(startTime).toISOString(),
      endTime: new Date(endTime).toISOString(),
      enabled,
      soldCount: editingSale?.soldCount || 0
    };

    if (editingSale) {
      setLocalSales(prev => prev.map(fs => fs.id === editingSale.id ? newOrUpdated : fs));
    } else {
      setLocalSales(prev => [...prev, newOrUpdated]);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this flash sale deal?")) {
      setLocalSales(prev => prev.filter(fs => fs.id !== id));
      if (!id.startsWith('fs-temp-') && flashSales.some(fs => fs.id === id)) {
        setDeletedSaleIds(prev => [...prev, id]);
      }
      showToast("Campaign removed locally", "info");
    }
  };

  const handleDiscard = () => {
    setLocalSales(flashSales);
    setDeletedSaleIds([]);
    setSaveStatus('idle');
    registerUnsavedChanges('flash_sales', false);
    showToast("Changes discarded", "info");
  };

  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    try {
      // 1. Delete
      for (const id of deletedSaleIds) {
        await api.delete(`/api/flash-sales/${encodeURIComponent(id)}`);
      }
      
      // 2. Insert/Update
      for (const fs of localSales) {
        const dbSale = {
          device_id: fs.deviceId,
          product_id: fs.deviceId,
          discount_percentage: fs.discountPercentage,
          stock_limit: fs.stockLimit,
          start_time: fs.startTime,
          end_time: fs.endTime,
          enabled: fs.enabled ? 1 : 0,
          sold_count: fs.soldCount
        };
        
        if (fs.id.startsWith('fs-temp-')) {
          await api.post('/api/flash-sales', dbSale);
        } else {
          await api.put(`/api/flash-sales/${encodeURIComponent(fs.id)}`, dbSale);
        }
      }
      
      await refetchFlashSales();
      setSaveStatus('saved');
      registerUnsavedChanges('flash_sales', false);
      showToast("Flash sales saved successfully!", "success");
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Failed to save flash sales:", err);
      setSaveStatus('error');
      showToast("Failed to save campaigns: " + err.message, "error");
    }
  };

  const getStatusText = (fs: FlashSale): { text: string; color: string } => {
    if (!fs.enabled) return { text: 'Disabled', color: 'var(--text-muted)' };
    const now = Date.now();
    const start = new Date(fs.startTime).getTime();
    const end = new Date(fs.endTime).getTime();

    if (fs.soldCount >= fs.stockLimit) return { text: 'Sold Out', color: 'var(--error)' };
    if (now < start) return { text: 'Scheduled', color: 'var(--warning)' };
    if (now > end) return { text: 'Ended', color: 'var(--text-muted)' };
    return { text: 'Active Now', color: 'var(--success)' };
  };

  const selectedDevice = devices.find(d => d.id === deviceId);
  const calculatedDealPrice = selectedDevice ? Math.round(selectedDevice.price * (1 - discountPercentage / 100)) : 0;
  const customerSavings = selectedDevice ? selectedDevice.price - calculatedDealPrice : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Flash Sale Operations</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Map products into limited time countdown deals and control stock allowances.</p>
        </div>

        <button 
          onClick={openAddModal}
          className="premium-btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <Plus size={16} />
          <span>Launch Deal</span>
        </button>
      </div>

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

      {/* Grid of campaigns */}
      <div className="glass-card" style={{ padding: '0', overflowX: 'auto', borderRadius: '16px' }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '13px',
          textAlign: 'left'
        }}>
          <thead>
            <tr style={{ 
              borderBottom: '2px solid var(--border-color)', 
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-subtle)'
            }}>
              <th style={{ padding: '14px 16px' }}>Target Device</th>
              <th style={{ padding: '14px 16px' }}>Discount</th>
              <th style={{ padding: '14px 16px' }}>Duration Schedule</th>
              <th style={{ padding: '14px 16px', textAlign: 'center' }}>Sold / Limit</th>
              <th style={{ padding: '14px 16px' }}>Status</th>
              <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeSales.map(fs => {
              const device = devices.find(d => d.id === fs.deviceId);
              const status = getStatusText(fs);
              if (!device) return null;

              return (
                <tr key={fs.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  
                  {/* Device */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={device.images[0]} 
                        alt={device.modelName} 
                        style={{ width: '36px', height: '36px', objectFit: 'contain', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '2px' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong>{device.modelName}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{device.brand} • original: ₹{device.price.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </td>

                  {/* Discount */}
                  <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--error)' }}>
                    {fs.discountPercentage}% Off
                  </td>

                  {/* Schedule */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '11px' }}>
                    <div>Start: {new Date(fs.startTime).toLocaleString('en-IN')}</div>
                    <div>End: {new Date(fs.endTime).toLocaleString('en-IN')}</div>
                  </td>

                  {/* Sales tracking progress */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <div style={{ fontWeight: 'bold' }}>{fs.soldCount} / {fs.stockLimit}</div>
                    <div style={{
                      width: '80px',
                      height: '4px',
                      backgroundColor: 'var(--border-color)',
                      borderRadius: '2px',
                      margin: '4px auto 0 auto',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(100, (fs.soldCount / fs.stockLimit) * 100)}%`,
                        height: '100%',
                        backgroundColor: 'var(--error)'
                      }} />
                    </div>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px', fontWeight: 700, color: status.color }}>
                    {status.text}
                  </td>

                  {/* Action */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditModal(fs)}
                        className="premium-btn btn-secondary"
                        style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '6px' }}
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(fs.id)}
                        style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}
                      >
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Input Modal Overlay */}
      {isModalOpen && (
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
        }}>
          
          <div className="glass" style={{
            width: '100%',
            maxWidth: '480px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--glass-shadow)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingSale ? 'Edit Flash Sale Deal' : 'Schedule New Flash Deal'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Select Target Device *</label>
                <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="input-field" style={{ padding: '10px', fontSize: '13px' }} required>
                  {devices.filter(d => d.status !== 'archived').map(d => (
                    <option key={d.id} value={d.id}>
                      {d.brand} {d.modelName} ({d.variant}) — ₹{d.price.toLocaleString('en-IN')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Pricing Preview Box */}
              {selectedDevice && (
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '12px'
                }}>
                  <div>
                    <span style={{ fontWeight: 700, display: 'block' }}>{selectedDevice.brand} {selectedDevice.modelName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Original MRP: ₹{selectedDevice.price.toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 800, color: 'var(--error)', fontSize: '15px' }}>
                      Deal: ₹{calculatedDealPrice.toLocaleString('en-IN')}
                    </div>
                    <div style={{ color: 'var(--success)', fontWeight: 700, fontSize: '11px' }}>
                      Saves ₹{customerSavings.toLocaleString('en-IN')} ({discountPercentage}% OFF)
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Discount % *</label>
                  <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} className="input-field" min={1} max={99} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>Total Stock Limit *</label>
                  <input type="number" value={stockLimit} onChange={(e) => setStockLimit(Number(e.target.value))} className="input-field" min={1} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    Start Schedule (Min: Now) *
                  </label>
                  <input 
                    type="datetime-local" 
                    value={startTime} 
                    min={editingSale ? undefined : toLocalDatetime(new Date())}
                    onChange={(e) => handleStartTimeChange(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '8px', fontSize: '13px' }} 
                    required 
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    Cannot pick past time.
                  </span>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                    End Schedule (Expiry) *
                  </label>
                  <input 
                    type="datetime-local" 
                    value={endTime} 
                    min={startTime || toLocalDatetime(new Date())}
                    onChange={(e) => setEndTime(e.target.value)} 
                    className="input-field" 
                    style={{ padding: '8px', fontSize: '13px' }} 
                    required 
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '3px', display: 'block' }}>
                    Must be after start schedule.
                  </span>
                </div>
              </div>

              {/* Quick Duration Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>Quick Duration:</span>
                {[
                  { label: '+4 Hours', hours: 4 },
                  { label: '+12 Hours', hours: 12 },
                  { label: '+24 Hours (1 Day)', hours: 24 },
                  { label: '+3 Days', hours: 72 },
                  { label: '+7 Days', hours: 168 }
                ].map(preset => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setDurationPreset(preset.hours)}
                    className="premium-btn btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px', borderRadius: '6px' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '4px 0', fontSize: '13px' }}>
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--primary)' }} />
                <span>Activate countdown clock now</span>
              </label>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="premium-btn btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                <button type="submit" className="premium-btn btn-primary" style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>Launch Campaign</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};
