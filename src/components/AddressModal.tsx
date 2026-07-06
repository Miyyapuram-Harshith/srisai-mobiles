import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Address } from '../types';
import { checkPincodeServiceability } from '../utils/pincodeService';
import { X, MapPin, Plus, Check, Trash, Map } from 'lucide-react';

interface AddressModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddressModal: React.FC<AddressModalProps> = ({ isOpen, onClose }) => {
  const { 
    addresses, selectedAddress, setSelectedAddress, addAddress, removeAddress 
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [apartmentName, setApartmentName] = useState('');
  const [streetName, setStreetName] = useState('');
  const [landmark, setLandmark] = useState('');
  const [areaColony, setAreaColony] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [googleMapsLink, setGoogleMapsLink] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');
  const [preferredTimeSlot, setPreferredTimeSlot] = useState('Anytime (9 AM - 7 PM)');
  const [isDefault, setIsDefault] = useState(false);

  const [pincodeWarning, setPincodeWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setPincode(val);

    if (val.length === 6) {
      const res = checkPincodeServiceability(val, 0);
      if (!res.serviceable) {
        setPincodeWarning(`Warning: ${res.message}`);
      } else {
        setPincodeWarning(null);
        setCity(res.locationName.split(' ')[0] || '');
        setDistrict(res.locationName.split(' ')[0] || '');
        setState(val.startsWith('505') || val.startsWith('506') || val.startsWith('500') ? 'Telangana' : '');
      }
    } else {
      setPincodeWarning(null);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !phone || !pincode || !houseNumber || !streetName || !areaColony || !city || !state) {
      alert('Please fill out all required address fields.');
      return;
    }

    const res = checkPincodeServiceability(pincode, 0);
    if (!res.serviceable) {
      alert(`Pincode Error: ${res.message}. We cannot deliver to unserviceable pincodes.`);
      return;
    }

    addAddress({
      fullName,
      phone,
      alternatePhone: alternatePhone || undefined,
      houseNumber,
      apartmentName: apartmentName || undefined,
      streetName,
      landmark: landmark || undefined,
      areaColony,
      city,
      district: district || undefined,
      state,
      pincode,
      isDefault,
      googleMapsLink: googleMapsLink || undefined,
      deliveryInstructions: deliveryInstructions || undefined,
      preferredTimeSlot
    });

    // Reset Form
    setFullName('');
    setPhone('');
    setAlternatePhone('');
    setHouseNumber('');
    setApartmentName('');
    setStreetName('');
    setLandmark('');
    setAreaColony('');
    setCity('');
    setDistrict('');
    setState('');
    setPincode('');
    setGoogleMapsLink('');
    setDeliveryInstructions('');
    setPreferredTimeSlot('Anytime (9 AM - 7 PM)');
    setIsDefault(false);
    setShowAddForm(false);
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
        width: 'min(100%, 560px)',
        maxWidth: '100%',
        maxHeight: '85vh',
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
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Manage Address Book</h2>
          </div>
          <button 
            onClick={onClose}
            style={{
              border: 'none',
              background: 'var(--bg-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
          {showAddForm ? (
            /* Add New Address Form */
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '4px' }}>Add New Delivery Address</h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Mobile Number *</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Alternate Mobile</label>
                  <input
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Pincode *</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={handlePincodeChange}
                    className="input-field"
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              {pincodeWarning && (
                <div style={{ fontSize: '12px', color: 'var(--error)', fontWeight: 600 }}>
                  {pincodeWarning}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Flat / House No. *</label>
                  <input
                    type="text"
                    placeholder="e.g. H.No 2-4-53"
                    value={houseNumber}
                    onChange={(e) => setHouseNumber(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Apartment Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sai residency"
                    value={apartmentName}
                    onChange={(e) => setApartmentName(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Street Name *</label>
                  <input
                    type="text"
                    value={streetName}
                    onChange={(e) => setStreetName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Landmark</label>
                  <input
                    type="text"
                    placeholder="e.g. Near Bus Stand"
                    value={landmark}
                    onChange={(e) => setLandmark(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Area / Colony *</label>
                  <input
                    type="text"
                    value={areaColony}
                    onChange={(e) => setAreaColony(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>City *</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>District *</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>State *</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Google Maps URL Link</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/..."
                  value={googleMapsLink}
                  onChange={(e) => setGoogleMapsLink(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Delivery Instructions</label>
                  <input
                    type="text"
                    placeholder="e.g. Ring bell, Leave with guard"
                    value={deliveryInstructions}
                    onChange={(e) => setDeliveryInstructions(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Time Slot Preference</label>
                  <select
                    value={preferredTimeSlot}
                    onChange={(e) => setPreferredTimeSlot(e.target.value)}
                    className="input-field"
                    style={{ padding: '8px' }}
                  >
                    <option value="Anytime (9 AM - 7 PM)">Anytime (9 AM - 7 PM)</option>
                    <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                    <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                    <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                  </select>
                </div>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer', margin: '8px 0' }}>
                <input
                  type="checkbox"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  style={{ width: '16px', height: '16px' }}
                />
                <span>Set as default address</span>
              </label>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button 
                  type="button" 
                  onClick={() => setShowAddForm(false)} 
                  className="premium-btn btn-secondary"
                  style={{ flex: 1, padding: '10px' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="premium-btn btn-primary"
                  style={{ flex: 1.5, padding: '10px' }}
                >
                  Save Address
                </button>
              </div>
            </form>
          ) : (
            /* Address List View */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <button 
                onClick={() => setShowAddForm(true)}
                className="premium-btn btn-secondary"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '8px', 
                  padding: '12px',
                  borderStyle: 'dashed',
                  borderWidth: '2px'
                }}
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>

              {addresses.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: '14px' }}>
                  No addresses registered. Please add an address to continue checkout.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {addresses.map(addr => {
                    const isSelected = selectedAddress?.id === addr.id;
                    return (
                      <div 
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        className={`glass-card`}
                        style={{
                          padding: '16px',
                          borderRadius: '16px',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.02)' : 'var(--card-bg)'
                        }}
                      >
                        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid var(--primary)' : '2px solid var(--text-muted)',
                            backgroundColor: 'white',
                            marginTop: '2px',
                            flexShrink: 0
                          }} />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '14px' }}>{addr.fullName}</strong>
                              {addr.isDefault && (
                                <span style={{ fontSize: '9px', backgroundColor: 'var(--success-bg)', color: 'var(--success)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                                  Default
                                </span>
                              )}
                            </div>
                            <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                              {addr.houseNumber} {addr.apartmentName && `, ${addr.apartmentName}`} {addr.streetName}, {addr.areaColony}<br />
                              {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                            </div>
                            <div style={{ color: 'var(--text-muted)', marginTop: '4px', fontSize: '11px' }}>
                              📞 {addr.phone} {addr.alternatePhone && ` | 📱 ${addr.alternatePhone}`}
                            </div>
                            {addr.googleMapsLink && (
                              <a href={addr.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontSize: '11px', marginTop: '6px', fontWeight: 600 }}>
                                <Map size={11} />
                                <span>Google Maps Directions</span>
                              </a>
                            )}
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeAddress(addr.id);
                          }}
                          style={{
                            border: 'none',
                            background: 'rgba(239, 68, 68, 0.08)',
                            color: 'var(--error)',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.15)'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)'}
                        >
                          <Trash size={13} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
