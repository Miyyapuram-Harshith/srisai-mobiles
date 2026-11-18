import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus } from '../types';
import { api } from '../lib/api-client';
import { 
  X, Package, Truck, CheckCircle2, Clock, MapPin, 
  Search, ExternalLink, MessageCircle, AlertCircle, Phone, Calendar,
  Copy, Check, Printer, ShieldCheck, ChevronRight, Store, ArrowLeft,
  RefreshCw, FileText
} from 'lucide-react';

interface CustomerOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ORDER_STEPS: { status: OrderStatus; label: string; desc: string }[] = [
  { status: 'pending', label: 'Order Placed', desc: 'Received & pending confirmation' },
  { status: 'confirmed', label: 'Confirmed', desc: 'Order verified by store' },
  { status: 'packed', label: 'Packed & Ready', desc: 'Quality checked & packed safely' },
  { status: 'shipped', label: 'Shipped', desc: 'Dispatched with logistics partner' },
  { status: 'out_for_delivery', label: 'Out for Delivery', desc: 'Delivery executive on the way' },
  { status: 'delivered', label: 'Delivered', desc: 'Package handed over successfully' }
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
  let border = 'rgba(245, 158, 11, 0.25)';
  const label = status.replace(/_/g, ' ');

  switch (status) {
    case 'confirmed':
      color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.12)'; border = 'rgba(59, 130, 246, 0.25)'; break;
    case 'packed':
      color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.12)'; border = 'rgba(139, 92, 246, 0.25)'; break;
    case 'shipped':
      color = '#06b6d4'; bg = 'rgba(6, 182, 212, 0.12)'; border = 'rgba(6, 182, 212, 0.25)'; break;
    case 'out_for_delivery':
      color = '#ec4899'; bg = 'rgba(236, 72, 153, 0.12)'; border = 'rgba(236, 72, 153, 0.25)'; break;
    case 'delivered':
      color = '#10b981'; bg = 'rgba(16, 185, 129, 0.15)'; border = 'rgba(16, 185, 129, 0.3)'; break;
    case 'cancelled':
      color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.12)'; border = 'rgba(239, 68, 68, 0.25)'; break;
    case 'returned':
    case 'refund_requested':
    case 'refunded':
      color = '#f97316'; bg = 'rgba(249, 115, 22, 0.12)'; border = 'rgba(249, 115, 22, 0.25)'; break;
  }

  const isLive = ['pending', 'confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(status);

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      color,
      backgroundColor: bg,
      border: `1px solid ${border}`,
      padding: '4px 10px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.4px'
    }}>
      {isLive && (
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: color,
          animation: 'pulse 1.8s infinite'
        }} />
      )}
      {label}
    </span>
  );
};

export const CustomerOrdersModal: React.FC<CustomerOrdersModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, orders: contextOrders, storeSettings } = useApp();
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchError, setSearchError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'my_orders' | 'track_search'>('my_orders');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const officialPhone = storeSettings?.whatsappNumber || '8688303048';
  const cleanPhone = officialPhone.replace(/\D/g, '');

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    }).catch(() => {
      // Fallback
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  };

  // Helper to load & combine orders
  const loadOrders = async () => {
    // 1. Gather local orders (context + session)
    let localList: Order[] = [];
    try {
      const saved = sessionStorage.getItem('srisai_orders');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) localList = parsed;
      }
    } catch (e) {
      console.warn('Failed to parse session orders:', e);
    }

    // Merge context orders
    const combinedMap = new Map<string, Order>();
    [...contextOrders, ...localList].forEach(o => {
      if (o && o.id) combinedMap.set(o.id, o);
    });

    // If customer is logged in, filter or fetch API orders
    if (currentUser?.email) {
      setLoading(true);
      try {
        const data = await api.get<any[]>(`/api/orders?email=${encodeURIComponent(currentUser.email)}`);
        if (data && Array.isArray(data) && data.length > 0) {
          data.forEach((d: any) => {
            const mapped: Order = {
              id: d.id,
              customerEmail: d.customer_email || currentUser.email,
              customerName: d.customer_name || 'Customer',
              customerPhone: d.phone || '',
              shippingAddress: typeof d.address === 'string' ? JSON.parse(d.address || '{}') : (d.address || {}),
              items: typeof d.products === 'string' ? JSON.parse(d.products || '[]') : (d.products || []),
              subtotal: Number(d.subtotal || d.total || 0),
              discount: Number(d.discount || 0),
              gstAmount: Number(d.gst_amount || 0),
              deliveryFee: Number(d.delivery_fee || 0),
              total: Number(d.total || 0),
              estimatedDeliveryDate: d.estimated_delivery_date || 'Within 2-4 Business Days',
              status: d.status || 'pending',
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
            combinedMap.set(mapped.id, mapped);
          });
        }
      } catch (err) {
        console.warn('API order fetch error, falling back to local state:', err);
      } finally {
        setLoading(false);
      }
    }

    const allOrders = Array.from(combinedMap.values());
    // Filter relevant orders:
    // If logged in: orders matching user's email
    // If guest: all recent orders placed in this session/browser
    const relevantOrders = currentUser?.email
      ? allOrders.filter(o => o.customerEmail?.toLowerCase() === currentUser.email.toLowerCase())
      : allOrders;

    // Sort newest first
    relevantOrders.sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime());

    setCustomerOrders(relevantOrders);

    if (relevantOrders.length > 0) {
      if (!selectedOrderId || !relevantOrders.some(o => o.id === selectedOrderId)) {
        setSelectedOrderId(relevantOrders[0].id);
      }
      setActiveTab('my_orders');
    } else {
      setActiveTab('track_search');
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadOrders();
    }
  }, [isOpen, currentUser?.email]);

  // Selected Order Object
  const selectedOrder = useMemo(() => {
    return customerOrders.find(o => o.id === selectedOrderId) || customerOrders[0] || null;
  }, [customerOrders, selectedOrderId]);

  if (!isOpen) return null;

  // Search by order ID, tracking number or phone
  const handleTrackSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;

    // First check in loaded/context orders
    const foundLocal = contextOrders.find(
      o => o.id.toLowerCase() === q || 
           o.customerPhone.includes(q) || 
           (o.trackingNumber && o.trackingNumber.toLowerCase() === q)
    );

    if (foundLocal) {
      // Add to customer orders list if not present
      setCustomerOrders(prev => {
        if (!prev.some(o => o.id === foundLocal.id)) {
          return [foundLocal, ...prev];
        }
        return prev;
      });
      setSelectedOrderId(foundLocal.id);
      setActiveTab('my_orders');
      return;
    }

    // Try API search
    setLoading(true);
    try {
      // Try search by ID or phone
      const data = await api.get<any[]>(`/api/orders?phone=${encodeURIComponent(q)}`);
      if (data && Array.isArray(data) && data.length > 0) {
        const d = data[0];
        const mapped: Order = {
          id: d.id,
          customerEmail: d.customer_email || '',
          customerName: d.customer_name || 'Customer',
          customerPhone: d.phone || '',
          shippingAddress: typeof d.address === 'string' ? JSON.parse(d.address || '{}') : (d.address || {}),
          items: typeof d.products === 'string' ? JSON.parse(d.products || '[]') : (d.products || []),
          subtotal: Number(d.subtotal || d.total || 0),
          discount: Number(d.discount || 0),
          gstAmount: Number(d.gst_amount || 0),
          deliveryFee: Number(d.delivery_fee || 0),
          total: Number(d.total || 0),
          estimatedDeliveryDate: d.estimated_delivery_date || 'Within 2-4 Business Days',
          status: d.status || 'pending',
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
        setCustomerOrders(prev => [mapped, ...prev.filter(o => o.id !== mapped.id)]);
        setSelectedOrderId(mapped.id);
        setActiveTab('my_orders');
      } else {
        setSearchError(`No order found matching "${searchQuery}". Please verify the Order ID or Phone number.`);
      }
    } catch {
      setSearchError(`Unable to search right now. Please try again or reach out on WhatsApp.`);
    } finally {
      setLoading(false);
    }
  };

  // Printable Tax Invoice Generator
  const handlePrintInvoice = (order: Order) => {
    const printWin = window.open('', '_blank', 'width=800,height=900');
    if (!printWin) {
      alert('Pop-up was blocked. Please allow pop-ups to print the Tax Invoice.');
      return;
    }

    const formattedDate = new Date(order.orderDate).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric'
    });

    const itemsHtml = (order.items || []).map((item, idx) => `
      <tr style="border-bottom: 1px solid #e5e7eb;">
        <td style="padding: 10px 8px; font-size: 13px;">${idx + 1}</td>
        <td style="padding: 10px 8px; font-size: 13px;">
          <strong>${item.brand} ${item.modelName}</strong><br/>
          <span style="color: #6b7280; font-size: 12px;">Color: ${item.color} ${item.ram ? `| ${item.ram}/${item.storage}` : ''}</span>
        </td>
        <td style="padding: 10px 8px; font-size: 13px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 8px; font-size: 13px; text-align: right;">₹${(item.price || 0).toLocaleString('en-IN')}</td>
        <td style="padding: 10px 8px; font-size: 13px; text-align: right; font-weight: bold;">₹${((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice #${order.id} - Sri Sai Mobiles</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #111827; margin: 0; padding: 24px; }
            .invoice-box { max-width: 720px; margin: auto; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header-row { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px; }
            .logo-text { font-size: 22px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th { background-color: #f3f4f6; text-align: left; padding: 10px 8px; font-size: 12px; text-transform: uppercase; color: #374151; }
            .totals-table { width: 280px; margin-left: auto; border-collapse: collapse; }
            .totals-table td { padding: 6px 8px; font-size: 13px; }
            .print-btn { background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 8px; border: none; font-weight: bold; cursor: pointer; margin-bottom: 20px; }
            @media print { .no-print { display: none !important; } .invoice-box { border: none; box-shadow: none; padding: 0; } }
          </style>
        </head>
        <body>
          <div style="text-align: right; max-width: 720px; margin: auto;" class="no-print">
            <button class="print-btn" onclick="window.print()">🖨️ Print / Save as PDF</button>
          </div>
          <div class="invoice-box">
            <div class="header-row">
              <div>
                <div class="logo-text">SRI SAI MOBILES</div>
                <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">
                  Opposite Big C, Angadi Bazar, Jagtial, Telangana - 505327<br/>
                  Phone / WhatsApp: +91 8688303048 | support@srisaimobiles.com<br/>
                  GSTIN: 36ABCDE1234F1Z5
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 18px; font-weight: 800; color: #111827;">RETAIL TAX INVOICE</div>
                <div style="font-size: 12px; color: #4b5563; margin-top: 4px;">
                  Invoice No: <strong>INV-${order.id.replace(/\D/g, '').slice(-8) || order.id}</strong><br/>
                  Order ID: <strong>#${order.id}</strong><br/>
                  Date: <strong>${formattedDate}</strong>
                </div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; gap: 20px; margin-bottom: 20px;">
              <div style="flex: 1; font-size: 12px; line-height: 1.5;">
                <strong style="color: #6b7280; text-transform: uppercase;">Billed / Shipped To:</strong><br/>
                <span style="font-size: 14px; font-weight: bold;">${order.customerName || 'Customer'}</span><br/>
                Phone: ${order.customerPhone || 'N/A'}<br/>
                Email: ${order.customerEmail || 'N/A'}<br/>
                ${order.shippingAddress ? `
                  ${order.shippingAddress.houseNumber || ''} ${order.shippingAddress.apartmentName || ''}, ${order.shippingAddress.streetName || ''}<br/>
                  ${order.shippingAddress.areaColony || ''}, ${order.shippingAddress.city || ''}, ${order.shippingAddress.state || ''} - ${order.shippingAddress.pincode || ''}
                ` : 'Store Pickup Collection'}
              </div>
              <div style="flex: 1; font-size: 12px; text-align: right; line-height: 1.5;">
                <strong style="color: #6b7280; text-transform: uppercase;">Order & Delivery Details:</strong><br/>
                Delivery Type: <strong>${order.deliveryType === 'store_pickup' ? 'Store Pickup' : 'Home Delivery'}</strong><br/>
                Payment Mode: <strong>${order.paymentMethod.toUpperCase()}</strong> (${order.paymentStatus.toUpperCase()})<br/>
                ${order.trackingNumber ? `Courier AWB: <strong>${order.trackingNumber}</strong><br/>` : ''}
                Status: <strong>${order.status.toUpperCase()}</strong>
              </div>
            </div>

            <table class="table">
              <thead>
                <tr>
                  <th style="width: 30px;">#</th>
                  <th>Item Description</th>
                  <th style="text-align: center; width: 60px;">Qty</th>
                  <th style="text-align: right; width: 100px;">Unit Price</th>
                  <th style="text-align: right; width: 110px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <table class="totals-table">
              <tr>
                <td style="color: #6b7280;">Subtotal:</td>
                <td style="text-align: right;">₹${(order.subtotal || order.total).toLocaleString('en-IN')}</td>
              </tr>
              ${order.discount ? `
                <tr>
                  <td style="color: #10b981;">Discount:</td>
                  <td style="text-align: right; color: #10b981;">- ₹${order.discount.toLocaleString('en-IN')}</td>
                </tr>
              ` : ''}
              <tr>
                <td style="color: #6b7280;">GST (18% Incl.):</td>
                <td style="text-align: right;">₹${(order.gstAmount || Math.round(order.total * 0.18 / 1.18)).toLocaleString('en-IN')}</td>
              </tr>
              <tr>
                <td style="color: #6b7280;">Shipping:</td>
                <td style="text-align: right;">${order.deliveryFee ? `₹${order.deliveryFee}` : '<strong style="color: #10b981;">FREE</strong>'}</td>
              </tr>
              <tr style="border-top: 2px solid #111827;">
                <td style="font-weight: 800; font-size: 15px; padding-top: 8px;">Total Paid:</td>
                <td style="text-align: right; font-weight: 800; font-size: 16px; color: #2563eb; padding-top: 8px;">₹${(order.total || 0).toLocaleString('en-IN')}</td>
              </tr>
            </table>

            <div style="margin-top: 36px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #6b7280; text-align: center;">
              Thank you for shopping with Sri Sai Mobiles! For warranty claims and support, present this invoice at our store.
            </div>
          </div>
        </body>
      </html>
    `;

    printWin.document.open();
    printWin.document.write(htmlContent);
    printWin.document.close();
  };

  const currentStep = selectedOrder ? getStepIndex(selectedOrder.status) : 0;
  const isSpecialStatus = selectedOrder && ['cancelled', 'returned', 'refund_requested', 'refunded'].includes(selectedOrder.status);

  // WhatsApp prefilled message
  const whatsappInquiryUrl = selectedOrder ? (
    `https://wa.me/91${cleanPhone}?text=${encodeURIComponent(
      `Hello Sri Sai Mobiles, I need an update regarding my Order #${selectedOrder.id}.\nCustomer: ${selectedOrder.customerName}\nPhone: ${selectedOrder.customerPhone}\nStatus: ${selectedOrder.status.replace(/_/g, ' ').toUpperCase()}`
    )}`
  ) : `https://wa.me/91${cleanPhone}`;

  return (
    <div className="customer-orders-backdrop animate-fade">
      <div className="customer-orders-modal animate-slide">
        
        {/* ================= STICKY HEADER ================= */}
        <div className="customer-orders-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(59, 130, 246, 0.12)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Package size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '17px', fontWeight: 800, margin: 0, letterSpacing: '-0.3px' }}>
                  My Orders & Live Tracking
                </h2>
                {customerOrders.length > 0 && (
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: 'var(--primary)',
                    padding: '2px 8px',
                    borderRadius: '12px'
                  }}>
                    {customerOrders.length}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                {currentUser?.email ? currentUser.email : 'Sri Sai Mobiles Express Dispatch & Tracking'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => loadOrders()}
              title="Refresh Orders"
              className="premium-btn btn-secondary"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={onClose}
              title="Close"
              className="premium-btn btn-secondary"
              style={{
                width: '38px',
                height: '38px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ================= TABS NAVIGATION ================= */}
        <div className="customer-orders-tabs">
          <button
            onClick={() => setActiveTab('my_orders')}
            className={`premium-btn ${activeTab === 'my_orders' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}
          >
            <Package size={14} />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('track_search')}
            className={`premium-btn ${activeTab === 'track_search' ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0
            }}
          >
            <Search size={14} />
            <span>Track by Order ID / Phone</span>
          </button>
        </div>

        {/* ================= MAIN SCROLLABLE BODY ================= */}
        <div className="customer-orders-body">
          
          {/* SEARCH TAB VIEW */}
          {activeTab === 'track_search' && (
            <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 800, margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Search size={16} style={{ color: 'var(--primary)' }} />
                <span>Track Any Order In Real-Time</span>
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '0 0 16px 0' }}>
                Enter your Order ID (e.g. <code>SSM-ORD-12345</code>), Courier AWB Number, or 10-digit Phone Number to locate your package.
              </p>

              <form onSubmit={handleTrackSearch} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ position: 'relative' }}>
                  <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="text"
                    placeholder="Enter Order ID, Phone or AWB..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px', fontSize: '14px', width: '100%' }}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" className="premium-btn btn-primary" style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: 700 }}>
                    {loading ? 'Searching...' : 'Track Package'}
                  </button>
                  {customerOrders.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => setActiveTab('my_orders')}
                      className="premium-btn btn-secondary" 
                      style={{ padding: '10px 16px', fontSize: '13px' }}
                    >
                      Back to My Orders
                    </button>
                  )}
                </div>
              </form>

              {searchError && (
                <div style={{
                  marginTop: '14px',
                  padding: '12px 14px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(239, 68, 68, 0.08)',
                  border: '1px solid rgba(239, 68, 68, 0.25)',
                  color: 'var(--error)',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px'
                }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>
                    <div>{searchError}</div>
                    <div style={{ marginTop: '4px' }}>
                      Need help? <a href={whatsappInquiryUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#25D366', fontWeight: 700, textDecoration: 'underline' }}>Chat on WhatsApp</a> with store support.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MULTI-ORDER HORIZONTAL CAROUSEL SELECTOR (Mobile Optimized) */}
          {customerOrders.length > 1 && activeTab === 'my_orders' && (
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '8px', letterSpacing: '0.5px' }}>
                Select Order ({customerOrders.length} placed)
              </div>
              <div style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                paddingBottom: '6px',
                scrollSnapType: 'x mandatory',
                WebkitOverflowScrolling: 'touch'
              }}>
                {customerOrders.map(o => {
                  const isSelected = selectedOrder?.id === o.id;
                  const firstItem = o.items?.[0];
                  return (
                    <button
                      key={o.id}
                      onClick={() => setSelectedOrderId(o.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '14px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-subtle)',
                        flexShrink: 0,
                        minWidth: '200px',
                        maxWidth: '240px',
                        scrollSnapAlign: 'start',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: isSelected ? 'var(--primary)' : 'var(--text-muted)' }}>
                          #{o.id.slice(-8)}
                        </span>
                        {getStatusBadge(o.status)}
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {firstItem ? `${firstItem.brand} ${firstItem.modelName}` : 'Custom Order'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        <span style={{ fontWeight: 800, color: 'var(--text-main)' }}>₹{(o.total || 0).toLocaleString('en-IN')}</span>
                        <span>{new Date(o.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTIVE ORDER PRESENTATION */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div className="animate-spin" style={{ width: '32px', height: '32px', margin: '0 auto 12px', border: '3px solid var(--border-color)', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
              <p style={{ margin: 0, fontSize: '13px' }}>Fetching latest tracking details...</p>
            </div>
          ) : selectedOrder ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              {/* 1. ORDER SUMMARY CARD */}
              <div className="glass-card" style={{ padding: '18px 20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div style={{ flex: 1, minWidth: '220px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '16px', fontWeight: 900, letterSpacing: '-0.3px' }}>
                        Order #{selectedOrder.id}
                      </span>
                      <button
                        onClick={() => handleCopy(selectedOrder.id, 'orderId')}
                        title="Copy Order ID"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          color: copiedKey === 'orderId' ? '#10b981' : 'var(--text-muted)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '11px',
                          fontWeight: 700
                        }}
                      >
                        {copiedKey === 'orderId' ? <Check size={14} /> : <Copy size={14} />}
                        <span>{copiedKey === 'orderId' ? 'Copied' : 'Copy'}</span>
                      </button>
                      {getStatusBadge(selectedOrder.status)}
                    </div>

                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)',
                      marginTop: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={13} /> {new Date(selectedOrder.orderDate).toLocaleString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </span>
                      <span>•</span>
                      <span>
                        Type: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.deliveryType === 'store_pickup' ? '🏪 In-Store Pickup' : '🚚 Home Delivery'}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Payment: <strong>{selectedOrder.paymentMethod.toUpperCase()}</strong> ({selectedOrder.paymentStatus.toUpperCase()})
                      </span>
                    </div>
                  </div>

                  {/* Actions (WhatsApp & Print Invoice) */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => handlePrintInvoice(selectedOrder)}
                      className="premium-btn btn-secondary"
                      style={{ fontSize: '12px', padding: '8px 12px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}
                      title="Download or Print Tax Invoice"
                    >
                      <Printer size={14} />
                      <span>Invoice Receipt</span>
                    </button>

                    <a
                      href={whatsappInquiryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="premium-btn"
                      style={{
                        fontSize: '12px',
                        padding: '8px 14px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        backgroundColor: '#25D366',
                        color: '#fff',
                        fontWeight: 700,
                        textDecoration: 'none'
                      }}
                    >
                      <MessageCircle size={14} />
                      <span>WhatsApp Store Help</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* 2. REAL-TIME SHIPMENT JOURNEY STEPPER */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', letterSpacing: '0.5px' }}>
                    <Truck size={16} style={{ color: 'var(--primary)' }} />
                    <span>Real-Time Shipment Journey</span>
                  </h3>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Est. Delivery: <strong style={{ color: 'var(--text-main)' }}>{selectedOrder.estimatedDeliveryDate || 'Within 2-4 Days'}</strong>
                  </div>
                </div>

                {/* If Cancelled or Returned */}
                {isSpecialStatus ? (
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px'
                  }}>
                    <AlertCircle size={22} style={{ color: 'var(--error)', flexShrink: 0, marginTop: '2px' }} />
                    <div style={{ flex: 1 }}>
                      <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--error)' }}>
                        Status: {selectedOrder.status.replace(/_/g, ' ').toUpperCase()}
                      </h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                        {selectedOrder.returnReason || 'This order was cancelled or returned. If this was a paid order, your refund is processed within 3-5 business days.'}
                      </p>
                      <div style={{ marginTop: '10px' }}>
                        <a
                          href={`https://wa.me/91${cleanPhone}?text=${encodeURIComponent(`Hi Sri Sai Mobiles, regarding my cancelled/refunded Order #${selectedOrder.id}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="premium-btn btn-secondary"
                          style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                        >
                          <Phone size={12} /> Contact Store Resolution Desk
                        </a>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* A. DESKTOP STEPPER (Visible on PC/Tablet >640px) */}
                    <div className="orders-stepper-desktop">
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = currentStep > idx;
                        const isCurrent = currentStep === idx;
                        const isUpcoming = currentStep < idx;

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
                              position: 'relative',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            <div 
                              className={isCurrent ? 'step-node-active-pulse' : ''}
                              style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? '#10b981' : (isCurrent ? 'var(--primary)' : 'var(--card-bg)'),
                                border: isUpcoming ? '2px solid var(--border-color)' : 'none',
                                color: isUpcoming ? 'var(--text-muted)' : 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                marginBottom: '8px'
                              }}
                            >
                              {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>
                            <span style={{
                              fontSize: '11px',
                              fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500),
                              color: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)')
                            }}>
                              {step.label}
                            </span>
                            <span style={{ fontSize: '9px', color: 'var(--text-muted)', marginTop: '2px', lineHeight: '1.2' }}>
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* B. MOBILE VERTICAL STEPPER (Visible on Mobile <= 640px) */}
                    <div className="orders-stepper-mobile" style={{ gap: '0' }}>
                      {ORDER_STEPS.map((step, idx) => {
                        const isCompleted = currentStep > idx;
                        const isCurrent = currentStep === idx;
                        const isUpcoming = currentStep < idx;
                        const isLast = idx === ORDER_STEPS.length - 1;

                        return (
                          <div 
                            key={step.status}
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '14px',
                              position: 'relative',
                              paddingBottom: isLast ? '0' : '18px'
                            }}
                          >
                            {/* Vertical Line Connector */}
                            {!isLast && (
                              <div style={{
                                position: 'absolute',
                                left: '15px',
                                top: '30px',
                                bottom: '0',
                                width: '2px',
                                backgroundColor: isCompleted ? '#10b981' : 'var(--border-color)',
                                zIndex: 1
                              }} />
                            )}

                            {/* Node Circle */}
                            <div 
                              className={isCurrent ? 'step-node-active-pulse' : ''}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: isCompleted ? '#10b981' : (isCurrent ? 'var(--primary)' : 'var(--bg-subtle)'),
                                border: isUpcoming ? '2px solid var(--border-color)' : (isCurrent ? '2px solid #93c5fd' : 'none'),
                                color: isUpcoming ? 'var(--text-muted)' : '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '12px',
                                fontWeight: 800,
                                flexShrink: 0,
                                zIndex: 2
                              }}
                            >
                              {isCompleted ? <CheckCircle2 size={16} /> : idx + 1}
                            </div>

                            {/* Content Description */}
                            <div style={{
                              flex: 1,
                              padding: isCurrent ? '10px 14px' : '4px 0',
                              borderRadius: isCurrent ? '12px' : '0',
                              backgroundColor: isCurrent ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                              border: isCurrent ? '1px solid rgba(59, 130, 246, 0.25)' : 'none'
                            }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                <span style={{
                                  fontSize: '13px',
                                  fontWeight: isCurrent ? 800 : (isCompleted ? 700 : 500),
                                  color: isCurrent ? 'var(--primary)' : (isCompleted ? 'var(--text-main)' : 'var(--text-muted)')
                                }}>
                                  {step.label}
                                </span>
                                {isCurrent && (
                                  <span style={{
                                    fontSize: '9px',
                                    fontWeight: 900,
                                    textTransform: 'uppercase',
                                    backgroundColor: 'var(--primary)',
                                    color: '#fff',
                                    padding: '2px 6px',
                                    borderRadius: '6px'
                                  }}>
                                    CURRENT STATUS
                                  </span>
                                )}
                              </div>
                              <p style={{
                                margin: '2px 0 0 0',
                                fontSize: '11px',
                                color: isCurrent ? 'var(--text-main)' : 'var(--text-muted)',
                                lineHeight: '1.4'
                              }}>
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* LOGISTICS / PARTNER DISPATCH BANNER */}
                    {(selectedOrder.trackingNumber || selectedOrder.deliveryPartner) && (
                      <div style={{
                        marginTop: '16px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(59, 130, 246, 0.06)',
                        border: '1px solid rgba(59, 130, 246, 0.2)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                            Dispatch Logistics Partner
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--primary)' }}>
                            {selectedOrder.deliveryPartner || 'Sri Sai Express Logistics'}
                          </span>
                        </div>

                        {selectedOrder.trackingNumber && (
                          <div>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                              Tracking AWB Number
                            </span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <code style={{ fontSize: '12px', fontWeight: 800, backgroundColor: 'var(--card-bg)', padding: '2px 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                                {selectedOrder.trackingNumber}
                              </code>
                              <button
                                onClick={() => handleCopy(selectedOrder.trackingNumber || '', 'awb')}
                                title="Copy Tracking Number"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  padding: '2px',
                                  color: copiedKey === 'awb' ? '#10b981' : 'var(--text-muted)'
                                }}
                              >
                                {copiedKey === 'awb' ? <Check size={14} /> : <Copy size={14} />}
                              </button>
                            </div>
                          </div>
                        )}

                        <div>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                            Estimated Delivery
                          </span>
                          <span style={{ fontSize: '12px', fontWeight: 700 }}>
                            {selectedOrder.estimatedDeliveryDate || '2-4 Days'}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* STORE PICKUP PASS BANNER */}
                    {selectedOrder.deliveryType === 'store_pickup' && (
                      <div style={{
                        marginTop: '16px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.08)',
                        border: '1px solid rgba(245, 158, 11, 0.25)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}>
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#f59e0b', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Store size={14} /> In-Store Pickup Collection Point
                          </span>
                          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '2px' }}>
                            Sri Sai Mobiles, Opp. Big C, Angadi Bazar, Jagtial - 505327
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Store Timings: 10:00 AM – 9:00 PM (Monday to Saturday)
                          </div>
                        </div>

                        {selectedOrder.pickupOtp && (
                          <div style={{ textAlign: 'right', backgroundColor: 'var(--card-bg)', padding: '8px 14px', borderRadius: '10px', border: '1px dashed #f59e0b' }}>
                            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 800, display: 'block' }}>
                              Pickup Counter OTP
                            </span>
                            <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', letterSpacing: '2px' }}>
                              {selectedOrder.pickupOtp}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. ORDERED PRODUCTS ITEMIZED LIST */}
              <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 16px 0', letterSpacing: '0.5px' }}>
                  Ordered Items ({selectedOrder.items?.length || 0})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <div 
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '10px 0',
                        borderBottom: idx !== (selectedOrder.items?.length || 0) - 1 ? '1px solid var(--border-color)' : 'none'
                      }}
                    >
                      <img 
                        src={item.imageUrl || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80'} 
                        alt={item.modelName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&q=80';
                        }}
                        style={{
                          width: '56px',
                          height: '56px',
                          objectFit: 'contain',
                          borderRadius: '10px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-subtle)',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.brand} {item.modelName}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {item.color && <span>Color: <strong>{item.color}</strong></span>}
                          {item.ram && item.storage && <span>Variant: <strong>{item.ram}/{item.storage}</strong></span>}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          Qty: <strong>{item.quantity}</strong> × ₹{(item.price || 0).toLocaleString('en-IN')}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--primary)' }}>
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN')}
                        </div>
                        <div style={{ fontSize: '10px', color: '#10b981', fontWeight: 700 }}>
                          Warranty Included
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 4. BILLING BREAKDOWN & SHIPPING ADDRESS */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }} className="orders-grid-stack">
                
                {/* Delivery Address */}
                <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                    <MapPin size={14} style={{ color: 'var(--primary)' }} />
                    <span>{selectedOrder.deliveryType === 'store_pickup' ? 'Pickup Location' : 'Delivery Address'}</span>
                  </h4>
                  {selectedOrder.deliveryType === 'store_pickup' ? (
                    <div style={{ fontSize: '13px', lineHeight: '1.6' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>Sri Sai Mobiles Flagship Store</div>
                      <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                        Opposite Big C, Angadi Bazar, Jagtial, Telangana - 505327
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <a 
                          href="https://maps.google.com/?q=Sri+Sai+Mobiles+Jagtial" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ExternalLink size={12} /> Open in Google Maps
                        </a>
                      </div>
                    </div>
                  ) : selectedOrder.shippingAddress ? (
                    <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)' }}>{selectedOrder.customerName}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
                        Phone: <a href={`tel:${selectedOrder.customerPhone}`} style={{ color: 'var(--primary)', fontWeight: 700 }}>{selectedOrder.customerPhone}</a>
                      </div>
                      <div style={{ marginTop: '6px', color: 'var(--text-main)' }}>
                        {[
                          selectedOrder.shippingAddress.houseNumber,
                          selectedOrder.shippingAddress.apartmentName,
                          selectedOrder.shippingAddress.streetName
                        ].filter(Boolean).join(', ')}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>
                        {[
                          selectedOrder.shippingAddress.landmark ? `Near ${selectedOrder.shippingAddress.landmark}` : null,
                          selectedOrder.shippingAddress.areaColony,
                          selectedOrder.shippingAddress.city,
                          selectedOrder.shippingAddress.state ? `${selectedOrder.shippingAddress.state} - ${selectedOrder.shippingAddress.pincode}` : selectedOrder.shippingAddress.pincode
                        ].filter(Boolean).join(', ')}
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No shipping address recorded.</div>
                  )}
                </div>

                {/* Price Receipt Breakdown */}
                <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
                  <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                    <FileText size={14} style={{ color: 'var(--primary)' }} />
                    <span>Price Summary</span>
                  </h4>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Items Subtotal:</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{(selectedOrder.subtotal || selectedOrder.total).toLocaleString('en-IN')}</span>
                    </div>

                    {selectedOrder.discount ? (
                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10b981' }}>
                        <span>Discount / Offer:</span>
                        <span style={{ fontWeight: 700 }}>- ₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                      </div>
                    ) : null}

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>GST (18% inclusive):</span>
                      <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{(selectedOrder.gstAmount || Math.round(selectedOrder.total * 0.18 / 1.18)).toLocaleString('en-IN')}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)' }}>
                      <span>Shipping Fee:</span>
                      <span style={{ fontWeight: 700, color: '#10b981' }}>
                        {selectedOrder.deliveryFee ? `₹${selectedOrder.deliveryFee}` : 'FREE'}
                      </span>
                    </div>

                    <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 800 }}>Grand Total:</span>
                      <span style={{ fontSize: '17px', fontWeight: 900, color: 'var(--primary)' }}>
                        ₹{(selectedOrder.total || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* 5. LIVE ACTIVITY TIMELINE LOGS */}
              <div className="glass-card" style={{ padding: '18px', borderRadius: '16px' }}>
                <h4 style={{ fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '6px', letterSpacing: '0.5px' }}>
                  <Clock size={14} style={{ color: 'var(--primary)' }} />
                  <span>Activity Timeline & Checkpoints</span>
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {selectedOrder.timeline && selectedOrder.timeline.length > 0 ? (
                    selectedOrder.timeline.slice().reverse().map((t, idx) => (
                      <div key={idx} style={{ fontSize: '12px', borderLeft: '2px solid var(--primary)', paddingLeft: '12px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--primary)', textTransform: 'capitalize' }}>
                          {t.status.replace(/_/g, ' ')}
                        </div>
                        <div style={{ color: 'var(--text-main)', fontSize: '12px', marginTop: '2px' }}>
                          {t.description}
                        </div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {new Date(t.timestamp).toLocaleString('en-IN', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      Order created and awaiting logistics checkpoint scans. Check back soon for updates.
                    </div>
                  )}
                </div>
              </div>

              {/* 6. HELP & STORE CONTACT FOOTER */}
              <div style={{
                padding: '14px 18px',
                borderRadius: '14px',
                backgroundColor: 'var(--bg-subtle)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <ShieldCheck size={20} style={{ color: '#10b981' }} />
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 800 }}>100% Genuine & Covered by Store Warranty</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Need immediate assistance or want to reschedule delivery?</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <a
                    href={`tel:+91${cleanPhone}`}
                    className="premium-btn btn-secondary"
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Phone size={12} /> Call Store
                  </a>
                  <a
                    href={whatsappInquiryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="premium-btn btn-primary"
                    style={{ fontSize: '11px', padding: '6px 12px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <MessageCircle size={12} /> WhatsApp
                  </a>
                </div>
              </div>

            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <Package size={52} strokeWidth={1} style={{ marginBottom: '14px', opacity: 0.5 }} />
              <h3 style={{ fontSize: '16px', fontWeight: 800, margin: '0 0 6px 0', color: 'var(--text-main)' }}>
                No Orders Placed Yet
              </h3>
              <p style={{ fontSize: '13px', margin: '0 0 16px 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' }}>
                {currentUser?.email
                  ? 'You haven’t placed any orders yet with this account. Browse our catalog and place your first order!'
                  : 'Track an order by entering the Order ID or phone number in the search tab above.'}
              </p>
              <button
                onClick={() => setActiveTab('track_search')}
                className="premium-btn btn-primary"
                style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '12px' }}
              >
                Lookup Order by ID / Phone
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
