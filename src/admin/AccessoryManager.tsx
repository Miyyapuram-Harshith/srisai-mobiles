import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Accessory } from '../types';
import { 
  Plus, Edit2, Copy, Trash2, X, Tag, AlertTriangle, 
  Layers, Save, CheckSquare, Square, Eye, EyeOff, Upload, Search, Laptop, Smartphone
} from 'lucide-react';

export const AccessoryManager: React.FC = () => {
  const { accessories, saveAccessory, deleteAccessory } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);

  // Form States
  const [category, setCategory] = useState<Accessory['category']>('cases');
  const [brand, setBrand] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [description, setDescription] = useState('');
  const [colorsInput, setColorsInput] = useState('');
  const [imagesInput, setImagesInput] = useState('');
  const [featuresInput, setFeaturesInput] = useState('');
  const [status, setStatus] = useState<Accessory['status']>('available');

  // Specs States (Dynamic depending on category)
  const [spec1Key, setSpec1Key] = useState('');
  const [spec1Value, setSpec1Value] = useState('');
  const [spec2Key, setSpec2Key] = useState('');
  const [spec2Value, setSpec2Value] = useState('');
  const [spec3Key, setSpec3Key] = useState('');
  const [spec3Value, setSpec3Value] = useState('');

  // Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categoriesList: { value: Accessory['category']; label: string }[] = [
    { value: 'cases', label: 'Cases & Covers' },
    { value: 'chargers', label: 'Chargers & Adapters' },
    { value: 'cables', label: 'Cables & Connectors' },
    { value: 'earphones', label: 'Earphones & Headphones' },
    { value: 'smart_watches', label: 'Smart Watches' },
    { value: 'power_banks', label: 'Power Banks' }
  ];

  const handleCategoryChange = (cat: Accessory['category']) => {
    setCategory(cat);
    // Autofill typical spec keys for convenience
    if (cat === 'cases') {
      setSpec1Key('Material'); setSpec1Value('TPU + PC');
      setSpec2Key('Compatibility'); setSpec2Value('iPhone 15');
      setSpec3Key('MagSafe'); setSpec3Value('Yes');
    } else if (cat === 'chargers') {
      setSpec1Key('Output Wattage'); setSpec1Value('20W');
      setSpec2Key('Charging Ports'); setSpec2Value('USB-C');
      setSpec3Key('Foldable Plug'); setSpec3Value('Yes');
    } else if (cat === 'cables') {
      setSpec1Key('Length'); setSpec1Value('1 Meter');
      setSpec2Key('Connector Type'); setSpec2Value('USB-C to C');
      setSpec3Key('Braided'); setSpec3Value('Yes');
    } else if (cat === 'earphones') {
      setSpec1Key('Driver Size'); setSpec1Value('10mm');
      setSpec2Key('Noise Cancellation'); setSpec2Value('Yes');
      setSpec3Key('Playtime'); setSpec3Value('30 Hours');
    } else if (cat === 'smart_watches') {
      setSpec1Key('Display'); setSpec1Value('1.8" AMOLED');
      setSpec2Key('BT Calling'); setSpec2Value('Yes');
      setSpec3Key('Battery Life'); setSpec3Value('7 Days');
    } else if (cat === 'power_banks') {
      setSpec1Key('Capacity'); setSpec1Value('10,000mAh');
      setSpec2Key('Max Output'); setSpec2Value('22.5W');
      setSpec3Key('Ports'); setSpec3Value('2x USB-A, 1x Type-C');
    }
  };

  const resetForm = () => {
    setCategory('cases');
    setBrand('');
    setName('');
    setPrice(0);
    setOfferPrice(0);
    setStockCount(0);
    setDescription('');
    setColorsInput('');
    setImagesInput('');
    setFeaturesInput('');
    setStatus('available');
    setSpec1Key('Material'); setSpec1Value('TPU');
    setSpec2Key('Compatibility'); setSpec2Value('');
    setSpec3Key('MagSafe'); setSpec3Value('No');
    setEditingAccessory(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (acc: Accessory) => {
    setEditingAccessory(acc);
    setCategory(acc.category);
    setBrand(acc.brand);
    setName(acc.name);
    setPrice(acc.price);
    setOfferPrice(acc.offerPrice);
    setStockCount(acc.stockCount);
    setDescription(acc.description);
    setColorsInput(acc.colors ? acc.colors.join(', ') : '');
    setImagesInput(acc.images ? acc.images.join(', ') : '');
    setFeaturesInput(acc.features ? acc.features.join('\n') : '');
    setStatus(acc.status);

    // Parse specs
    const specEntries = Object.entries(acc.specifications || {});
    setSpec1Key(specEntries[0]?.[0] || 'Specification 1');
    setSpec1Value(specEntries[0]?.[1] || '');
    setSpec2Key(specEntries[1]?.[0] || 'Specification 2');
    setSpec2Value(specEntries[1]?.[1] || '');
    setSpec3Key(specEntries[2]?.[0] || 'Specification 3');
    setSpec3Value(specEntries[2]?.[1] || '');

    setIsModalOpen(true);
  };

  const openDuplicateModal = (acc: Accessory) => {
    resetForm();
    setCategory(acc.category);
    setBrand(acc.brand);
    setName(`${acc.name} (Copy)`);
    setPrice(acc.price);
    setOfferPrice(acc.offerPrice);
    setStockCount(0); // reset stock count
    setDescription(acc.description);
    setColorsInput(acc.colors ? acc.colors.join(', ') : '');
    setImagesInput(acc.images ? acc.images.join(', ') : '');
    setFeaturesInput(acc.features ? acc.features.join('\n') : '');
    setStatus('available');
    
    // Parse specs
    const specEntries = Object.entries(acc.specifications || {});
    setSpec1Key(specEntries[0]?.[0] || 'Spec 1');
    setSpec1Value(specEntries[0]?.[1] || '');
    setSpec2Key(specEntries[1]?.[0] || 'Spec 2');
    setSpec2Value(specEntries[1]?.[1] || '');
    setSpec3Key(specEntries[2]?.[0] || 'Spec 3');
    setSpec3Value(specEntries[2]?.[1] || '');

    setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    // Convert to base64
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagesInput(prev => prev ? `${prev}, ${reader.result}` : reader.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!brand || !name || price <= 0 || stockCount < 0) {
      alert('Please fill out all required fields.');
      return;
    }

    const colors = colorsInput.split(',').map(c => c.trim()).filter(Boolean);
    const images = imagesInput.split(',').map(i => i.trim()).filter(Boolean);
    const features = featuresInput.split('\n').map(f => f.trim()).filter(Boolean);

    const specifications: Record<string, string> = {};
    if (spec1Key.trim() && spec1Value.trim()) specifications[spec1Key.trim()] = spec1Value.trim();
    if (spec2Key.trim() && spec2Value.trim()) specifications[spec2Key.trim()] = spec2Value.trim();
    if (spec3Key.trim() && spec3Value.trim()) specifications[spec3Key.trim()] = spec3Value.trim();

    const finalAccessory = {
      id: editingAccessory?.id,
      category,
      brand: brand.trim(),
      name: name.trim(),
      price: Number(price),
      offerPrice: offerPrice ? Number(offerPrice) : Number(price),
      stockCount: Number(stockCount),
      description: description.trim(),
      colors: colors.length > 0 ? colors : ['Default'],
      images: images.length > 0 ? images : ['logo.jpg'],
      status: Number(stockCount) === 0 ? ('out_of_stock' as const) : status,
      specifications,
      features
    };

    saveAccessory(finalAccessory);
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this accessory entry?')) {
      deleteAccessory(id);
    }
  };

  const filteredAccessories = accessories.filter(acc => {
    const matchesSearch = 
      acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      acc.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || acc.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Upper header action area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tag size={22} style={{ color: 'var(--primary)' }} />
            <span>Accessories Catalog Manager</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Configure protective cases, GaN fast chargers, dynamic earphones, smart watches, and travel power banks.
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="premium-btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <Plus size={16} />
          <span>Add Accessory</span>
        </button>
      </div>

      {/* Toolbar Filter & Search */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by brand, name, category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>
        
        <div style={{ width: '180px' }}>
          <select 
            value={categoryFilter} 
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ height: '40px', padding: '0 10px' }}
          >
            <option value="all">All Categories</option>
            {categoriesList.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Showing <strong>{filteredAccessories.length}</strong> items
        </div>
      </div>

      {/* Data Inventory Grid Table */}
      {filteredAccessories.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <Tag size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No matching accessories found in stock.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          
          {/* Desktop Table View */}
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '12px 16px' }}>Accessory</th>
                  <th style={{ padding: '12px 16px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Pricing</th>
                  <th style={{ padding: '12px 16px' }}>Stock Status</th>
                  <th style={{ padding: '12px 16px' }}>Analytics</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccessories.map((acc) => {
                  const isOutOfStock = acc.stockCount === 0;
                  const originalPrice = acc.price;
                  const activePrice = acc.offerPrice;
                  const discountPercent = originalPrice > activePrice ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;

                  return (
                    <tr 
                      key={acc.id}
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        opacity: acc.status === 'archived' ? 0.6 : 1,
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Name & Brand */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <img 
                            src={acc.images[0] || 'logo.jpg'} 
                            alt={acc.name} 
                            style={{ width: '42px', height: '42px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                          />
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ fontSize: '14px', color: 'var(--text-main)' }}>{acc.brand} {acc.name}</strong>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: <code>{acc.id}</code></span>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td style={{ padding: '16px' }}>
                        <span style={{ 
                          fontSize: '10px', 
                          fontWeight: 700, 
                          textTransform: 'uppercase', 
                          backgroundColor: 'rgba(59, 130, 246, 0.12)', 
                          color: 'var(--primary)',
                          padding: '3px 8px',
                          borderRadius: '6px'
                        }}>
                          {acc.category.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Pricing */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <strong>₹{activePrice.toLocaleString('en-IN')}</strong>
                          {discountPercent > 0 && (
                            <div style={{ display: 'flex', gap: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                              <span style={{ textDecoration: 'line-through' }}>₹{originalPrice.toLocaleString('en-IN')}</span>
                              <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{discountPercent}% OFF</span>
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Stock Count */}
                      <td style={{ padding: '16px' }}>
                        {isOutOfStock ? (
                          <span style={{ color: 'var(--error)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <AlertTriangle size={14} /> Out of Stock
                          </span>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <strong style={{ color: acc.stockCount <= 5 ? 'var(--warning)' : 'var(--text-main)' }}>
                              {acc.stockCount} units
                            </strong>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                              {acc.stockCount <= 5 ? '⚠️ Running low' : '🟢 Available'}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* Views & Sales */}
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                          <div>👁️ <strong>{acc.views}</strong> views</div>
                          <div>📦 <strong>{acc.sales}</strong> sales</div>
                        </div>
                      </td>

                      {/* Actions Buttons */}
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            onClick={() => openEditModal(acc)}
                            className="premium-btn btn-secondary"
                            style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Edit entry"
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button 
                            onClick={() => openDuplicateModal(acc)}
                            className="premium-btn btn-secondary"
                            style={{ padding: '6px 10px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="Duplicate entry"
                          >
                            <Copy size={12} />
                          </button>
                          <button 
                            onClick={() => handleDelete(acc.id)}
                            style={{ 
                              border: 'none', 
                              background: 'rgba(239, 68, 68, 0.1)', 
                              color: 'var(--error)', 
                              cursor: 'pointer', 
                              padding: '7px', 
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center'
                            }}
                            title="Delete permanently"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
            {filteredAccessories.map((acc) => {
              const isOutOfStock = acc.stockCount === 0;
              const originalPrice = acc.price;
              const activePrice = acc.offerPrice;
              const discountPercent = originalPrice > activePrice ? Math.round(((originalPrice - activePrice) / originalPrice) * 100) : 0;

              return (
                <div 
                  key={acc.id} 
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-solid)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    margin: 0,
                    opacity: acc.status === 'archived' ? 0.6 : 1
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img 
                      src={acc.images[0] || 'logo.jpg'} 
                      alt={acc.name} 
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }} 
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>{acc.brand} {acc.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>ID: <code>{acc.id}</code></span>
                    </div>
                    <div>
                      <span style={{ 
                        fontSize: '10px', 
                        fontWeight: 700, 
                        textTransform: 'uppercase', 
                        backgroundColor: 'rgba(59, 130, 246, 0.12)', 
                        color: 'var(--primary)',
                        padding: '3px 8px',
                        borderRadius: '6px'
                      }}>
                        {acc.category.replace('_', ' ')}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div>Stock: <strong style={{ color: isOutOfStock ? 'var(--error)' : acc.stockCount <= 5 ? 'var(--warning)' : 'var(--text-main)' }}>{acc.stockCount} units</strong></div>
                    <div>Analytics: 👁️ {acc.views} | 📦 {acc.sales}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Offer Price:</span><br/>
                      <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>₹{activePrice.toLocaleString('en-IN')}</strong>
                    </div>
                    {discountPercent > 0 && (
                      <div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>List Price:</span><br/>
                        <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{originalPrice.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions Row */}
                  <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', width: '100%' }}>
                    <button 
                      onClick={() => openEditModal(acc)}
                      className="premium-btn btn-primary"
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '36px' }}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => openDuplicateModal(acc)}
                      className="premium-btn btn-secondary"
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '36px' }}
                    >
                      Duplicate
                    </button>
                    <button 
                      onClick={() => handleDelete(acc.id)}
                      className="premium-btn btn-secondary"
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', minHeight: '36px', borderColor: 'var(--error)', color: 'var(--error)' }}
                      title="Delete permanently"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Edit/Add Accessory Inline Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(5px)', padding: '20px'
        }}>
          <div className="glass-card" style={{
            width: '100%', maxWidth: '650px', maxHeight: '90vh',
            overflowY: 'auto', borderRadius: '24px', padding: '24px',
            border: '1px solid var(--border-color)', position: 'relative'
          }}>
            
            {/* Close Button */}
            <button 
              onClick={() => { setIsModalOpen(false); resetForm(); }}
              style={{ position: 'absolute', top: '16px', right: '16px', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={20} />
            </button>

            <h3 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={20} style={{ color: 'var(--primary)' }} />
              <span>{editingAccessory ? `Edit ${editingAccessory.brand} ${editingAccessory.name}` : 'Add New Accessory Entry'}</span>
            </h3>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* Category, Brand, Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Category *</label>
                  <select 
                    value={category} 
                    onChange={(e) => handleCategoryChange(e.target.value as Accessory['category'])}
                    className="input-field"
                    required
                  >
                    {categoriesList.map(c => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Brand *</label>
                  <input 
                    type="text" 
                    value={brand} 
                    onChange={(e) => setBrand(e.target.value)} 
                    className="input-field" 
                    placeholder="e.g. Spigen, Anker, Mi" 
                    required 
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Accessory Model Name *</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="input-field" 
                  placeholder="e.g. Ultra Hybrid Magnetic MagSafe Shell Case" 
                  required 
                />
              </div>

              {/* Pricing & Stock */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Original MRP Price (₹) *</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(Number(e.target.value))} 
                    className="input-field" 
                    min={1} 
                    required 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Offer Selling Price (₹)</label>
                  <input 
                    type="number" 
                    value={offerPrice} 
                    onChange={(e) => setOfferPrice(Number(e.target.value))} 
                    className="input-field" 
                    placeholder="Same as MRP if empty" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stock Quantity *</label>
                  <input 
                    type="number" 
                    value={stockCount} 
                    onChange={(e) => setStockCount(Number(e.target.value))} 
                    className="input-field" 
                    min={0} 
                    required 
                  />
                </div>
              </div>

              {/* Colors, Images, Features */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Colors Available (comma separated)</label>
                  <input 
                    type="text" 
                    value={colorsInput} 
                    onChange={(e) => setColorsInput(e.target.value)} 
                    className="input-field" 
                    placeholder="e.g. Crystal Clear, Matte Black" 
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Upload Image / Paste URLs</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <label 
                      className="premium-btn btn-secondary" 
                      style={{ padding: '8px 12px', fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Upload size={12} />
                      <span>Upload file</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                    </label>
                    <input 
                      type="text" 
                      value={imagesInput} 
                      onChange={(e) => setImagesInput(e.target.value)} 
                      className="input-field" 
                      placeholder="Or paste comma separated image URLs" 
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Product Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="input-field" 
                  rows={2} 
                  placeholder="Provide a general summary explaining material details, features, and utility." 
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Bullet Features (Newline separated) */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Highlight Features (one per line)</label>
                <textarea 
                  value={featuresInput} 
                  onChange={(e) => setFeaturesInput(e.target.value)} 
                  className="input-field" 
                  rows={3} 
                  placeholder="e.g. Air Cushion technology for corner safety&#10;Tactile click buttons for smooth responsiveness&#10;Rigid back cover prevents scratch marks" 
                  style={{ resize: 'vertical', fontFamily: 'monospace', fontSize: '11px' }}
                />
              </div>

              {/* Dynamic Specifications */}
              <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '12px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Category Specifications</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '10px' }}>
                    <input type="text" value={spec1Key} onChange={(e) => setSpec1Key(e.target.value)} className="input-field" placeholder="Spec 1 Title" style={{ height: '32px', fontSize: '11px' }} />
                    <input type="text" value={spec1Value} onChange={(e) => setSpec1Value(e.target.value)} className="input-field" placeholder="Spec 1 Value" style={{ height: '32px', fontSize: '11px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '10px' }}>
                    <input type="text" value={spec2Key} onChange={(e) => setSpec2Key(e.target.value)} className="input-field" placeholder="Spec 2 Title" style={{ height: '32px', fontSize: '11px' }} />
                    <input type="text" value={spec2Value} onChange={(e) => setSpec2Value(e.target.value)} className="input-field" placeholder="Spec 2 Value" style={{ height: '32px', fontSize: '11px' }} />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '10px' }}>
                    <input type="text" value={spec3Key} onChange={(e) => setSpec3Key(e.target.value)} className="input-field" placeholder="Spec 3 Title" style={{ height: '32px', fontSize: '11px' }} />
                    <input type="text" value={spec3Value} onChange={(e) => setSpec3Value(e.target.value)} className="input-field" placeholder="Spec 3 Value" style={{ height: '32px', fontSize: '11px' }} />
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Active Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value as Accessory['status'])} className="input-field">
                  <option value="available">Active Available</option>
                  <option value="out_of_stock">Out of Stock</option>
                  <option value="archived">Archived Hidden</option>
                </select>
              </div>

              {/* Save / Cancel buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => { setIsModalOpen(false); resetForm(); }}
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
                  <Save size={16} />
                  <span>Save Accessory</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
