import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { FlashSale } from '../types';
import { Plus, Trash, X, Calendar, Flame, AlertCircle, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

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
    setDeviceId(devices[0]?.id || '');
    setDiscountPercentage(15);
    setStockLimit(5);

    const now = new Date();
    const future = new Date();
    future.setHours(now.getHours() + 4);

    setStartTime(now.toISOString().substring(0, 16));
    setEndTime(future.toISOString().substring(0, 16));
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (fs: FlashSale) => {
    setEditingSale(fs);
    setDeviceId(fs.deviceId);
    setDiscountPercentage(fs.discountPercentage);
    setStockLimit(fs.stockLimit);
    setStartTime(new Date(fs.startTime).toISOString().substring(0, 16));
    setEndTime(new Date(fs.endTime).toISOString().substring(0, 16));
    setEnabled(fs.enabled);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!deviceId || !startTime || !endTime) {
      alert('Please fill out all required flash sale fields.');
      return;
    }

    if (discountPercentage <= 0 || discountPercentage >= 100) {
      alert('Discount percentage must be between 1 and 99.');
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
        const { error } = await supabase.from('flash_sales').delete().eq('id', id);
        if (error) throw error;
      }
      
      // 2. Insert/Update
      for (const fs of localSales) {
        const dbSale = {
          device_id: fs.deviceId,
          discount_percentage: fs.discountPercentage,
          stock_limit: fs.stockLimit,
          start_time: fs.startTime,
          end_time: fs.endTime,
          enabled: fs.enabled,
          sold_count: fs.soldCount
        };
        
        if (fs.id.startsWith('fs-temp-')) {
          const { error } = await supabase.from('flash_sales').insert(dbSale);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('flash_sales').update(dbSale).eq('id', fs.id);
          if (error) throw error;
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
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Select Target Device *</label>
                <select value={deviceId} onChange={(e) => setDeviceId(e.target.value)} className="input-field" style={{ padding: '10px' }} required>
                  {devices.filter(d => d.status !== 'archived').map(d => (
                    <option key={d.id} value={d.id}>{d.modelName} ({d.brand})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Discount % *</label>
                  <input type="number" value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} className="input-field" min={1} max={99} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Stock Limit *</label>
                  <input type="number" value={stockLimit} onChange={(e) => setStockLimit(Number(e.target.value))} className="input-field" min={1} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Start Schedule *</label>
                  <input type="datetime-local" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="input-field" style={{ padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>End Schedule *</label>
                  <input type="datetime-local" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="input-field" style={{ padding: '8px' }} required />
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: '8px 0', fontSize: '13px' }}>
                <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ width: '16px', height: '16px' }} />
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
