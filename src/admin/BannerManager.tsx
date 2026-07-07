import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Banner } from '../types';
import { Plus, Trash, X, Calendar, Sliders, Play, Save, GripVertical } from 'lucide-react';

export const BannerManager: React.FC = () => {
  const { banners, saveBanner, deleteBanner, reorderBanners } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  // Form States
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [redirectLink, setRedirectLink] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [slideshowTimer, setSlideshowTimer] = useState(5);
  const [enabled, setEnabled] = useState(true);

  // Drag and Drop States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const openAddModal = () => {
    setEditingBanner(null);
    setTitle('');
    setImageUrl('');
    setRedirectLink('#home');
    
    // Default dates: today to +14 days
    const today = new Date();
    const future = new Date();
    future.setDate(today.getDate() + 14);
    
    setStartDate(today.toISOString().split('T')[0] + 'T00:00');
    setEndDate(future.toISOString().split('T')[0] + 'T23:59');
    setSlideshowTimer(5);
    setEnabled(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Banner) => {
    setEditingBanner(b);
    setTitle(b.title);
    setImageUrl(b.image_url);
    setRedirectLink(b.redirect_link);
    
    // Format to local datetime input compatibility
    setStartDate(b.start_date ? new Date(b.start_date).toISOString().substring(0, 16) : '');
    setEndDate(b.end_date ? new Date(b.end_date).toISOString().substring(0, 16) : '');
    setSlideshowTimer(b.slideshow_timer);
    setEnabled(b.active);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl || !startDate || !endDate) {
      alert('Please fill out all required banner fields.');
      return;
    }

    saveBanner({
      id: editingBanner?.id,
      image_url: imageUrl,
      title,
      redirect_link: redirectLink,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      slideshow_timer: Number(slideshowTimer),
      active: enabled,
      priority: editingBanner?.priority || banners.length + 1
    });

    setIsModalOpen(false);
  };

  // HTML5 Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Reorder list in memory while dragging
    const list = [...banners];
    const item = list[draggedIndex];
    list.splice(draggedIndex, 1);
    list.splice(index, 0, item);
    
    setDraggedIndex(index);
    reorderBanners(list);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getStatusText = (b: Banner): { text: string; color: string } => {
    if (!b.active) return { text: 'Disabled', color: 'var(--text-muted)' };
    const now = Date.now();
    const start = b.start_date ? new Date(b.start_date).getTime() : 0;
    const end = b.end_date ? new Date(b.end_date).getTime() : Infinity;

    if (now < start) return { text: 'Scheduled', color: 'var(--warning)' };
    if (now > end) return { text: 'Expired', color: 'var(--error)' };
    return { text: 'Active', color: 'var(--success)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Top Controls */}
      <div style={{ display: 'flex', justifySelf: 'stretch', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Hero Carousel Banners</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Configure advertising slides. Use drag handles to rearrange slide order.</p>
        </div>

        <button 
          onClick={openAddModal}
          className="premium-btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <Plus size={16} />
          <span>Upload Banner</span>
        </button>
      </div>

      {/* List Layout with Drag and Drop */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {banners.sort((a,b) => a.priority - b.priority).map((b, index) => {
          const status = getStatusText(b);
          return (
            <div
              key={b.id}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className="glass-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 20px',
                borderRadius: '14px',
                border: draggedIndex === index ? '2px dashed var(--primary)' : '1px solid var(--border-color)',
                cursor: 'move',
                backgroundColor: draggedIndex === index ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-surface)'
              }}
            >
              {/* Grip Handle */}
              <div style={{ color: 'var(--text-muted)' }}>
                <GripVertical size={18} />
              </div>

              {/* Order index */}
              <div style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: 'var(--text-muted)',
                width: '24px'
              }}>
                #{b.priority}
              </div>

              {/* Image Preview */}
              <img 
                src={b.image_url} 
                alt={b.title} 
                style={{
                  width: '90px',
                  height: '50px',
                  objectFit: 'cover',
                  borderRadius: '6px',
                  border: '1px solid var(--border-color)'
                }}
              />

              {/* Description Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: '14px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</strong>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Redirect Link: {b.redirect_link} • Display Timer: {b.slideshow_timer}s
                </span>
              </div>

              {/* Status Badge */}
              <div style={{ fontSize: '12px', fontWeight: 700, color: status.color, minWidth: '80px', textAlign: 'center' }}>
                {status.text}
              </div>

              {/* Action Operations */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => openEditModal(b)}
                  className="premium-btn btn-secondary"
                  style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '12px' }}
                >
                  Edit
                </button>
                <button 
                  onClick={() => deleteBanner(b.id)}
                  style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', cursor: 'pointer', padding: '8px', borderRadius: '6px' }}
                >
                  <Trash size={14} />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Modal Input Form Overlay */}
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
            maxWidth: '520px',
            borderRadius: '24px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'var(--glass-shadow)',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 800 }}>
                {editingBanner ? 'Edit Carousel Banner' : 'Create Banner Campaign'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Banner Title *</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-field" required />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Banner Image URL *</label>
                <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field" placeholder="Paste image link" required />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Target Redirect Link *</label>
                <input type="text" value={redirectLink} onChange={(e) => setRedirectLink(e.target.value)} className="input-field" required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Start Schedule *</label>
                  <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" style={{ padding: '8px' }} required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>End Schedule *</label>
                  <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="input-field" style={{ padding: '8px' }} required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', alignItems: 'center' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rotation Timer (Seconds)</label>
                  <input type="number" value={slideshowTimer} onChange={(e) => setSlideshowTimer(Number(e.target.value))} className="input-field" min={2} required />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '18px', fontSize: '13px' }}>
                  <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                  <span>Enable Banner Slide</span>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="premium-btn btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                <button type="submit" className="premium-btn btn-primary" style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>Save Campaign</span>
                </button>
              </div>

            </form>
          </div>

        </div>
      )}

    </div>
  );
};
