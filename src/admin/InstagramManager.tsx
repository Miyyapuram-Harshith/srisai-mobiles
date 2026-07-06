import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { InstagramPost, InstagramSettings } from '../types';
import { 
  Plus, Trash2, Edit, Eye, EyeOff, Star, ExternalLink, 
  Image, GripVertical, Camera, X, Check, Upload,
  ChevronUp, ChevronDown, Settings, BarChart2, Calendar, LayoutGrid, Sliders
} from 'lucide-react';

const InstagramIcon: React.FC<{ size?: number; style?: React.CSSProperties }> = ({ size = 20, style }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={style}>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const detectPostType = (url: string): 'post' | 'reel' | 'carousel' => {
  if (url.includes('/reel/') || url.includes('/reels/')) return 'reel';
  if (url.includes('/p/')) return 'post';
  return 'post';
};

const typeColors: Record<string, string> = {
  post: '#3b82f6',
  reel: '#a855f7',
  carousel: '#f59e0b'
};

const positionLabels: Record<InstagramPost['position'], string> = {
  top: 'Homepage Top',
  middle: 'Homepage Middle',
  bottom: 'Homepage Bottom',
  offers: 'Offers Section',
  featured: 'Featured Section'
};

export const InstagramManager: React.FC = () => {
  const { 
    instagramPosts, addInstagramPost, updateInstagramPost, deleteInstagramPost, reorderInstagramPosts,
    instagramSettings, updateInstagramSettings 
  } = useApp();

  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState<InstagramPost | null>(null);
  const [activeTab, setActiveTab] = useState<'posts' | 'settings' | 'analytics'>('posts');

  // Form states
  const [formUrl, setFormUrl] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(0);
  const [formFeatured, setFormFeatured] = useState(false);
  const [formActive, setFormActive] = useState(true);
  const [formThumbnail, setFormThumbnail] = useState('');
  const [formType, setFormType] = useState<'post' | 'reel' | 'carousel'>('post');
  const [formPosition, setFormPosition] = useState<InstagramPost['position']>('middle');
  const [formExpiryDate, setFormExpiryDate] = useState('');
  const [autoFetchStatus, setAutoFetchStatus] = useState<'idle' | 'loading' | 'success' | 'failed'>('idle');

  // Settings states
  const [showSection, setShowSection] = useState(instagramSettings.showSection);
  const [sectionTitle, setSectionTitle] = useState(instagramSettings.sectionTitle);
  const [sectionSubtitle, setSectionSubtitle] = useState(instagramSettings.sectionSubtitle);
  const [postsCount, setPostsCount] = useState(instagramSettings.postsCount);
  const [layout, setLayout] = useState<InstagramSettings['layout']>(instagramSettings.layout);
  const [autoSlide, setAutoSlide] = useState(instagramSettings.autoSlide);
  const [autoSlideInterval, setAutoSlideInterval] = useState(instagramSettings.autoSlideInterval);
  const [showFollowButton, setShowFollowButton] = useState(instagramSettings.showFollowButton);
  const [showSectionTitle, setShowSectionTitle] = useState(instagramSettings.showSectionTitle);

  // Check broken images
  const [brokenPosts, setBrokenPosts] = useState<string[]>([]);

  useEffect(() => {
    instagramPosts.forEach(post => {
      const img = new window.Image();
      img.onload = () => {};
      img.onerror = () => {
        setBrokenPosts(prev => prev.includes(post.id) ? prev : [...prev, post.id]);
      };
      img.src = post.thumbnailUrl;
    });
  }, [instagramPosts]);

  const sortedPosts = [...instagramPosts].sort((a, b) => a.displayOrder - b.displayOrder);

  const resetForm = () => {
    setFormUrl('');
    setFormTitle('');
    setFormDescription('');
    setFormDisplayOrder(instagramPosts.length + 1);
    setFormFeatured(false);
    setFormActive(true);
    setFormThumbnail('');
    setFormType('post');
    setFormPosition('middle');
    setFormExpiryDate('');
    setAutoFetchStatus('idle');
    setEditingPost(null);
  };

  const openAddForm = () => {
    resetForm();
    setFormDisplayOrder(instagramPosts.length + 1);
    setShowForm(true);
  };

  const openEditForm = (post: InstagramPost) => {
    setEditingPost(post);
    setFormUrl(post.url);
    setFormTitle(post.customTitle || '');
    setFormDescription(post.customDescription || '');
    setFormDisplayOrder(post.displayOrder);
    setFormFeatured(post.isFeatured);
    setFormActive(post.isActive);
    setFormThumbnail(post.thumbnailUrl);
    setFormType(post.type);
    setFormPosition(post.position || 'middle');
    setFormExpiryDate(post.expiryDate ? post.expiryDate.split('T')[0] : '');
    setAutoFetchStatus('idle');
    setShowForm(true);
  };

  const handleUrlChange = async (url: string) => {
    setFormUrl(url);
    setFormType(detectPostType(url));

    const shortcodeMatch = url.match(/(?:p|reel|reels)\/([A-Za-z0-9_-]+)/);
    if (shortcodeMatch && shortcodeMatch[1]) {
      const shortcode = shortcodeMatch[1];
      const proxyUrl = `https://images.weserv.nl/?url=https://www.instagram.com/p/${shortcode}/media/?size=l`;
      
      setAutoFetchStatus('loading');
      try {
        const response = await fetch(proxyUrl);
        if (response.ok) {
          const blob = await response.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setFormThumbnail(reader.result as string);
            setAutoFetchStatus('success');
          };
          reader.readAsDataURL(blob);
        } else {
          setAutoFetchStatus('failed');
        }
      } catch (e) {
        setAutoFetchStatus('failed');
      }
    }
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFormThumbnail(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUrl.trim()) {
      alert('Instagram URL is required.');
      return;
    }
    if (!formThumbnail.trim()) {
      alert('Please upload or fetch a thumbnail image.');
      return;
    }

    const postData = {
      url: formUrl.trim(),
      type: formType,
      thumbnailUrl: formThumbnail,
      customTitle: formTitle.trim() || undefined,
      customDescription: formDescription.trim() || undefined,
      displayOrder: formDisplayOrder,
      isFeatured: formFeatured,
      isActive: formActive,
      position: formPosition,
      expiryDate: formExpiryDate ? new Date(formExpiryDate).toISOString() : undefined
    };

    if (editingPost) {
      updateInstagramPost(editingPost.id, postData);
    } else {
      addInstagramPost(postData);
    }

    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this Instagram post?')) {
      deleteInstagramPost(id);
    }
  };

  const movePost = (index: number, direction: 'up' | 'down') => {
    const list = [...sortedPosts];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const reordered = list.map((p, i) => ({ ...p, displayOrder: i + 1 }));
    reorderInstagramPosts(reordered);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateInstagramSettings({
      showSection,
      sectionTitle,
      sectionSubtitle,
      postsCount: Number(postsCount),
      layout,
      autoSlide,
      autoSlideInterval: Number(autoSlideInterval),
      showFollowButton,
      showSectionTitle
    });
    alert('Instagram display settings saved successfully!');
  };

  // Analytics Helpers
  const totalViews = instagramPosts.reduce((acc, p) => acc + (p.views || 0), 0);
  const totalClicks = instagramPosts.reduce((acc, p) => acc + (p.clicks || 0), 0);
  const sortedByViews = [...instagramPosts].sort((a, b) => (b.views || 0) - (a.views || 0));
  const sortedByClicks = [...instagramPosts].sort((a, b) => (b.clicks || 0) - (a.clicks || 0));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <InstagramIcon size={22} style={{ color: '#E1306C' }} />
            <span>Instagram Feed Manager</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Manage the Instagram posts and reels feed on the website, track post interactions, and configure layouts.
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('posts')}
            className={`premium-btn ${activeTab === 'posts' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '12px', padding: '8px 14px' }}
          >
            <Camera size={14} style={{ marginRight: '6px' }} />
            Posts Feed ({instagramPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`premium-btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '12px', padding: '8px 14px' }}
          >
            <Settings size={14} style={{ marginRight: '6px' }} />
            Section Config
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`premium-btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', fontSize: '12px', padding: '8px 14px' }}
          >
            <BarChart2 size={14} style={{ marginRight: '6px' }} />
            Performance
          </button>
        </div>
      </div>

      {activeTab === 'posts' && (
        <>
          {/* Main Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={openAddForm}
              className="premium-btn btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
            >
              <Plus size={16} />
              <span>Add Instagram Post</span>
            </button>
          </div>

          {/* Inline Form */}
          {showForm && (
            <div className="glass-card" style={{ padding: '24px', borderRadius: '16px', border: '1px solid var(--primary)', position: 'relative' }}>
              <button
                onClick={() => { setShowForm(false); resetForm(); }}
                style={{ position: 'absolute', top: '12px', right: '12px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>

              <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={18} style={{ color: 'var(--primary)' }} />
                <span>{editingPost ? 'Edit Instagram Post' : 'Add New Instagram Post'}</span>
              </h3>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Instagram URL */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Instagram URL *
                  </label>
                  <input
                    type="url"
                    value={formUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    className="input-field"
                    placeholder="https://www.instagram.com/p/... or /reel/..."
                    required
                  />
                  
                  {/* Auto fetch indicator */}
                  {autoFetchStatus !== 'idle' && (
                    <div style={{ fontSize: '11px', marginTop: '4px', fontWeight: 600 }}>
                      {autoFetchStatus === 'loading' && <span style={{ color: 'var(--primary)' }}>🔄 Extracting post and trying to auto-fetch thumbnail...</span>}
                      {autoFetchStatus === 'success' && <span style={{ color: 'var(--success)' }}>✅ Thumbnail fetched and cached successfully!</span>}
                      {autoFetchStatus === 'failed' && <span style={{ color: 'var(--error)' }}>⚠️ Auto-fetch blocked by CORS. Please upload thumbnail manually below.</span>}
                    </div>
                  )}
                </div>

                {/* Overrides and Position */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Post Type Override
                    </label>
                    <select
                      value={formType}
                      onChange={(e) => setFormType(e.target.value as 'post' | 'reel' | 'carousel')}
                      className="input-field"
                      style={{ padding: '8px' }}
                    >
                      <option value="post">Standard Post</option>
                      <option value="reel">Reel Video</option>
                      <option value="carousel">Carousel Slide</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Display Position
                    </label>
                    <select
                      value={formPosition}
                      onChange={(e) => setFormPosition(e.target.value as any)}
                      className="input-field"
                      style={{ padding: '8px' }}
                    >
                      {Object.entries(positionLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Thumbnail Upload */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Thumbnail Cache Image *
                  </label>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                    <label
                      className="premium-btn btn-secondary"
                      style={{
                        padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
                        display: 'inline-flex', alignItems: 'center', gap: '6px', cursor: 'pointer'
                      }}
                    >
                      <Upload size={14} />
                      <span>Upload Fallback File</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                        style={{ display: 'none' }}
                      />
                    </label>
                    {formThumbnail && (
                      <img
                        src={formThumbnail}
                        alt="Thumbnail preview"
                        style={{
                          width: '60px', height: '60px', objectFit: 'cover',
                          borderRadius: '8px', border: '1px solid var(--border-color)'
                        }}
                      />
                    )}
                  </div>
                  <input
                    type="url"
                    value={formThumbnail}
                    onChange={(e) => setFormThumbnail(e.target.value)}
                    className="input-field"
                    placeholder="Or paste custom image URL directly..."
                    style={{ marginTop: '8px' }}
                  />
                </div>

                {/* Title, Display Order, Expiry */}
                <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr 1.5fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Custom Title (optional)
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="input-field"
                      placeholder="e.g. Unboxing S24 Ultra"
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Display Order
                    </label>
                    <input
                      type="number"
                      value={formDisplayOrder}
                      onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                      className="input-field"
                      min={1}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Expiry Date (hides after date)
                    </label>
                    <input
                      type="date"
                      value={formExpiryDate}
                      onChange={(e) => setFormExpiryDate(e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                    Custom Description (optional)
                  </label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="input-field"
                    placeholder="Provide a caption or key tag info..."
                    rows={2}
                    style={{ resize: 'vertical' }}
                  />
                </div>

                {/* Featured & Active Toggles */}
                <div style={{ display: 'flex', gap: '24px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="checkbox" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    <Star size={14} style={{ color: formFeatured ? '#f59e0b' : 'var(--text-muted)' }} />
                    <span>Featured Post</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="checkbox" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                    {formActive ? <Eye size={14} style={{ color: 'var(--success)' }} /> : <EyeOff size={14} style={{ color: 'var(--text-muted)' }} />}
                    <span>Active Display Status</span>
                  </label>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                  <button
                    type="button"
                    onClick={() => { setShowForm(false); resetForm(); }}
                    className="premium-btn btn-secondary"
                    style={{ flex: 1, padding: '12px' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="premium-btn btn-primary"
                    style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Check size={16} />
                    <span>{editingPost ? 'Update Post' : 'Save Post'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Posts List */}
          {sortedPosts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
              <Image size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No Instagram posts configured in the system.</p>
              <button
                onClick={openAddForm}
                className="premium-btn btn-primary"
                style={{ marginTop: '12px', borderRadius: '20px', fontSize: '12px', padding: '8px 20px' }}
              >
                Configure First Post
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sortedPosts.map((post, index) => {
                const isBroken = brokenPosts.includes(post.id);
                const isExpired = post.expiryDate && new Date(post.expiryDate) < new Date();

                return (
                  <div
                    key={post.id}
                    className="glass-card"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '12px 16px',
                      borderRadius: '14px',
                      border: isBroken ? '1px solid var(--error)' : '1px solid var(--border-color)',
                      opacity: post.isActive && !isExpired ? 1 : 0.55
                    }}
                  >
                    {/* Reorder Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <button
                        onClick={() => movePost(index, 'up')}
                        disabled={index === 0}
                        style={{
                          border: 'none', background: 'none', cursor: index === 0 ? 'not-allowed' : 'pointer',
                          color: index === 0 ? 'var(--border-color)' : 'var(--text-muted)', padding: '2px'
                        }}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => movePost(index, 'down')}
                        disabled={index === sortedPosts.length - 1}
                        style={{
                          border: 'none', background: 'none',
                          cursor: index === sortedPosts.length - 1 ? 'not-allowed' : 'pointer',
                          color: index === sortedPosts.length - 1 ? 'var(--border-color)' : 'var(--text-muted)', padding: '2px'
                        }}
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Order # */}
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)', width: '24px', textAlign: 'center' }}>
                      #{post.displayOrder}
                    </div>

                    {/* Thumbnail */}
                    <div style={{ position: 'relative' }}>
                      <img
                        src={post.thumbnailUrl}
                        alt={post.customTitle || 'Instagram post'}
                        style={{
                          width: '56px', height: '56px', objectFit: 'cover',
                          borderRadius: '8px', border: '1px solid var(--border-color)', flexShrink: 0
                        }}
                      />
                      {isBroken && (
                        <div style={{
                          position: 'absolute', inset: 0, backgroundColor: 'rgba(239, 68, 68, 0.7)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px',
                          color: 'white', fontSize: '9px', fontWeight: 'bold'
                        }}>
                          BROKEN
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                          {post.customTitle || 'Untitled Post'}
                        </strong>
                        <span style={{
                          fontSize: '9px', fontWeight: 700, textTransform: 'uppercase',
                          backgroundColor: `${typeColors[post.type]}22`,
                          color: typeColors[post.type],
                          padding: '2px 8px', borderRadius: '6px'
                        }}>
                          {post.type}
                        </span>
                        <span style={{
                          fontSize: '9px', fontWeight: 700,
                          backgroundColor: 'var(--border-color)',
                          color: 'var(--text-main)',
                          padding: '2px 8px', borderRadius: '6px'
                        }}>
                          📍 {positionLabels[post.position] || 'Homepage'}
                        </span>
                        {post.isFeatured && (
                          <span style={{
                            fontSize: '9px', fontWeight: 700,
                            backgroundColor: 'rgba(245, 158, 11, 0.15)',
                            color: '#f59e0b',
                            padding: '2px 8px', borderRadius: '6px',
                            display: 'flex', alignItems: 'center', gap: '3px'
                          }}>
                            <Star size={9} fill="#f59e0b" /> Featured
                          </span>
                        )}
                        {isExpired && (
                          <span style={{
                            fontSize: '9px', fontWeight: 700,
                            backgroundColor: 'rgba(239, 68, 68, 0.15)',
                            color: 'var(--error)',
                            padding: '2px 8px', borderRadius: '6px'
                          }}>
                            Expired (Hidden)
                          </span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: 'var(--text-muted)', display: 'inline-flex',
                            alignItems: 'center', gap: '4px', textDecoration: 'none'
                          }}
                        >
                          <ExternalLink size={10} />
                          <span>View Original Post</span>
                        </a>
                        {post.expiryDate && (
                          <span>• Expiry: {new Date(post.expiryDate).toLocaleDateString('en-IN')}</span>
                        )}
                        <span>• Views: <strong>{post.views || 0}</strong></span>
                        <span>• Clicks: <strong>{post.clicks || 0}</strong></span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                      <button
                        onClick={() => updateInstagramPost(post.id, { isActive: !post.isActive })}
                        title={post.isActive ? 'Deactivate' : 'Activate'}
                        style={{
                          border: 'none', background: 'var(--bg-subtle)',
                          cursor: 'pointer', padding: '7px', borderRadius: '6px',
                          color: post.isActive ? 'var(--success)' : 'var(--text-muted)',
                          display: 'flex', alignItems: 'center'
                        }}
                      >
                        {post.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => openEditForm(post)}
                        className="premium-btn btn-secondary"
                        style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit size={12} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(post.id)}
                        style={{
                          border: 'none', background: 'rgba(239,68,68,0.1)',
                          color: 'var(--error)', cursor: 'pointer',
                          padding: '7px', borderRadius: '6px', display: 'flex', alignItems: 'center'
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="glass-card" style={{ padding: '24px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={18} style={{ color: 'var(--primary)' }} />
            <span>Storefront Section Display Settings</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Show section toggle */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={showSection} onChange={(e) => setShowSection(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <div>
                <strong>Display Instagram Feed on Homepage</strong>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>If disabled, the entire section will be hidden.</div>
              </div>
            </label>

            {/* Layout type */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>FEED LAYOUT LAYOUT</label>
              <select value={layout} onChange={(e) => setLayout(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                <option value="grid">Responsive Cards Grid</option>
                <option value="carousel">Horizontal Scroll Carousel</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px' }}>
            {/* Titles */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SECTION TITLE</label>
              <input type="text" value={sectionTitle} onChange={(e) => setSectionTitle(e.target.value)} className="input-field" placeholder="📸 Latest From Instagram" />
            </div>
            
            {/* Number of posts */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>POSTS COUNT LIMIT</label>
              <input type="number" value={postsCount} onChange={(e) => setPostsCount(Number(e.target.value))} className="input-field" min={1} max={24} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SECTION SUBTITLE</label>
            <input type="text" value={sectionSubtitle} onChange={(e) => setSectionSubtitle(e.target.value)} className="input-field" placeholder="Join 40K+ followers..." />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
            {/* Show section title */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={showSectionTitle} onChange={(e) => setShowSectionTitle(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <div>
                <strong>Show Header Title & Subtitle</strong>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Displays section name over feed cards</div>
              </div>
            </label>

            {/* Show follow button */}
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
              <input type="checkbox" checked={showFollowButton} onChange={(e) => setShowFollowButton(e.target.checked)} style={{ width: '16px', height: '16px' }} />
              <div>
                <strong>Show Instagram Follow Profile CTA Button</strong>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Adds follow button widget under grid</div>
              </div>
            </label>
          </div>

          {layout === 'carousel' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderTop: '1px dashed var(--border-color)', paddingTop: '14px' }}>
              {/* Auto slide */}
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
                <input type="checkbox" checked={autoSlide} onChange={(e) => setAutoSlide(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <div>
                  <strong>Enable Auto-Slide Carousel</strong>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Automatically slide posts horizontally</div>
                </div>
              </label>

              {/* Interval */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>SLIDE TIMER INTERVAL (SECONDS)</label>
                <input type="number" value={autoSlideInterval} onChange={(e) => setAutoSlideInterval(Number(e.target.value))} className="input-field" min={2} max={30} disabled={!autoSlide} />
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button type="submit" className="premium-btn btn-primary" style={{ padding: '10px 24px', borderRadius: '10px' }}>
              Save Section Configurations
            </button>
          </div>
        </form>
      )}

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Stats Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Feed Views</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>{totalViews.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Outbound Clicks</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: '#E1306C', marginTop: '8px' }}>{totalClicks.toLocaleString()}</div>
            </div>
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Average Click-Through Rate (CTR)</div>
              <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--success)', marginTop: '8px' }}>
                {totalViews > 0 ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '0.0%'}
              </div>
            </div>
          </div>

          {/* Leaders Tables */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            
            {/* Views Leaders */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={16} style={{ color: 'var(--primary)' }} />
                <span>Most Viewed Instagram Posts</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedByViews.slice(0, 5).map((post, idx) => (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', width: '16px' }}>{idx + 1}</span>
                    <img src={post.thumbnailUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>{post.customTitle || 'Untitled Post'}</strong>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{post.url}</div>
                    </div>
                    <span style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {post.views || 0} views
                    </span>
                  </div>
                ))}
                {instagramPosts.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No posts configured.</p>}
              </div>
            </div>

            {/* Clicks Leaders */}
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ExternalLink size={16} style={{ color: '#E1306C' }} />
                <span>Most Clicked Instagram Posts</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sortedByClicks.slice(0, 5).map((post, idx) => (
                  <div key={post.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', width: '16px' }}>{idx + 1}</span>
                    <img src={post.thumbnailUrl} alt="" style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '6px' }} />
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong>{post.customTitle || 'Untitled Post'}</strong>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{post.url}</div>
                    </div>
                    <span style={{ backgroundColor: 'rgba(225, 48, 108, 0.1)', color: '#E1306C', padding: '2px 6px', borderRadius: '6px', fontWeight: 'bold' }}>
                      {post.clicks || 0} clicks
                    </span>
                  </div>
                ))}
                {instagramPosts.length === 0 && <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No posts configured.</p>}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
