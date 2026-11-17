import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { api } from '../lib/api-client';
import { 
  X, Package, Truck, CheckCircle2, Clock, MapPin, 
  Search, ExternalLink, MessageCircle, AlertCircle, Phone, Calendar
} from 'lucide-react';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Received & pending confirmation' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Order verified by store' },
  { status: 'packed', label: 'Packed', desc: 'Quality checked & packed safely' },
  { status: 'shipped', label: 'Shipped', desc: 'Dispatched via courier partner' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Out with delivery executive' },
  { status: 'delivered', label: 'Delivered', desc: 'Package handed over to customer' }
];

const getStepIndex = (status: OrderStatus): number => {
  switch (status) {
    case 'pending': return 0;
    case 'confirmed': return 1;
    case 'packed': return 2;
    case 'shipped': return 3;
    case 'out_for_delivery': return 4;
    case 'delivered': return 5;
    case 'cancelled':
    case 'returned':
    case 'refund_requested':
    case 'refunded':
      return -1;
    default: return 0;
  }
};

const getStatusBadge = (status: OrderStatus) => {
  let color = '#f59e0b';
  let bg = 'rgba(245, 158, 11, 0.12)';
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'confirmed':
      color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.12)'; break;
    case 'packed':
      color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.12)'; break;
    case 'shipped':
      color = '#06b6d4'; bg = 'rgba(6, 182, 212, 0.12)'; break;
    case 'out_for_delivery':
      color = '#ec4899'; bg = 'rgba(236, 72, 153, 0.12)'; break;
    case 'delivered':
      color = '#10b981'; bg = 'rgba(16, 185, 129, 0.15)'; break;
    case 'cancelled':
      color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.12)'; break;
    case 'returned':
    case 'refund_requested':
    case 'refunded':
      color = '#f97316'; bg = 'rgba(249, 115, 22, 0.12)'; break;
  }

  return (
    <span style={{
      color, backgroundColor: bg, padding: '4px 10px',
      borderRadius: '20px', fontSize: '11px', fontWeight: 800,
      textTransform: 'uppercase', letterSpacing: '0.5px'
    }}>
      {label}
    </span>
  );
};

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, orders: contextOrders } = useApp();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my_orders' | 'track_search'>('my_orders');

  // Load customer orders from API & Context
  useEffect(() => {
    if (!isOpen) return;

    if (currentUser?.email) {
      setLoading(true);
      api.get<any[]>(`/api/orders?email=${encodeURIComponent(currentUser.email)}`)
        .then(data => {
          if (data && data.length > 0) {
            // Map records if needed
            const mapped: Order[] = data.map((d: any) => ({
              id: d.id,
              customerEmail: d.customer_email || currentUser.email,
              customerName: d.customer_name || 'Customer',
              customerPhone: d.phone || '',
              shippingAddress: typeof d.address === 'string' ? JSON.parse(d.address || '{}') : d.address,
              items: typeof d.products === 'string' ? JSON.parse(d.products || '[]') : d.products,
              subtotal: Number(d.subtotal || d.total),
              discount: Number(d.discount || 0),
              gstAmount: Number(d.gst_amount || 0),
              deliveryFee: Number(d.delivery_fee || 0),
              total: Number(d.total),
              estimatedDeliveryDate: d.estimated_delivery_date || 'Within 2-4 Business Days',
              status: d.status,
              orderDate: d.created_at || d.order_date || new Date().toISOString(),
              deliveryType: d.delivery_type || 'home_delivery',
              isPreorder: Boolean(d.is_preorder),
              pickupDate: d.pickup_date,
              pickupTime: d.pickup_time,
              pickupOtp: d.pickup_otp,
              collectedBy: d.collected_by,
              collectionTime: d.collection_time,
              deliveryPartner: d.delivery_partner,
              deliveryExecutiveName: d.delivery_executive_name,
              deliveryExecutivePhone: d.delivery_executive_phone,
              trackingNumber: d.tracking_number,
              paymentMethod: d.payment_method || 'cod',
              paymentStatus: d.payment_status || 'pending',
              timeline: Array.isArray(d.timeline) ? d.timeline : (typeof d.timeline === 'string' ? JSON.parse(d.timeline || '[]') : []),
              internalNotes: Array.isArray(d.internal_notes) ? d.internal_notes : [],
              callLogs: Array.isArray(d.call_logs) ? d.call_logs : []
            }));
            setCustomerOrders(mapped);
            if (mapped.length > 0 && !selectedOrder) {
              setSelectedOrder(mapped[0]);
            }
          } else {
            // Fallback to filtering context orders
            const matched = contextOrders.filter(
              o => o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase()
            );
            setCustomerOrders(matched);
            if (matched.length > 0 && !selectedOrder) {
              setSelectedOrder(matched[0]);
            }
          }
        })
        .catch(err => {
          console.warn('Failed to load user orders from API, using context orders:', err);
          const matched = contextOrders.filter(
            o => o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase()
          );
          setCustomerOrders(matched);
          if (matched.length > 0 && !selectedOrder) {
            setSelectedOrder(matched[0]);
          }
        })
        .finally(() => setLoading(false));
    } else {
      setActiveTab('track_search');
    }
  }, [isOpen, currentUser, contextOrders]);

  if (!isOpen) return null;

  // Search by order ID or phone
  const handleTrackSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const q = searchQuery.trim().toLowerCase();
    const found = contextOrders.find(
      o => o.id.toLowerCase() === q || o.customerPhone.includes(q) || o.trackingNumber?.toLowerCase() === q
    );

    if (found) {
      setSelectedOrder(found);
    } else {
      // Try searching via API
      setLoading(true);
      api.get<any[]>(`/api/orders?phone=${encodeURIComponent(q)}`)
        .then(data => {
          if (data && data.length > 0) {
            const d = data[0];
            const mapped: Order = {
              id: d.id,
              customerEmail: d.customer_email || '',
              customerName: d.customer_name || 'Customer',
              customerPhone: d.phone || '',
              shippingAddress: typeof d.address === 'string' ? JSON.parse(d.address || '{}') : d.address,
              items: typeof d.products === 'string' ? JSON.parse(d.products || '[]') : d.products,
              subtotal: Number(d.subtotal || d.total),
              discount: Number(d.discount || 0),
              gstAmount: Number(d.gst_amount || 0),
              deliveryFee: Number(d.delivery_fee || 0),
              total: Number(d.total),
              estimatedDeliveryDate: d.estimated_delivery_date || 'Within 2-4 Business Days',
              status: d.status,
              orderDate: d.created_at || d.order_date || new Date().toISOString(),
              deliveryType: d.delivery_type || 'home_delivery',
              isPreorder: Boolean(d.is_preorder),
              pickupDate: d.pickup_date,
              pickupTime: d.pickup_time,
              pickupOtp: d.pickup_otp,
              collectedBy: d.collected_by,
              collectionTime: d.collection_time,
              deliveryPartner: d.delivery_partner,
              deliveryExecutiveName: d.delivery_executive_name,
              deliveryExecutivePhone: d.delivery_executive_phone,
              trackingNumber: d.tracking_number,
              paymentMethod: d.payment_method || 'cod',
              paymentStatus: d.payment_status || 'pending',
              timeline: Array.isArray(d.timeline) ? d.timeline : (typeof d.timeline === 'string' ? JSON.parse(d.timeline || '[]') : []),
              internalNotes: Array.isArray(d.internal_notes) ? d.internal_notes : [],
              callLogs: Array.isArray(d.call_logs) ? d.call_logs : []
            };
            setSelectedOrder(mapped);
          } else {
            alert('No order found matching: ' + searchQuery);
          }
        })
        .catch(() => alert('No order found matching: ' + searchQuery))
        .finally(() => setLoading(false));
    }
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : 0;
  const isSpecialStatus = selectedOrder && ['cancelled', 'returned', 'refund_requested', 'refunded'].includes(selectedOrder.status);

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
      padding: '16px'
    }} className="animate-fade">
      
      <div className="glass animate-slide" style={{
        width: 'min(100%, 860px)',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.15)', color: 'var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <Package size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, margin: 0 }}>My Orders & Live Tracking</h2>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {currentUser ? `Logged in as ${currentUser.email}` : 'Track your order in real time'}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="premium-btn btn-secondary"
            style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Navigation Tabs (if logged in) */}
        {currentUser && (
          <div style={{
            display: 'flex',
            padding: '10px 24px',
            gap: '12px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--card-bg)'
          }}>
            <button
              onClick={() => setActiveTab('my_orders')}
              className={`premium-btn ${activeTab === 'my_orders' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px' }}
            >
              My Orders ({customerOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('track_search')}
              className={`premium-btn ${activeTab === 'track_search' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Search size={12} />
              <span>Lookup by ID / Phone</span>
            </button>
          </div>
        )}

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Search Tab */}
          {(!currentUser || activeTab === 'track_search') && (
            <form onSubmit={handleTrackSearch} style={{ display: 'flex', gap: '10px' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text"
                  placeholder="Enter Order ID (e.g. SSM-ORD-...), Tracking No, or Phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '40px' }}
                  required
                />
              </div>
              <button type="submit" className="premium-btn btn-primary" style={{ padding: '0 20px', whiteSpace: 'nowrap' }}>
                Track Order
              </button>
            </form>
          )}

          {/* If multiple orders exist, allow switching between them */}
          {currentUser && activeTab === 'my_orders' && customerOrders.length > 1 && (
            <div style={{
              display: 'flex',
              gap: '10px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'thin'
            }}>
              {customerOrders.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOrder(o)}
                  className="glass-card"
                  style={{
                    padding: '10px 14px',
                    borderRadius: '12px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    border: selectedOrder?.id === o.id ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: selectedOrder?.id === o.id ? 'rgba(59, 130, 246, 0.08)' : 'var(--card-bg)',
                    flexShrink: 0,
                    minWidth: '180px'
                  }}
                >
                  <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)' }}>{o.id}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, margin: '2px 0' }}>₹{o.total?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(o.orderDate).toLocaleDateString('en-IN')}</div>
                </button>
              ))}
            </div>
          )}

          {/* Order Details & Live Tracking */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              Loading tracking information...
            </div>
          ) : selectedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Order Overview Banner */}
              <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '16px', fontWeight: 800 }}>Order #{selectedOrder.id}</span>
                      {getStatusBadge(selectedOrder.status)}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {new Date(selectedOrder.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <span>•</span>
                      <span>Payment: <strong>{selectedOrder.paymentMethod.toUpperCase()}</strong> ({selectedOrder.paymentStatus.toUpperCase()})</span>
                      <span>•</span>
                      <span>Total: <strong style={{ color: 'var(--primary)' }}>₹{selectedOrder.total?.toLocaleString('en-IN')}</strong></span>
                    </div>
                  </div>

                  {/* WhatsApp Support CTA */}
                  <a
                    href={`https://wa.me/919989025000?text=${encodeURIComponent(`Hi Sri Sai Mobiles, I need an update on my Order #${selectedOrder.id}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-btn btn-secondary"
                    style={{ fontSize: '12px', padding: '8px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', color: '#25D366' }}
                  >
                    <MessageCircle size={14} />
                    <span>WhatsApp Help</span>
                  </a>
                </div>
              </div>

              {/* 🚚 LIVE TRACKING STEPPER */}
              <div className="glass-card" style={{ padding: '24px 20px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Truck size={16} style={{ color: 'var(--primary)' }} />
                  <span>Real-Time Shipment Journey</span>
                </h3>

                {isSpecialStatus ? (
                  <div style={{
                    padding: '16px', borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex', alignItems: 'center', gap: '12px'
                  }}>
                    <AlertCircle size={22} style={{ color: 'var(--error)' }} />
                    <div>
                      <h4 style={{ margin: 0, fontSize: '14px', color: 'var(--error)' }}>
                        Status: {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        {selectedOrder.returnReason || 'This order was cancelled or returned.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    
                    {/* Stepper Grid (Horizontal on Desktop, Vertical on Mobile) */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                      gap: '12px',
                      position: 'relative'
                    }}>
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = currentStep >= idx;
                        const isCurrent = currentStep === idx;

                        return (
                          <div 
                            key={step.status}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              textAlign: 'center',
                              padding: '12px 6px',
                              borderRadius: '12px',
                              backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.08)' : (isCompleted ? 'rgba(16, 185, 129, 0.05)' : 'var(--bg-subtle)'),
                              border: isCurrent ? '2px solid var(--primary)' : (isCompleted ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-color)'),
                              transition: 'all 0.2s'
                            }}
                          >
                            <div style={{
                              width: '28px', height: '28px', borderRadius: '50%',
                              backgroundColor: isCompleted ? '#10b981' : (isCurrent ? 'var(--primary)' : 'var(--border-color)'),
                              color: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px', fontWeight: 800,
                              marginBottom: '6px'
                            }}>
                              {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: isCurrent ? 800 : 600, color: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)') }}>
                              {step.label}
                            </span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Logistics Partner & AWB Info Banner */}
                    {(selectedOrder.trackingNumber || selectedOrder.deliveryPartner) && (
                      <div style={{
                        marginTop: '10px',
                        padding: '14px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(59, 130, 246, 0.06)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                            Dispatch Logistics Partner
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                            {selectedOrder.deliveryPartner || 'SriSai Express Dispatch'}
                          </span>
                        </div>

                        {selectedOrder.trackingNumber && (
                          <div>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                              Tracking AWB Number
                            </span>
                            <code style={{ fontSize: '13px', fontWeight: 700, backgroundColor: 'var(--card-bg)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                              {selectedOrder.trackingNumber}
                            </code>
                          </div>
                        )}

                        <div>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                            Estimated Delivery
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>
                            {selectedOrder.estimatedDeliveryDate || '2-4 Days'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Store Pickup Banner (if store pickup) */}
                    {selectedOrder.deliveryType === 'store_pickup' && (
                      <div style={{
                        padding: '14px 18px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '10px'
                      }}>
                        <div>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 700, display: 'block' }}>
                            🏪 Store Pickup Collection
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 700 }}>
                            Sri Sai Mobiles, Near Clock Tower, Jagtial, Telangana
                          </span>
                        </div>
                        {selectedOrder.pickupOtp && (
                          <div>
                            <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                              Pickup Verification OTP
                            </span>
                            <span style={{ fontSize: '16px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>
                              {selectedOrder.pickupOtp}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                )}
              </div>

              {/* Items Purchased List */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '10px 0',
                        borderBottom: idx !== selectedOrder.items.length - 1 ? '1px solid var(--border-color)' : 'none'
                      }}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.modelName}
                        style={{ width: '56px', height: '56px', objectFit: 'contain', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{item.brand} {item.modelName}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          Color: {item.color} {item.ram && item.storage ? `• ${item.ram}/${item.storage}` : ''}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>₹{item.price?.toLocaleString('en-IN')}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Qty: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Delivery Address & Status Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                
                {/* Shipping Address */}
                <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} />
                    <span>Delivery Address</span>
                  </h4>
                  {selectedOrder.shippingAddress ? (
                    <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      <div style={{ fontWeight: 700 }}>{selectedOrder.customerName}</div>
                      <div style={{ color: 'var(--text-muted)' }}>{selectedOrder.customerPhone}</div>
                      <div style={{ marginTop: '4px' }}>
                        {selectedOrder.shippingAddress.houseNumber} {selectedOrder.shippingAddress.apartmentName}, {selectedOrder.shippingAddress.streetName}
                      </div>
                      <div>
                        {selectedOrder.shippingAddress.areaColony}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Store Pickup Order</div>
                  )}
                </div>

                {/* Live Activity Timeline */}
                <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} />
                    <span>Timeline Updates</span>
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '160px', overflowY: 'auto' }}>
                    {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                      selectedOrder.timeline.slice().reverse().map((t, idx) => (
                        <div key={idx} style={{ fontSize: '12px', borderLeft: '2px solid var(--primary)', paddingLeft: '10px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'capitalize' }}>
                            {t.status.replace(/_/g, ' ')}
                          </div>
                          <div style={{ color: 'var(--text-main)', fontSize: '11px' }}>{t.description}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                            {new Date(t.timestamp).toLocaleString('en-IN', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Order verified and in progress.</div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Package size={48} strokeWidth={1} style={{ marginBottom: '12px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: 'var(--text-main)' }}>No Orders Placed Yet</h3>
              <p style={{ fontSize: '13px', margin: 0 }}>
                {currentUser ? 'You haven’t placed any orders yet with this account.' : 'Search above using your Order ID or phone number to view live tracking.'}
              </p>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
