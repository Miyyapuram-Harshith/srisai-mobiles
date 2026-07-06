import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { checkPincodeServiceability, getEstimatedDateString } from '../utils/pincodeService';
import { X, Plus, Minus, Trash, ShoppingBag, CreditCard, Tag, AlertCircle, MapPin, Store, ChevronLeft, Check, Sparkles } from 'lucide-react';
import { Address, Order } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLogin: () => void;
  onOpenAddress: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, onClose, onOpenLogin, onOpenAddress 
}) => {
  const { 
    cart, devices, accessories, updateCartQty, removeFromCart, selectedAddress, 
    currentUser, createOrder, navigateTo, addresses, addAddress
  } = useApp();

  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);

  // Checkout Wizard States
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [deliveryType, setDeliveryType] = useState<'home_delivery' | 'store_pickup'>('home_delivery');
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('cod');
  const [pickupDate, setPickupDate] = useState('');
  const [pickupTime, setPickupTime] = useState('10:00 AM - 1:00 PM');
  
  // Custom New Address fields in wizard
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
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
  const [pincodeWarning, setPincodeWarning] = useState<string | null>(null);

  if (!isOpen) return null;

  // Resolve Cart Items details
  const cartWithDetails = cart.map(item => {
    const device = devices.find(d => d.id === item.deviceId);
    const accessory = !device ? accessories.find(a => a.id === item.deviceId) : null;
    
    if (device) {
      return {
        ...item,
        name: device.modelName,
        brand: device.brand,
        image: device.images[0] || 'logo.jpg',
        price: device.offerPrice,
        stockCount: device.stockCount,
        ram: device.ram,
        storage: device.storage,
        isAccessory: false
      };
    } else if (accessory) {
      return {
        ...item,
        name: accessory.name,
        brand: accessory.brand,
        image: accessory.images[0] || 'logo.jpg',
        price: accessory.offerPrice,
        stockCount: accessory.stockCount,
        ram: 'N/A',
        storage: 'N/A',
        isAccessory: true
      };
    }
    return null;
  }).filter(Boolean) as Array<{
    deviceId: string;
    quantity: number;
    selectedColor: string;
    name: string;
    brand: string;
    image: string;
    price: number;
    stockCount: number;
    ram: string;
    storage: string;
    isAccessory: boolean;
  }>;

  // Calculations
  const subtotal = cartWithDetails.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Coupon Discounts
  let discount = 0;
  if (appliedCoupon === 'SAI10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'NEW5') {
    discount = Math.round(subtotal * 0.05);
  }

  // Delivery estimation from pincode
  let deliveryFee = 0;
  let serviceMessage = '';
  let serviceDays = 0;

  if (selectedAddress && deliveryType === 'home_delivery') {
    const serviceRes = checkPincodeServiceability(selectedAddress.pincode, subtotal - discount);
    if (serviceRes.serviceable) {
      deliveryFee = serviceRes.deliveryCharge;
      serviceMessage = serviceRes.message;
      serviceDays = serviceRes.estimatedDays;
      if (appliedCoupon === 'FREESHIP') {
        deliveryFee = 0;
      }
    }
  }

  const gstAmount = Math.round((subtotal - discount) * 0.18); // inclusive breakdown
  const grandTotal = subtotal - discount + deliveryFee;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const c = coupon.trim().toUpperCase();
    if (c === 'SAI10' || c === 'NEW5' || c === 'FREESHIP') {
      setAppliedCoupon(c);
      setCouponError(null);
    } else {
      setCouponError('Invalid Coupon Code');
      setAppliedCoupon(null);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCoupon('');
  };

  const handlePincodeChangeInCheckout = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const handleNewAddressSubmitInCheckout = (e: React.FormEvent) => {
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
      isDefault: false,
      googleMapsLink: googleMapsLink || undefined,
      deliveryInstructions: deliveryInstructions || undefined,
      preferredTimeSlot
    });

    // Reset Address Form States
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
    setShowNewAddressForm(false);
  };

  const handlePlaceOrder = () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }

    if (deliveryType === 'home_delivery' && !selectedAddress) {
      alert('Please select or add a delivery address.');
      return;
    }

    if (deliveryType === 'store_pickup' && (!pickupDate || !pickupTime)) {
      alert('Please select a pickup date and time.');
      return;
    }

    // Set fallback default address for store pickup so createOrder succeeds
    const dummyAddr: Address = selectedAddress || addresses[0] || {
      id: 'addr-pickup',
      fullName: currentUser.name || 'Store Customer',
      phone: currentUser.mobileNumber || '9876543210',
      pincode: '505327',
      addressLine: 'Store Pickup - Sri Sai Mobiles (Opposite Big C, Angadi Bazar, Jagtial, 505327)',
      city: 'Jagitial',
      state: 'Telangana',
      isDefault: false
    };

    // Determine preorder
    const isPreorder = cartWithDetails.some(item => !item.isAccessory && item.stockCount === 0);

    const order = createOrder(
      deliveryType === 'home_delivery' ? selectedAddress! : dummyAddr,
      appliedCoupon || '',
      deliveryType,
      paymentMethod,
      isPreorder,
      deliveryType === 'store_pickup' ? pickupDate : undefined,
      deliveryType === 'store_pickup' ? pickupTime : undefined
    );

    if (order) {
      setOrderSuccess(order);
      handleRemoveCoupon();
      setIsCheckingOut(false);
    } else {
      alert('Failed to process order. Please verify pincode serviceability.');
    }
  };

  const handleStartCheckout = () => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    setIsCheckingOut(true);
  };

  if (orderSuccess) {
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
        <div className="glass-card animate-slide" style={{
          width: '100%',
          maxWidth: '450px',
          textAlign: 'center',
          padding: '40px 24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          boxShadow: 'var(--glass-shadow)',
          borderRadius: '24px'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--success)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ShoppingBag size={30} />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 800 }}>Order Confirmed!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Thank you for shopping at Sri Sai Mobiles. Your order has been registered successfully.
          </p>
          <div style={{
            backgroundColor: 'var(--bg-subtle)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '12px 16px',
            width: '100%',
            fontSize: '13px',
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }}>
            <div>Order ID: <strong>{orderSuccess.id}</strong></div>
            {orderSuccess.deliveryType === 'home_delivery' ? (
              <>
                <div>Delivery Type: <strong>Home Delivery</strong></div>
                <div>Address: {orderSuccess.shippingAddress.fullName} ({orderSuccess.shippingAddress.pincode})</div>
                <div>Expected Delivery: <strong>{orderSuccess.estimatedDeliveryDate}</strong></div>
              </>
            ) : (
              <>
                <div>Delivery Type: <strong>Store Pickup</strong></div>
                <div>Pickup OTP: <strong style={{ color: 'var(--primary)', letterSpacing: '0.1em' }}>{orderSuccess.pickupOtp}</strong></div>
                <div>Pickup Schedule: <strong>{orderSuccess.pickupDate} ({orderSuccess.pickupTime})</strong></div>
              </>
            )}
            <div>Payment Mode: <strong style={{ textTransform: 'uppercase' }}>{orderSuccess.paymentMethod}</strong></div>
            <div>Grand Total: <strong>₹{orderSuccess.total.toLocaleString('en-IN')}</strong></div>
          </div>
          <button
            onClick={() => {
              setOrderSuccess(null);
              onClose();
              navigateTo('home');
            }}
            className="premium-btn btn-primary"
            style={{ width: '100%', borderRadius: '12px', padding: '12px' }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'var(--overlay-bg)',
      backdropFilter: 'blur(6px)'
    }} className="animate-fade" onClick={onClose}>
      
      {/* Drawer Body */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="glass animate-slide"
        style={{
          width: '100%',
          maxWidth: '460px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--glass-shadow)',
          borderLeft: '1px solid var(--border-color)'
        }}
      >
        
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          {isCheckingOut ? (
            <button 
              onClick={() => setIsCheckingOut(false)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 700, fontSize: '14px' }}
            >
              <ChevronLeft size={16} />
              <span>Back to Cart</span>
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShoppingBag size={20} style={{ color: 'var(--primary)' }} />
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>Your Cart</h2>
              <span style={{ fontSize: '11px', backgroundColor: 'var(--border-color)', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                {cartWithDetails.length} Items
              </span>
            </div>
          )}
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

        {/* Content area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          
          {/* STEP 1: CART OVERVIEW */}
          {!isCheckingOut ? (
            cartWithDetails.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '60px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
                color: 'var(--text-muted)'
              }}>
                <ShoppingBag size={48} strokeWidth={1} />
                <p>Your shopping cart is empty.</p>
                <button 
                  onClick={onClose} 
                  className="premium-btn btn-primary"
                  style={{ borderRadius: '20px', fontSize: '12px' }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              cartWithDetails.map(item => (
                <div 
                  key={`${item.deviceId}-${item.selectedColor}`}
                  style={{
                    display: 'flex',
                    gap: '12px',
                    borderBottom: '1px solid var(--border-color)',
                    paddingBottom: '16px'
                  }}
                >
                  <img 
                    src={item.image} 
                    alt={item.name} 
                    style={{ width: '60px', height: '60px', objectFit: 'contain', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', padding: '4px' }}
                  />
                  
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 700, margin: 0 }}>{item.brand} {item.name}</h4>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Color: {item.selectedColor} {!item.isAccessory && `• RAM/ROM: ${item.ram}/${item.storage}`}
                    </div>
                    
                    {/* Quantity Control */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid var(--border-color)',
                        borderRadius: '6px',
                        overflow: 'hidden'
                      }}>
                        <button 
                          onClick={() => updateCartQty(item.deviceId, item.selectedColor, item.quantity - 1)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center' }}
                        >
                          <Minus size={11} />
                        </button>
                        <span style={{ padding: '0 8px', fontSize: '12px', fontWeight: 600 }}>{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQty(item.deviceId, item.selectedColor, item.quantity + 1)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', padding: '2px 8px', display: 'flex', alignItems: 'center' }}
                        >
                          <Plus size={11} />
                        </button>
                      </div>

                      <button 
                        onClick={() => removeFromCart(item.deviceId, item.selectedColor)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash size={12} />
                      </button>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right', fontWeight: 700, fontSize: '13px' }}>
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))
            )
          ) : (
            
            /* STEP 2: CHECKOUT WIZARD */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Delivery Type Switch */}
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Delivery Method</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button
                    onClick={() => { setDeliveryType('home_delivery'); setPaymentMethod('cod'); }}
                    style={{
                      padding: '12px', borderRadius: '12px', border: deliveryType === 'home_delivery' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: deliveryType === 'home_delivery' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600
                    }}
                  >
                    <MapPin size={18} style={{ color: deliveryType === 'home_delivery' ? 'var(--primary)' : 'inherit' }} />
                    <span>Home Delivery</span>
                  </button>
                  <button
                    onClick={() => { setDeliveryType('store_pickup'); setPaymentMethod('store_payment'); }}
                    style={{
                      padding: '12px', borderRadius: '12px', border: deliveryType === 'store_pickup' ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: deliveryType === 'store_pickup' ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600
                    }}
                  >
                    <Store size={18} style={{ color: deliveryType === 'store_pickup' ? 'var(--primary)' : 'inherit' }} />
                    <span>Store Pickup</span>
                  </button>
                </div>
              </div>

              {/* HOME DELIVERY SPECIFICS */}
              {deliveryType === 'home_delivery' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Address Selection */}
                  {!showNewAddressForm ? (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>Shipping Address</span>
                        <button onClick={() => setShowNewAddressForm(true)} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>+ Add New</button>
                      </div>

                      {addresses.length === 0 ? (
                        <div style={{ padding: '14px', border: '1px dashed var(--border-color)', borderRadius: '12px', textAlign: 'center', fontSize: '12px' }}>
                          No addresses found. Please click add new address.
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {addresses.map(addr => {
                            const isSelected = selectedAddress?.id === addr.id;
                            return (
                              <div
                                key={addr.id}
                                onClick={() => useApp().setSelectedAddress(addr)}
                                style={{
                                  padding: '12px', border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                                  borderRadius: '12px', backgroundColor: isSelected ? 'rgba(59,130,246,0.02)' : 'var(--bg-subtle)',
                                  cursor: 'pointer', display: 'flex', gap: '10px', fontSize: '12px'
                                }}
                              >
                                <div style={{
                                  width: '16px', height: '16px', borderRadius: '50%', border: isSelected ? '5px solid var(--primary)' : '2px solid var(--text-muted)',
                                  backgroundColor: 'white', marginTop: '2px'
                                }} />
                                <div>
                                  <strong>{addr.fullName}</strong> ({addr.pincode})<br />
                                  <span style={{ color: 'var(--text-muted)' }}>
                                    {addr.houseNumber} {addr.apartmentName && `, ${addr.apartmentName}`} {addr.streetName}, {addr.areaColony}, {addr.city}, {addr.state}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ) : (
                    
                    /* Detailed Address Entry Form */
                    <form onSubmit={handleNewAddressSubmitInCheckout} style={{
                      backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border-color)',
                      padding: '16px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '10px'
                    }}>
                      <span style={{ fontSize: '13px', fontWeight: 800 }}>Enter Detailed Address</span>
                      
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Full Name *</label>
                           <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" name="name" autoCapitalize="words" className="input-field" style={{ padding: '6px' }} required />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Mobile Number *</label>
                           <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" name="tel" inputMode="numeric" className="input-field" style={{ padding: '6px' }} required />
                         </div>
                       </div>
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Alt Mobile Number</label>
                           <input type="tel" value={alternatePhone} onChange={(e) => setAlternatePhone(e.target.value)} autoComplete="tel" name="alt-tel" inputMode="numeric" className="input-field" style={{ padding: '6px' }} />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pincode *</label>
                           <input type="text" value={pincode} onChange={handlePincodeChangeInCheckout} autoComplete="postal-code" name="pincode" inputMode="numeric" className="input-field" style={{ padding: '6px' }} maxLength={6} required />
                         </div>
                       </div>
 
                       {pincodeWarning && <div style={{ fontSize: '11px', color: 'var(--error)' }}>{pincodeWarning}</div>}
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Flat / House Number *</label>
                           <input type="text" value={houseNumber} onChange={(e) => setHouseNumber(e.target.value)} autoComplete="address-line1" name="house-no" className="input-field" style={{ padding: '6px' }} placeholder="Flat 2A, H.No 2-4-5" required />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Building / Apartment</label>
                           <input type="text" value={apartmentName} onChange={(e) => setApartmentName(e.target.value)} autoComplete="address-line2" name="apartment" className="input-field" style={{ padding: '6px' }} placeholder="Sai Residency" />
                         </div>
                       </div>
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Street Name *</label>
                           <input type="text" value={streetName} onChange={(e) => setStreetName(e.target.value)} className="input-field" style={{ padding: '6px' }} placeholder="Main Bazaar Rd" required />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Landmark</label>
                           <input type="text" value={landmark} className="input-field" style={{ padding: '6px' }} placeholder="Near Clock Tower" />
                         </div>
                       </div>
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Area / Colony *</label>
                           <input type="text" value={areaColony} onChange={(e) => setAreaColony(e.target.value)} className="input-field" style={{ padding: '6px' }} placeholder="Ganesh Nagar" required />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>City *</label>
                           <input type="text" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" name="city" className="input-field" style={{ padding: '6px' }} required />
                         </div>
                       </div>
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>District *</label>
                           <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" style={{ padding: '6px' }} required />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>State *</label>
                           <input type="text" value={state} onChange={(e) => setState(e.target.value)} autoComplete="address-level1" name="state" className="input-field" style={{ padding: '6px' }} required />
                         </div>
                       </div>
 
                       <div>
                         <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Google Maps Location URL</label>
                         <input type="url" value={googleMapsLink} onChange={(e) => setGoogleMapsLink(e.target.value)} className="input-field" style={{ padding: '6px' }} placeholder="https://maps.google.com/..." />
                       </div>
 
                       <div className="checkout-form-grid" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px' }}>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Delivery Instructions</label>
                           <input type="text" value={deliveryInstructions} onChange={(e) => setDeliveryInstructions(e.target.value)} className="input-field" style={{ padding: '6px' }} placeholder="Drop at security gate" />
                         </div>
                         <div>
                           <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Time Slot Preference</label>
                           <select value={preferredTimeSlot} onChange={(e) => setPreferredTimeSlot(e.target.value)} className="input-field" style={{ padding: '5px', fontSize: '11px' }}>
                             <option value="Anytime (9 AM - 7 PM)">Anytime (9 AM - 7 PM)</option>
                             <option value="Morning (9 AM - 12 PM)">Morning (9 AM - 12 PM)</option>
                             <option value="Afternoon (12 PM - 4 PM)">Afternoon (12 PM - 4 PM)</option>
                             <option value="Evening (4 PM - 7 PM)">Evening (4 PM - 7 PM)</option>
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button type="button" onClick={() => setShowNewAddressForm(false)} className="premium-btn btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '12px' }}>Cancel</button>
                        <button type="submit" className="premium-btn btn-primary" style={{ flex: 1.5, padding: '6px', fontSize: '12px' }}>Save Address</button>
                      </div>
                    </form>
                  )}

                  {/* Payment Select Home Delivery */}
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Payment Method</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {[
                        { name: 'Cash On Delivery', key: 'cod' },
                        { name: 'UPI Pay', key: 'upi' },
                        { name: 'Credit/Debit Card', key: 'card' },
                        { name: 'Net Banking', key: 'net_banking' },
                        { name: 'Easy EMI Option', key: 'emi' }
                      ].map(p => (
                        <label 
                          key={p.key} 
                          onClick={() => setPaymentMethod(p.key as any)}
                          style={{
                            padding: '10px', border: paymentMethod === p.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: paymentMethod === p.key ? 700 : 'normal'
                          }}
                        >
                          <input type="radio" checked={paymentMethod === p.key} onChange={() => {}} style={{ accentColor: 'var(--primary)' }} />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}

              {/* STORE PICKUP SPECIFICS */}
              {deliveryType === 'store_pickup' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  
                  {/* Select pickup slot */}
                  <div style={{ backgroundColor: 'var(--bg-subtle)', padding: '14px', border: '1px solid var(--border-color)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 'bold' }}>Schedule Pickup</span>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Pickup Date *</label>
                      <input type="date" value={pickupDate} onChange={(e) => setPickupDate(e.target.value)} className="input-field" style={{ padding: '6px' }} required />
                    </div>
                    <div>
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Preferred Time Slot *</label>
                      <select value={pickupTime} onChange={(e) => setPickupTime(e.target.value)} className="input-field" style={{ padding: '6px' }} required>
                        <option value="10:00 AM - 1:00 PM">10:00 AM - 1:00 PM (Morning)</option>
                        <option value="1:00 PM - 4:00 PM">1:00 PM - 4:00 PM (Afternoon)</option>
                        <option value="4:00 PM - 7:00 PM">4:00 PM - 7:00 PM (Evening)</option>
                        <option value="7:00 PM - 9:00 PM">7:00 PM - 9:00 PM (Late evening)</option>
                      </select>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      ℹ️ A pickup OTP will be generated on placement. Please show the OTP at Sri Sai Mobiles (Opposite Big C, Angadi Bazar, Jagtial) to collect your order.
                    </div>
                  </div>

                  {/* Payment Select Store Pickup */}
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '8px' }}>Select Payment Method</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      {[
                        { name: 'Pay at Store Counter', key: 'store_payment' },
                        { name: 'UPI Pay Now', key: 'upi' },
                        { name: 'Credit/Debit Card', key: 'card' },
                        { name: 'Net Banking', key: 'net_banking' }
                      ].map(p => (
                        <label 
                          key={p.key} 
                          onClick={() => setPaymentMethod(p.key as any)}
                          style={{
                            padding: '10px', border: paymentMethod === p.key ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                            borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: paymentMethod === p.key ? 700 : 'normal'
                          }}
                        >
                          <input type="radio" checked={paymentMethod === p.key} onChange={() => {}} style={{ accentColor: 'var(--primary)' }} />
                          <span>{p.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

        </div>

        {/* Pricing Summary */}
        {cartWithDetails.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border-color)',
            padding: '20px 24px',
            backgroundColor: 'var(--bg-subtle)'
          }}>
            
            {/* Promo Codes (only in step 1 overview) */}
            {!isCheckingOut && (
              <div style={{ marginBottom: '16px' }}>
                {appliedCoupon ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    border: '1px dashed var(--success)',
                    color: 'var(--success)',
                    borderRadius: '10px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Tag size={12} />
                      <span>Coupon "{appliedCoupon}" Applied</span>
                    </div>
                    <button 
                      onClick={handleRemoveCoupon} 
                      style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--error)', fontWeight: 'bold' }}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Coupon (e.g. SAI10, FREESHIP)"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      className="input-field"
                      style={{ padding: '6px 12px', fontSize: '12px', borderRadius: '8px' }}
                    />
                    <button 
                      type="submit" 
                      className="premium-btn btn-secondary"
                      style={{ padding: '6px 14px', borderRadius: '8px', fontSize: '12px' }}
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <div style={{ fontSize: '11px', color: 'var(--error)', marginTop: '4px', fontWeight: 600 }}>
                    {couponError}
                  </div>
                )}
              </div>
            )}

            {/* Detailed Bill */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--success)' }}>
                  <span>Coupon Discount</span>
                  <span>- ₹{discount.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge</span>
                <span>{deliveryType === 'home_delivery' && deliveryFee > 0 ? `₹${deliveryFee}` : 'Free'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                <span>Tax Breakdown (18% GST Incl.)</span>
                <span>₹{gstAmount.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', marginTop: '4px' }}>
                <span>Total Amount</span>
                <span>₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            {!isCheckingOut ? (
              <button
                onClick={handleStartCheckout}
                className="premium-btn btn-primary"
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                <CreditCard size={16} />
                <span>Proceed to Checkout</span>
              </button>
            ) : (
              <button
                onClick={handlePlaceOrder}
                className="premium-btn btn-primary"
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px', fontSize: '14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                  boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)'
                }}
              >
                <Sparkles size={16} fill="white" />
                <span>{cartWithDetails.some(item => !item.isAccessory && item.stockCount === 0) ? 'Place Pre-Order' : 'Confirm Order & Pay'}</span>
              </button>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
