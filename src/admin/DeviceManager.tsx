import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Device, Specifications, DeviceType } from '../types';
import { supabase, mapDeviceToDbProduct } from '../lib/supabase';
import { 
  Plus, Edit2, Copy, Archive, Trash2, X, 
  Smartphone, Tag, AlertTriangle, Layers, Save, CheckSquare, Square 
} from 'lucide-react';

export const DeviceManager: React.FC = () => {
  const { devices, showToast, registerUnsavedChanges, refetchProducts } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDevice, setEditingDevice] = useState<Device | null>(null);

  // Buffer and Edit states
  const [localDevices, setLocalDevices] = useState<Device[]>([]);
  const [deletedDeviceIds, setDeletedDeviceIds] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

  // Sync with context devices
  React.useEffect(() => {
    if (saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setLocalDevices(devices);
      setDeletedDeviceIds([]);
    }
  }, [devices, saveStatus]);

  // Check for unsaved changes
  React.useEffect(() => {
    const hasDiff = JSON.stringify(localDevices) !== JSON.stringify(devices)
      || deletedDeviceIds.length > 0;
      
    if (hasDiff) {
      setSaveStatus('unsaved');
      registerUnsavedChanges('devices', true);
    } else {
      setSaveStatus('idle');
      registerUnsavedChanges('devices', false);
    }
  }, [localDevices, deletedDeviceIds, devices]);

  // Unmount protection
  React.useEffect(() => {
    return () => {
      registerUnsavedChanges('devices', false);
    };
  }, []);

  const handleDuplicate = (id: string) => {
    const source = localDevices.find(d => d.id === id);
    if (!source) return;
    const dup: Device = {
      ...source,
      id: `${source.id}-copy-${Date.now().toString().slice(-3)}`,
      modelName: `${source.modelName} (Copy)`,
      views: 0,
      sales: 0
    };
    setLocalDevices(prev => [...prev, dup]);
    showToast("Product duplicated locally", "info");
  };

  const handleArchive = (id: string) => {
    setLocalDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'archived' } : d));
    showToast("Product marked archived locally", "info");
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this device catalog entry?")) {
      setLocalDevices(prev => prev.filter(d => d.id !== id));
      if (devices.some(d => d.id === id)) {
        setDeletedDeviceIds(prev => [...prev, id]);
      }
      showToast("Product removed locally", "info");
    }
  };

  const handleDiscard = () => {
    setLocalDevices(devices);
    setDeletedDeviceIds([]);
    setSaveStatus('idle');
    registerUnsavedChanges('devices', false);
    showToast("Changes discarded", "info");
  };

  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    try {
      // 1. Delete removed devices from Supabase
      for (const id of deletedDeviceIds) {
        const { error } = await supabase.from('products').delete().eq('id', id);
        if (error) throw error;
      }
      
      // 2. Save/insert/update local devices
      for (const d of localDevices) {
        const dbProduct = mapDeviceToDbProduct(d);
        dbProduct.status = d.stockCount > 0 ? (d.status === 'archived' ? 'archived' : 'available') : 'out_of_stock';
        
        const exists = devices.some(x => x.id === d.id);
        if (!exists || d.id.includes('-copy-') || d.id.includes('-temp-')) {
          const { error } = await supabase.from('products').insert(dbProduct);
          if (error) throw error;
        } else {
          const { error } = await supabase.from('products').update(dbProduct).eq('id', d.id);
          if (error) throw error;
        }
      }
      
      await refetchProducts();
      setSaveStatus('saved');
      registerUnsavedChanges('devices', false);
      showToast("Products saved successfully!", "success");
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Failed to save products:", err);
      setSaveStatus('error');
      showToast("Failed to save products: " + err.message, "error");
    }
  };

  // Core Form States
  const [brand, setBrand] = useState('');
  const [modelName, setModelName] = useState('');
  const [variant, setVariant] = useState('');
  const [ram, setRam] = useState('');
  const [storage, setStorage] = useState('');
  const [processor, setProcessor] = useState('');
  const [display, setDisplay] = useState('');
  const [battery, setBattery] = useState('');
  const [charging, setCharging] = useState('');
  const [cameras, setCameras] = useState('');
  const [weight, setWeight] = useState('');
  const [colors, setColors] = useState('');
  const [warranty, setWarranty] = useState('');
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [stockCount, setStockCount] = useState(0);
  const [description, setDescription] = useState('');
  const [features, setFeatures] = useState('');
  const [imageUrls, setImageUrls] = useState('');
  const [videoUrl, setVideoUrl] = useState('');

  // Classification State
  const [deviceType, setDeviceType] = useState<DeviceType>('brand_new');

  // Brand New Sealed fields
  const [factorySealed, setFactorySealed] = useState(true);
  const [officialBrandWarrantyAvailable, setOfficialBrandWarrantyAvailable] = useState(true);
  const [warrantyDuration, setWarrantyDuration] = useState('12 Months');
  const [launchDate, setLaunchDate] = useState('');
  const [invoiceAvailable, setInvoiceAvailable] = useState(true);

  // Used / Pre-Owned fields
  const [ownershipDetails, setOwnershipDetails] = useState<Device['ownershipDetails']>('first_owner');
  const [usedDuration, setUsedDuration] = useState('Less than 1 month');
  const [originalPurchaseDate, setOriginalPurchaseDate] = useState('');
  const [purchaseBillAvailable, setPurchaseBillAvailable] = useState(true);
  const [boxAvailable, setBoxAvailable] = useState(true);
  const [originalChargerAvailable, setOriginalChargerAvailable] = useState(true);
  const [originalCableAvailable, setOriginalCableAvailable] = useState(true);
  const [earphonesAvailable, setEarphonesAvailable] = useState(false);
  const [backCoverAvailable, setBackCoverAvailable] = useState(true);
  const [screenGuardApplied, setScreenGuardApplied] = useState(true);
  const [currentWarrantyStatus, setCurrentWarrantyStatus] = useState<Device['currentWarrantyStatus']>('under_brand');
  const [warrantyExpiryDate, setWarrantyExpiryDate] = useState('');
  const [batteryHealth, setBatteryHealth] = useState(100);
  const [deviceConditionGrade, setDeviceConditionGrade] = useState<Device['deviceConditionGrade']>('A');
  const [cosmeticConditionDescription, setCosmeticConditionDescription] = useState('');
  const [displayCondition, setDisplayCondition] = useState<Device['displayCondition']>('perfect');
  const [frameCondition, setFrameCondition] = useState<Device['frameCondition']>('excellent');
  const [backPanelCondition, setBackPanelCondition] = useState<Device['backPanelCondition']>('excellent');
  const [biometricStatus, setBiometricStatus] = useState<Device['biometricStatus']>('working');
  const [cameraCondition, setCameraCondition] = useState<Device['cameraCondition']>('perfect');
  const [speakerCondition, setSpeakerCondition] = useState<Device['speakerCondition']>('perfect');
  const [microphoneCondition, setMicrophoneCondition] = useState<Device['microphoneCondition']>('perfect');
  const [networkLockStatus, setNetworkLockStatus] = useState<Device['networkLockStatus']>('factory_unlocked');
  const [repairHistory, setRepairHistory] = useState<Device['repairHistory']>('never');
  const [repairDescription, setRepairDescription] = useState('');
  const [qualityCheckStatus, setQualityCheckStatus] = useState<string[]>([]);
  const [sellerNotes, setSellerNotes] = useState('');

  // Open Box fields
  const [openBoxBoxAvailable, setOpenBoxBoxAvailable] = useState(true);
  const [openBoxAccessoriesAvailable, setOpenBoxAccessoriesAvailable] = useState(true);
  const [openBoxWarrantyRemaining, setOpenBoxWarrantyRemaining] = useState('11 Months');
  const [openBoxActivationDate, setOpenBoxActivationDate] = useState('');
  const [openBoxReason, setOpenBoxReason] = useState('');

  // Refurbished fields
  const [refurbishedGrade, setRefurbishedGrade] = useState('Excellent (A)');
  const [refurbishedPartsReplaced, setRefurbishedPartsReplaced] = useState('None');
  const [refurbishedDate, setRefurbishedDate] = useState('');
  const [refurbishedBy, setRefurbishedBy] = useState('SriSai Mobile Lab');
  const [refurbishedWarrantyOffered, setRefurbishedWarrantyOffered] = useState('6 Months Store Warranty');

  // Demo Unit fields
  const [demoStoreUsageDuration, setDemoStoreUsageDuration] = useState('3 Months');
  const [demoUsageHours, setDemoUsageHours] = useState('120 Hours');
  const [demoPhysicalCondition, setDemoPhysicalCondition] = useState('Excellent (Flawless)');
  const [demoWarrantyStatus, setDemoWarrantyStatus] = useState('Warranty Expired');

  const qcOptions = [
    'Charging Tested',
    'Speaker Tested',
    'Microphone Tested',
    'Camera Tested',
    'WiFi Tested',
    'Bluetooth Tested',
    'SIM Tested',
    'Fingerprint Tested',
    'Face Unlock Tested'
  ];

  const handleToggleQCOption = (opt: string) => {
    setQualityCheckStatus(prev => 
      prev.includes(opt) ? prev.filter(o => o !== opt) : [...prev, opt]
    );
  };

  const openAddModal = () => {
    setEditingDevice(null);
    setBrand('Apple');
    setModelName('');
    setVariant('128GB');
    setRam('8GB');
    setStorage('128GB');
    setProcessor('');
    setDisplay('');
    setBattery('');
    setCharging('');
    setCameras('');
    setWeight('');
    setColors('Natural Titanium, White Titanium');
    setWarranty('1 Year Brand Warranty');
    setPrice(0);
    setOfferPrice(0);
    setStockCount(5);
    setDescription('');
    setFeatures('Fast wireless charging, Sleek titanium case');
    setImageUrls('https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=800&auto=format&fit=crop');
    setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');

    // Reset inventory specs
    setDeviceType('brand_new');
    setFactorySealed(true);
    setOfficialBrandWarrantyAvailable(true);
    setWarrantyDuration('12 Months');
    setLaunchDate('');
    setInvoiceAvailable(true);

    setOwnershipDetails('first_owner');
    setUsedDuration('Less than 1 month');
    setOriginalPurchaseDate('');
    setPurchaseBillAvailable(true);
    setBoxAvailable(true);
    setOriginalChargerAvailable(true);
    setOriginalCableAvailable(true);
    setEarphonesAvailable(false);
    setBackCoverAvailable(true);
    setScreenGuardApplied(true);
    setCurrentWarrantyStatus('under_brand');
    setWarrantyExpiryDate('');
    setBatteryHealth(100);
    setDeviceConditionGrade('A');
    setCosmeticConditionDescription('');
    setDisplayCondition('perfect');
    setFrameCondition('excellent');
    setBackPanelCondition('excellent');
    setBiometricStatus('working');
    setCameraCondition('perfect');
    setSpeakerCondition('perfect');
    setMicrophoneCondition('perfect');
    setNetworkLockStatus('factory_unlocked');
    setRepairHistory('never');
    setRepairDescription('');
    setQualityCheckStatus([...qcOptions]); // select all by default
    setSellerNotes('');

    setOpenBoxBoxAvailable(true);
    setOpenBoxAccessoriesAvailable(true);
    setOpenBoxWarrantyRemaining('11 Months');
    setOpenBoxActivationDate('');
    setOpenBoxReason('');

    setRefurbishedGrade('Excellent (A)');
    setRefurbishedPartsReplaced('None');
    setRefurbishedDate('');
    setRefurbishedBy('SriSai Mobile Lab');
    setRefurbishedWarrantyOffered('6 Months Store Warranty');

    setDemoStoreUsageDuration('3 Months');
    setDemoUsageHours('120 Hours');
    setDemoPhysicalCondition('Excellent (Flawless)');
    setDemoWarrantyStatus('Warranty Expired');

    setIsModalOpen(true);
  };

  const openEditModal = (device: Device) => {
    setEditingDevice(device);
    setBrand(device.brand);
    setModelName(device.modelName);
    setVariant(device.variant);
    setRam(device.ram);
    setStorage(device.storage);
    setProcessor(device.processor);
    setDisplay(device.display);
    setBattery(device.battery);
    setCharging(device.charging);
    setCameras(device.cameras);
    setWeight(device.weight);
    setColors(device.colors.join(', '));
    setWarranty(device.warranty);
    setPrice(device.price);
    setOfferPrice(device.offerPrice);
    setStockCount(device.stockCount);
    setDescription(device.description);
    setFeatures(device.features.join('\n'));
    setImageUrls(device.images.join('\n'));
    setVideoUrl(device.videoUrl || '');

    // Map classification specs
    setDeviceType(device.deviceType);
    setFactorySealed(device.factorySealed !== false);
    setOfficialBrandWarrantyAvailable(device.officialBrandWarrantyAvailable !== false);
    setWarrantyDuration(device.warrantyDuration || '12 Months');
    setLaunchDate(device.launchDate || '');
    setInvoiceAvailable(device.invoiceAvailable !== false);

    setOwnershipDetails(device.ownershipDetails || 'first_owner');
    setUsedDuration(device.usedDuration || 'Less than 1 month');
    setOriginalPurchaseDate(device.originalPurchaseDate || '');
    setPurchaseBillAvailable(device.purchaseBillAvailable !== false);
    setBoxAvailable(device.boxAvailable !== false);
    setOriginalChargerAvailable(device.originalChargerAvailable !== false);
    setOriginalCableAvailable(device.originalCableAvailable !== false);
    setEarphonesAvailable(!!device.earphonesAvailable);
    setBackCoverAvailable(device.backCoverAvailable !== false);
    setScreenGuardApplied(!!device.screenGuardApplied);
    setCurrentWarrantyStatus(device.currentWarrantyStatus || 'under_brand');
    setWarrantyExpiryDate(device.warrantyExpiryDate || '');
    setBatteryHealth(device.batteryHealth ?? 100);
    setDeviceConditionGrade(device.deviceConditionGrade || 'A');
    setCosmeticConditionDescription(device.cosmeticConditionDescription || '');
    setDisplayCondition(device.displayCondition || 'perfect');
    setFrameCondition(device.frameCondition || 'excellent');
    setBackPanelCondition(device.backPanelCondition || 'excellent');
    setBiometricStatus(device.biometricStatus || 'working');
    setCameraCondition(device.cameraCondition || 'perfect');
    setSpeakerCondition(device.speakerCondition || 'perfect');
    setMicrophoneCondition(device.microphoneCondition || 'perfect');
    setNetworkLockStatus(device.networkLockStatus || 'factory_unlocked');
    setRepairHistory(device.repairHistory || 'never');
    setRepairDescription(device.repairDescription || '');
    setQualityCheckStatus(device.qualityCheckStatus || []);
    setSellerNotes(device.sellerNotes || '');

    setOpenBoxBoxAvailable(device.openBoxBoxAvailable !== false);
    setOpenBoxAccessoriesAvailable(device.openBoxAccessoriesAvailable !== false);
    setOpenBoxWarrantyRemaining(device.openBoxWarrantyRemaining || '11 Months');
    setOpenBoxActivationDate(device.openBoxActivationDate || '');
    setOpenBoxReason(device.openBoxReason || '');

    setRefurbishedGrade(device.refurbishedGrade || 'Excellent (A)');
    setRefurbishedPartsReplaced(device.refurbishedPartsReplaced || 'None');
    setRefurbishedDate(device.refurbishedDate || '');
    setRefurbishedBy(device.refurbishedBy || 'SriSai Mobile Lab');
    setRefurbishedWarrantyOffered(device.refurbishedWarrantyOffered || '6 Months Store Warranty');

    setDemoStoreUsageDuration(device.demoStoreUsageDuration || '3 Months');
    setDemoUsageHours(device.demoUsageHours || '120 Hours');
    setDemoPhysicalCondition(device.demoPhysicalCondition || 'Excellent (Flawless)');
    setDemoWarrantyStatus(device.demoWarrantyStatus || 'Warranty Expired');

    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!modelName || !brand || price <= 0 || offerPrice <= 0) {
      alert('Please fill in required fields (Model, Brand, and valid prices).');
      return;
    }

    const colorList = colors.split(',').map(s => s.trim()).filter(s => s !== '');
    const featureList = features.split('\n').map(s => s.trim()).filter(s => s !== '');
    const imageList = imageUrls.split('\n').map(s => s.trim()).filter(s => s !== '');

    const specs: Specifications = {
      display: display || 'OLED Display Screen',
      processor,
      ram,
      storage,
      battery: battery || '5000 mAh',
      charging,
      camera: cameras,
      weight,
      connectivity: editingDevice?.specifications.connectivity || '5G, Wi-Fi 7, Bluetooth 5.4, NFC',
      warranty
    };

    const id = editingDevice?.id || `${brand.toLowerCase()}-${modelName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newOrUpdated: Device = {
      id,
      brand,
      modelName,
      variant,
      ram,
      storage,
      processor,
      display,
      battery,
      charging,
      cameras,
      weight,
      colors: colorList,
      warranty,
      price: Number(price),
      offerPrice: Number(offerPrice),
      stockCount: Number(stockCount),
      description,
      specifications: specs,
      features: featureList,
      images: imageList,
      videoUrl: videoUrl || undefined,
      status: stockCount > 0 ? (editingDevice?.status === 'archived' ? 'archived' : 'available') : 'out_of_stock',
      views: editingDevice?.views || 0,
      sales: editingDevice?.sales || 0,
      deviceType,
      factorySealed,
      officialBrandWarrantyAvailable,
      warrantyDuration,
      launchDate: launchDate || undefined,
      invoiceAvailable,
      ownershipDetails,
      usedDuration,
      originalPurchaseDate: originalPurchaseDate || undefined,
      purchaseBillAvailable,
      boxAvailable,
      originalChargerAvailable,
      originalCableAvailable,
      earphonesAvailable,
      backCoverAvailable,
      screenGuardApplied,
      currentWarrantyStatus,
      warrantyExpiryDate: (currentWarrantyStatus === 'under_brand' || currentWarrantyStatus === 'under_extended') ? warrantyExpiryDate : undefined,
      batteryHealth: Number(batteryHealth),
      deviceConditionGrade,
      cosmeticConditionDescription,
      displayCondition,
      frameCondition,
      backPanelCondition,
      biometricStatus,
      cameraCondition,
      speakerCondition,
      microphoneCondition,
      networkLockStatus,
      repairHistory,
      repairDescription,
      qualityCheckStatus: deviceType === 'used' ? qualityCheckStatus : [],
      sellerNotes,
      openBoxBoxAvailable,
      openBoxAccessoriesAvailable,
      openBoxWarrantyRemaining,
      openBoxActivationDate: openBoxActivationDate || undefined,
      openBoxReason,
      refurbishedGrade,
      refurbishedPartsReplaced,
      refurbishedDate: refurbishedDate || undefined,
      refurbishedBy,
      refurbishedWarrantyOffered,
      demoStoreUsageDuration,
      demoUsageHours,
      demoPhysicalCondition,
      demoWarrantyStatus
    };

    if (editingDevice) {
      setLocalDevices(prev => prev.map(d => d.id === editingDevice.id ? newOrUpdated : d));
    } else {
      setLocalDevices(prev => [...prev, newOrUpdated]);
    }

    setIsModalOpen(false);
  };

  const getDeviceTypeLabel = (type: DeviceType) => {
    switch (type) {
      case 'brand_new': return '🟢 Brand New';
      case 'open_box': return '🟡 Open Box';
      case 'refurbished': return '🔵 Refurbished';
      case 'demo_unit': return '🟣 Demo Unit';
      case 'used': return '🟠 Used Phone';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Action Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Device Inventory</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Create, update, duplicate, or archive devices in the shopping catalog.</p>
        </div>
        
        <button 
          onClick={openAddModal}
          className="premium-btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '12px' }}
        >
          <Plus size={16} />
          <span>Add Smartphone</span>
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

      {/* Catalog Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden', borderRadius: '16px' }}>
        
        {/* Desktop View */}
        <div className="desktop-only" style={{ overflowX: 'auto', width: '100%' }}>
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
                <th style={{ padding: '14px 16px' }}>Device Details</th>
                <th style={{ padding: '14px 16px' }}>Type</th>
                <th style={{ padding: '14px 16px' }}>Specs (RAM/ROM)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>List Price</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Offer Price</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Stock</th>
                <th style={{ padding: '14px 16px' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {localDevices.map(d => (
                <tr 
                  key={d.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)',
                    opacity: d.status === 'archived' ? 0.6 : 1
                  }}
                >
                  {/* Details */}
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img 
                        src={d.images[0] || 'logo.jpg'} 
                        alt={d.modelName} 
                        style={{ width: '40px', height: '40px', objectFit: 'contain', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', padding: '2px' }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '14px' }}>{d.modelName}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{d.brand} • {d.variant}</span>
                      </div>
                    </div>
                  </td>

                  {/* Classification Type */}
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    {getDeviceTypeLabel(d.deviceType)}
                  </td>

                  {/* Specs */}
                  <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                    {d.ram} / {d.storage}
                  </td>

                  {/* Prices */}
                  <td style={{ padding: '12px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                    ₹{d.price.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 'bold' }}>
                    ₹{d.offerPrice.toLocaleString('en-IN')}
                  </td>

                  {/* Stock Count */}
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{
                      fontWeight: 700,
                      color: d.stockCount <= 2 ? 'var(--error)' : 'inherit'
                    }}>
                      {d.stockCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: '12px 16px' }}>
                    {d.status === 'archived' ? (
                       <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>Archived</span>
                    ) : d.stockCount === 0 ? (
                      <span className="badge badge-out">Out of stock</span>
                    ) : d.stockCount <= 2 ? (
                      <span className="badge badge-low-stock">Low Stock</span>
                    ) : (
                      <span className="badge badge-stock">Active</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => openEditModal(d)}
                        style={{ border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                        title="Edit Device"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button 
                        onClick={() => handleDuplicate(d.id)}
                        style={{ border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                        title="Duplicate Device"
                      >
                        <Copy size={13} />
                      </button>
                      {d.status !== 'archived' && (
                        <button 
                          onClick={() => handleArchive(d.id)}
                          style={{ border: 'none', background: 'var(--bg-subtle)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                          title="Archive Device"
                        >
                          <Archive size={13} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(d.id)}
                        style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--error)', cursor: 'pointer', padding: '6px', borderRadius: '6px' }}
                        title="Delete Device"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
          {localDevices.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)' }}>
              No devices found.
            </div>
          ) : (
            localDevices.map(d => (
              <div 
                key={d.id} 
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
                  opacity: d.status === 'archived' ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <img 
                    src={d.images[0] || 'logo.jpg'} 
                    alt={d.modelName} 
                    style={{ width: '50px', height: '50px', objectFit: 'contain', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <strong style={{ fontSize: '15px' }}>{d.modelName}</strong>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{d.brand} • {d.variant}</span>
                  </div>
                  <div>
                    {d.status === 'archived' ? (
                      <span className="badge" style={{ backgroundColor: 'var(--border-color)', color: 'var(--text-muted)' }}>Archived</span>
                    ) : d.stockCount === 0 ? (
                      <span className="badge badge-out">Out</span>
                    ) : d.stockCount <= 2 ? (
                      <span className="badge badge-low-stock">Low</span>
                    ) : (
                      <span className="badge badge-stock">Active</span>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <div>Type: <strong style={{ color: 'var(--text-main)' }}>{getDeviceTypeLabel(d.deviceType).split(' ').slice(1).join(' ') || getDeviceTypeLabel(d.deviceType)}</strong></div>
                  <div>Specs: <strong style={{ color: 'var(--text-main)' }}>{d.ram}/{d.storage}</strong></div>
                  <div>Stock: <strong style={{ color: d.stockCount <= 2 ? 'var(--error)' : 'var(--text-main)' }}>{d.stockCount} units</strong></div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Offer Price:</span><br/>
                    <strong style={{ fontSize: '15px', color: 'var(--text-main)' }}>₹{d.offerPrice.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>List Price:</span><br/>
                    <span style={{ fontSize: '13px', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{d.price.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div style={{ display: 'flex', gap: '6px', borderTop: '1px solid var(--border-color)', paddingTop: '8px', width: '100%' }}>
                  <button 
                    onClick={() => openEditModal(d)}
                    className="premium-btn btn-primary"
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '36px' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDuplicate(d.id)}
                    className="premium-btn btn-secondary"
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '36px' }}
                  >
                    Duplicate
                  </button>
                  {d.status !== 'archived' && (
                    <button 
                      onClick={() => handleArchive(d.id)}
                      className="premium-btn btn-secondary"
                      style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', minHeight: '36px' }}
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(d.id)}
                    className="premium-btn btn-secondary"
                    style={{ padding: '8px 12px', borderRadius: '8px', fontSize: '12px', minHeight: '36px', borderColor: 'var(--error)', color: 'var(--error)' }}
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

              </div>
            ))
          )}
        </div>

      </div>

      {/* Edit/Add Modal Overlay */}
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
            maxWidth: '800px',
            maxHeight: '90vh',
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
                {editingDevice ? `Edit Product: ${editingDevice.modelName}` : 'Add Smartphone Catalog Entry'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            {/* Form Fields */}
            <form onSubmit={handleSubmit} style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', margin: '0' }}>1. Basic Properties</h4>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Device Type *</label>
                  <select value={deviceType} onChange={(e) => setDeviceType(e.target.value as DeviceType)} className="input-field" style={{ padding: '10px' }} required>
                    <option value="brand_new">Brand New Sealed</option>
                    <option value="used">Used / Pre-Owned</option>
                    <option value="open_box">Open Box</option>
                    <option value="refurbished">Refurbished</option>
                    <option value="demo_unit">Demo Unit</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand *</label>
                  <select value={brand} onChange={(e) => setBrand(e.target.value)} className="input-field" style={{ padding: '10px' }} required>
                    {['Apple', 'Samsung', 'OnePlus', 'Nothing', 'Xiaomi', 'Vivo', 'Oppo', 'Realme', 'Motorola', 'Google'].map(b => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Model Name *</label>
                  <input type="text" value={modelName} onChange={(e) => setModelName(e.target.value)} className="input-field" placeholder="iPhone 15 Pro Max" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Variant *</label>
                  <input type="text" value={variant} onChange={(e) => setVariant(e.target.value)} className="input-field" placeholder="e.g. 256GB" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>RAM Space *</label>
                  <input type="text" value={ram} onChange={(e) => setRam(e.target.value)} className="input-field" placeholder="e.g. 8GB" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Storage Space *</label>
                  <input type="text" value={storage} onChange={(e) => setStorage(e.target.value)} className="input-field" placeholder="e.g. 256GB" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Processor Model</label>
                  <input type="text" value={processor} onChange={(e) => setProcessor(e.target.value)} className="input-field" placeholder="A17 Pro chip" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Display Screen Specs</label>
                  <input type="text" value={display} onChange={(e) => setDisplay(e.target.value)} className="input-field" placeholder="6.7-inch OLED" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Battery Capacity</label>
                  <input type="text" value={battery} onChange={(e) => setBattery(e.target.value)} className="input-field" placeholder="4400 mAh" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Charging Speed</label>
                  <input type="text" value={charging} onChange={(e) => setCharging(e.target.value)} className="input-field" placeholder="25W wired" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Weight (g)</label>
                  <input type="text" value={weight} onChange={(e) => setWeight(e.target.value)} className="input-field" placeholder="221g" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Rear/Front Cameras</label>
                  <input type="text" value={cameras} onChange={(e) => setCameras(e.target.value)} className="input-field" placeholder="48MP + 12MP + 12MP" />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Term</label>
                  <input type="text" value={warranty} onChange={(e) => setWarranty(e.target.value)} className="input-field" placeholder="1 Year Warranty" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Colors (Comma Separated) *</label>
                  <input type="text" value={colors} onChange={(e) => setColors(e.target.value)} className="input-field" placeholder="Natural Titanium, White Titanium" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Base Price *</label>
                  <input type="number" value={price || ''} onChange={(e) => setPrice(Number(e.target.value))} className="input-field" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Offer Price *</label>
                  <input type="number" value={offerPrice || ''} onChange={(e) => setOfferPrice(Number(e.target.value))} className="input-field" required />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Stock Count *</label>
                  <input type="number" value={stockCount} onChange={(e) => setStockCount(Number(e.target.value))} className="input-field" required />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Video URL (Mock MP4 link)</label>
                  <input type="text" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="input-field" />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Images (One URL per line) *</label>
                <textarea rows={2} value={imageUrls} onChange={(e) => setImageUrls(e.target.value)} className="input-field" placeholder="Paste Unsplash image link" style={{ resize: 'vertical' }} required />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Features Bullet Points (One per line) *</label>
                <textarea rows={2} value={features} onChange={(e) => setFeatures(e.target.value)} className="input-field" placeholder="Aerospace titanium casing" style={{ resize: 'vertical' }} required />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Product Description</label>
                <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} className="input-field" placeholder="Brief paragraph detailing phone..." style={{ resize: 'vertical' }} />
              </div>


              {/* 2. DYNAMIC SPECIFICATION FORMS BY DEVICE TYPE */}
              <h4 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--primary)', margin: '10px 0 0 0' }}>
                2. Inventory Diagnostics: {getDeviceTypeLabel(deviceType)}
              </h4>

              {/* BRAND NEW SEALED */}
              {deviceType === 'brand_new' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Factory Sealed *</label>
                    <select value={factorySealed ? 'yes' : 'no'} onChange={(e) => setFactorySealed(e.target.value === 'yes')} className="input-field" style={{ padding: '10px' }} required>
                      <option value="yes">Yes (Sealed Box)</option>
                      <option value="no">No (Unsealed)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Brand Warranty *</label>
                    <select value={officialBrandWarrantyAvailable ? 'yes' : 'no'} onChange={(e) => setOfficialBrandWarrantyAvailable(e.target.value === 'yes')} className="input-field" style={{ padding: '10px' }} required>
                      <option value="yes">Warranty Available</option>
                      <option value="no">No Brand Warranty</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Duration</label>
                    <input type="text" value={warrantyDuration} onChange={(e) => setWarrantyDuration(e.target.value)} className="input-field" placeholder="e.g. 12 Months" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Launch Date</label>
                    <input type="date" value={launchDate} onChange={(e) => setLaunchDate(e.target.value)} className="input-field" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Invoice Provided *</label>
                    <select value={invoiceAvailable ? 'yes' : 'no'} onChange={(e) => setInvoiceAvailable(e.target.value === 'yes')} className="input-field" style={{ padding: '10px' }} required>
                      <option value="yes">Yes (GST Invoice)</option>
                      <option value="no">No Invoice</option>
                    </select>
                  </div>
                </div>
              )}

              {/* USED / PRE-OWNED */}
              {deviceType === 'used' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Ownership *</label>
                      <select value={ownershipDetails} onChange={(e) => setOwnershipDetails(e.target.value as any)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="first_owner">First Owner</option>
                        <option value="second_owner">Second Owner</option>
                        <option value="third_owner_plus">Third Owner+</option>
                        <option value="unknown">Unknown Ownership</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Used Duration *</label>
                      <select value={usedDuration} onChange={(e) => setUsedDuration(e.target.value)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="Less than 1 month">Less than 1 month</option>
                        <option value="1-3 months">1-3 months</option>
                        <option value="3-6 months">3-6 months</option>
                        <option value="6-12 months">6-12 months</option>
                        <option value="1-2 years">1-2 years</option>
                        <option value="More than 2 years">More than 2 years</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Original Purchase Date</label>
                      <input type="date" value={originalPurchaseDate} onChange={(e) => setOriginalPurchaseDate(e.target.value)} className="input-field" />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Status *</label>
                      <select value={currentWarrantyStatus} onChange={(e) => setCurrentWarrantyStatus(e.target.value as any)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="under_brand">Under Brand Warranty</option>
                        <option value="under_extended">Under Extended Warranty</option>
                        <option value="warranty_expired">Warranty Expired</option>
                        <option value="no_warranty">No Warranty</option>
                      </select>
                    </div>
                    {(currentWarrantyStatus === 'under_brand' || currentWarrantyStatus === 'under_extended') && (
                      <div>
                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Expiry Date *</label>
                        <input type="date" value={warrantyExpiryDate} onChange={(e) => setWarrantyExpiryDate(e.target.value)} className="input-field" required />
                      </div>
                    )}
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Battery Health (%) *</label>
                      <input type="number" value={batteryHealth} onChange={(e) => setBatteryHealth(Number(e.target.value))} className="input-field" min={30} max={100} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Condition Grade *</label>
                      <select value={deviceConditionGrade} onChange={(e) => setDeviceConditionGrade(e.target.value as any)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="A_plus">Like New (A+)</option>
                        <option value="A">Excellent (A)</option>
                        <option value="B_plus">Good (B+)</option>
                        <option value="B">Average (B)</option>
                        <option value="C">Heavy Usage (C)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', gridColumn: 'span 100%', marginBottom: '4px' }}>Inclusions & Papers</div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Purchase Bill</span>
                      <select value={purchaseBillAvailable ? 'y' : 'n'} onChange={(e) => setPurchaseBillAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Original Box</span>
                      <select value={boxAvailable ? 'y' : 'n'} onChange={(e) => setBoxAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Original Charger</span>
                      <select value={originalChargerAvailable ? 'y' : 'n'} onChange={(e) => setOriginalChargerAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Original Cable</span>
                      <select value={originalCableAvailable ? 'y' : 'n'} onChange={(e) => setOriginalCableAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Earphones</span>
                      <select value={earphonesAvailable ? 'y' : 'n'} onChange={(e) => setEarphonesAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Back Cover</span>
                      <select value={backCoverAvailable ? 'y' : 'n'} onChange={(e) => setBackCoverAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px', cursor: 'pointer' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Screen Guard</span>
                      <select value={screenGuardApplied ? 'y' : 'n'} onChange={(e) => setScreenGuardApplied(e.target.value === 'y')} className="input-field" style={{ padding: '6px' }}><option value="y">Yes</option><option value="n">No</option></select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', backgroundColor: 'var(--bg-subtle)', padding: '14px', borderRadius: '12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', gridColumn: 'span 100%', marginBottom: '4px' }}>Hardware Cosmetic Checks</div>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Display Screen</span>
                      <select value={displayCondition} onChange={(e) => setDisplayCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="perfect">Perfect</option>
                        <option value="minor_scratches">Minor Scratches</option>
                        <option value="visible_scratches">Visible Scratches</option>
                        <option value="replaced">Replaced Display</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Frame Condition</span>
                      <select value={frameCondition} onChange={(e) => setFrameCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="excellent">Excellent</option>
                        <option value="minor_scratches">Minor Scratches</option>
                        <option value="dents">Dents Present</option>
                        <option value="replaced">Replaced Frame</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Back Panel</span>
                      <select value={backPanelCondition} onChange={(e) => setBackPanelCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="excellent">Excellent</option>
                        <option value="minor_scratches">Minor Scratches</option>
                        <option value="cracked">Cracked Back</option>
                        <option value="replaced">Replaced Panel</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Biometrics Lock</span>
                      <select value={biometricStatus} onChange={(e) => setBiometricStatus(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="working">Working</option>
                        <option value="not_working">Not Working</option>
                        <option value="not_available">Not Available</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Cameras</span>
                      <select value={cameraCondition} onChange={(e) => setCameraCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="perfect">Perfect</option>
                        <option value="minor_issues">Minor Issues</option>
                        <option value="needs_repair">Needs Repair</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Speakers</span>
                      <select value={speakerCondition} onChange={(e) => setSpeakerCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="perfect">Perfect</option>
                        <option value="distorted">Distorted Sound</option>
                        <option value="needs_repair">Needs Repair</option>
                      </select>
                    </label>
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Microphone</span>
                      <select value={microphoneCondition} onChange={(e) => setMicrophoneCondition(e.target.value as any)} className="input-field" style={{ padding: '6px' }}>
                        <option value="perfect">Perfect</option>
                        <option value="minor_issue">Minor Issue</option>
                        <option value="needs_repair">Needs Repair</option>
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Carrier Network lock *</label>
                      <select value={networkLockStatus} onChange={(e) => setNetworkLockStatus(e.target.value as any)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="factory_unlocked">Factory Unlocked (All SIMs)</option>
                        <option value="carrier_locked">Carrier Locked</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Repairs History *</label>
                      <select value={repairHistory} onChange={(e) => setRepairHistory(e.target.value as any)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="never">Never Repaired (All OEM Stock)</option>
                        <option value="screen">Screen Replaced</option>
                        <option value="battery">Battery Replaced</option>
                        <option value="camera">Camera Replaced</option>
                        <option value="motherboard">Motherboard Repaired</option>
                        <option value="multiple">Multiple Repairs</option>
                      </select>
                    </div>
                  </div>

                  {repairHistory !== 'never' && (
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Repair Description *</label>
                      <textarea rows={2} value={repairDescription} onChange={(e) => setRepairDescription(e.target.value)} className="input-field" placeholder="Provide replacement parts vendor source, quality level, etc." required />
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Cosmetic Condition Notes</label>
                    <textarea rows={2} value={cosmeticConditionDescription} onChange={(e) => setCosmeticConditionDescription(e.target.value)} className="input-field" placeholder="e.g. Minor scratches near charging port, back glass in flawless condition." />
                  </div>

                  {/* Quality Check Checklist options */}
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Lab Quality Check Pass List</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                      {qcOptions.map(opt => {
                        const isChecked = qualityCheckStatus.includes(opt);
                        return (
                          <div 
                            key={opt}
                            onClick={() => handleToggleQCOption(opt)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              backgroundColor: isChecked ? 'rgba(16, 185, 129, 0.08)' : 'var(--bg-subtle)',
                              border: isChecked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid var(--border-color)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: 600,
                              color: isChecked ? 'var(--success)' : 'inherit',
                              transition: 'all 0.2s'
                            }}
                          >
                            {isChecked ? <CheckSquare size={14} /> : <Square size={14} />}
                            <span>{opt}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Seller / Internal Notes</label>
                    <textarea rows={2} value={sellerNotes} onChange={(e) => setSellerNotes(e.target.value)} className="input-field" placeholder="Internal notes, customer profile, payout amounts, etc." />
                  </div>

                </div>
              )}

              {/* OPEN BOX */}
              {deviceType === 'open_box' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Original Box Available *</label>
                      <select value={openBoxBoxAvailable ? 'y' : 'n'} onChange={(e) => setOpenBoxBoxAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '10px' }} required>
                        <option value="y">Yes (Box Included)</option>
                        <option value="n">No Box</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Accessories Included *</label>
                      <select value={openBoxAccessoriesAvailable ? 'y' : 'n'} onChange={(e) => setOpenBoxAccessoriesAvailable(e.target.value === 'y')} className="input-field" style={{ padding: '10px' }} required>
                        <option value="y">Yes (All OEM Accessories)</option>
                        <option value="n">No / Missing Items</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Remaining Warranty Duration</label>
                      <input type="text" value={openBoxWarrantyRemaining} onChange={(e) => setOpenBoxWarrantyRemaining(e.target.value)} className="input-field" placeholder="e.g. 11 Months" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Activation Date</label>
                      <input type="date" value={openBoxActivationDate} onChange={(e) => setOpenBoxActivationDate(e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Reason for Open Box status</label>
                      <input type="text" value={openBoxReason} onChange={(e) => setOpenBoxReason(e.target.value)} className="input-field" placeholder="e.g. Customer returned under 24 hours trial policy." />
                    </div>
                  </div>
                </div>
              )}

              {/* REFURBISHED */}
              {deviceType === 'refurbished' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Refurbishment Grade *</label>
                      <select value={refurbishedGrade} onChange={(e) => setRefurbishedGrade(e.target.value)} className="input-field" style={{ padding: '10px' }} required>
                        <option value="Like New (A+)">Like New (A+)</option>
                        <option value="Excellent (A)">Excellent (A)</option>
                        <option value="Good (B+)">Good (B+)</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Refurbished Date</label>
                      <input type="date" value={refurbishedDate} onChange={(e) => setRefurbishedDate(e.target.value)} className="input-field" />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Refurbished By</label>
                      <input type="text" value={refurbishedBy} onChange={(e) => setRefurbishedBy(e.target.value)} className="input-field" placeholder="SriSai Mobile Lab" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Offered</label>
                      <input type="text" value={refurbishedWarrantyOffered} onChange={(e) => setRefurbishedWarrantyOffered(e.target.value)} className="input-field" placeholder="e.g. 6 Months Store Warranty" />
                    </div>
                    <div>
                      <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Parts Replaced / Repaired</label>
                      <input type="text" value={refurbishedPartsReplaced} onChange={(e) => setRefurbishedPartsReplaced(e.target.value)} className="input-field" placeholder="e.g. Battery Replaced, Back Glass Replaced" />
                    </div>
                  </div>
                </div>
              )}

              {/* DEMO UNIT */}
              {deviceType === 'demo_unit' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Store Usage Duration</label>
                    <input type="text" value={demoStoreUsageDuration} onChange={(e) => setDemoStoreUsageDuration(e.target.value)} className="input-field" placeholder="e.g. 3 Months" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Total Screen Usage Hours</label>
                    <input type="text" value={demoUsageHours} onChange={(e) => setDemoUsageHours(e.target.value)} className="input-field" placeholder="e.g. 120 Hours" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Physical Condition</label>
                    <input type="text" value={demoPhysicalCondition} onChange={(e) => setDemoPhysicalCondition(e.target.value)} className="input-field" placeholder="e.g. Flawless condition" />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Warranty Status</label>
                    <input type="text" value={demoWarrantyStatus} onChange={(e) => setDemoWarrantyStatus(e.target.value)} className="input-field" placeholder="Warranty Expired" />
                  </div>
                </div>
              )}

              {/* Action */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="premium-btn btn-secondary" style={{ flex: 1, padding: '12px' }}>Cancel</button>
                <button type="submit" className="premium-btn btn-primary" style={{ flex: 1.5, padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <Save size={16} />
                  <span>Save Device Details</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
