import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Order, OrderStatus, Address } from '../types';
import { 
  Search, Copy, Check, Eye, Trash2, ArrowUpDown, ChevronLeft, ChevronRight, 
  Download, Printer, Send, MessageCircle, FileText, Landmark, Clock, UserPlus, 
  MapPin, PlusCircle, AlertCircle, Edit, DollarSign, ExternalLink, X
} from 'lucide-react';

interface OrderManagerProps {
  defaultFilter: string;
}

export const OrderManager: React.FC<OrderManagerProps> = ({ defaultFilter }) => {
  const { 
    orders, updateOrderStatus, updateOrderDelivery, updateOrderPayment, 
    addOrderNote, issueRefund, addCallLog, adminRole, addAuditLog, currentUser, devices
  } = useApp();

  // Search, Pagination, Filtering, & Resizing States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [deliveryTypeFilter, setDeliveryTypeFilter] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [conditionFilter, setConditionFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  
  // Sort State
  const [sortField, setSortField] = useState<keyof Order>('orderDate');
  const [sortAsc, setSortAsc] = useState(false);

  // Table Column Widths (Simulation of Resizable Columns)
  const [colWidths, setColWidths] = useState({
    id: 110,
    date: 110,
    customer: 140,
    phone: 110,
    products: 160,
    amount: 100,
    delivery: 120,
    payment: 120,
    status: 120,
    actions: 180
  });

  // Selected orders for Bulk Actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  
  // Active detail modal order
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);

  // Internal dialog notes inputs
  const [noteInput, setNoteInput] = useState('');
  const [callDuration, setCallDuration] = useState('1m 00s');
  const [callSummary, setCallSummary] = useState('');

  // Payment Screen capture simulation state
  const [simulatedScreenshot, setSimulatedScreenshot] = useState<string | null>(null);

  // Delivery Executive updates
  const [devPartner, setDevPartner] = useState('');
  const [devExecName, setDevExecName] = useState('');
  const [devExecPhone, setDevExecPhone] = useState('');
  const [devTracking, setDevTracking] = useState('');
  const [expectedDate, setExpectedDate] = useState('');

  // Refund dialog inputs
  const [refundAmountInput, setRefundAmountInput] = useState('');
  const [refundMethodInput, setRefundMethodInput] = useState('UPI');
  const [refundReasonInput, setRefundReasonInput] = useState('Customer Request');
  const [showRefundSection, setShowRefundSection] = useState(false);

  // Clipboard copy helper
  const copyToClipboard = (text: string, title: string) => {
    navigator.clipboard.writeText(text);
    alert(`${title} copied to clipboard!`);
    addAuditLog(`Copied ${title} of Order`, currentUser?.name || 'Admin');
  };

  // Status Color badge selectors
  const getStatusBadge = (status: OrderStatus) => {
    let color = 'var(--text-muted)';
    let bg = 'var(--bg-subtle)';
    switch (status) {
      case 'pending': color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.1)'; break;
      case 'confirmed': color = '#3b82f6'; bg = 'rgba(59, 130, 246, 0.1)'; break;
      case 'packed': color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.1)'; break;
      case 'shipped': color = '#6366f1'; bg = 'rgba(99, 102, 241, 0.1)'; break;
      case 'out_for_delivery': color = '#ec4899'; bg = 'rgba(236, 72, 153, 0.1)'; break;
      case 'delivered': color = 'var(--success)'; bg = 'rgba(16, 185, 129, 0.1)'; break;
      case 'cancelled': color = 'var(--error)'; bg = 'rgba(239, 68, 68, 0.1)'; break;
      case 'returned': color = '#14b8a6'; bg = 'rgba(20, 184, 166, 0.1)'; break;
      case 'refund_requested': color = '#f97316'; bg = 'rgba(249, 115, 22, 0.1)'; break;
      case 'refunded': color = '#ef4444'; bg = 'rgba(239, 68, 68, 0.15)'; break;
    }
    return (
      <span style={{
        color, backgroundColor: bg, padding: '3px 8px', 
        borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase'
      }}>
        {status.replace(/_/g, ' ')}
      </span>
    );
  };

  const getDeviceBadge = (type: string) => {
    let color = '#3b82f6';
    let bg = 'rgba(59, 130, 246, 0.1)';
    if (type === 'used') { color = '#f59e0b'; bg = 'rgba(245, 158, 11, 0.1)'; }
    if (type === 'open_box') { color = '#10b981'; bg = 'rgba(16, 185, 129, 0.1)'; }
    if (type === 'refurbished') { color = '#8b5cf6'; bg = 'rgba(139, 92, 246, 0.1)'; }
    if (type === 'demo_unit') { color = '#ec4899'; bg = 'rgba(236, 72, 153, 0.1)'; }
    return (
      <span style={{
        color, backgroundColor: bg, padding: '2px 6px',
        borderRadius: '4px', fontSize: '9px', fontWeight: 'bold', textTransform: 'uppercase'
      }}>
        {type.replace('_', ' ')}
      </span>
    );
  };

  // CSV Export Trigger
  const exportCSV = (title: string, data: Order[]) => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Mobile Number', 'Address', 'Pincode', 'Products', 'Quantity', 'Payment Method', 'Order Amount', 'Order Status'];
    const rows = data.map(o => [
      o.id,
      new Date(o.orderDate).toLocaleDateString('en-IN'),
      o.customerName,
      o.customerPhone,
      `"${o.shippingAddress.houseNumber || ''} ${o.shippingAddress.streetName || ''} ${o.shippingAddress.city}"`,
      o.shippingAddress.pincode,
      `"${o.items.map(i => `${i.brand} ${i.modelName}`).join(', ')}"`,
      o.items.reduce((sum, i) => sum + i.quantity, 0),
      o.paymentMethod.toUpperCase(),
      o.total,
      o.status.toUpperCase()
    ]);
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog(`Exported ${title} as CSV`, currentUser?.name || 'Admin');
  };

  // Excel simulated export trigger (Excel reads XML format cleanly)
  const exportExcel = (title: string, data: Order[]) => {
    let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
    html += `<head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Orders</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>`;
    html += `<tr><th>Order ID</th><th>Date</th><th>Customer Name</th><th>Mobile Number</th><th>Address</th><th>Pincode</th><th>Products</th><th>Quantity</th><th>Payment Method</th><th>Order Amount</th><th>Order Status</th></tr>`;
    data.forEach(o => {
      html += `<tr>
        <td>${o.id}</td>
        <td>${new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
        <td>${o.customerName}</td>
        <td>${o.customerPhone}</td>
        <td>${o.shippingAddress.houseNumber || ''} ${o.shippingAddress.streetName || ''} ${o.shippingAddress.city}</td>
        <td>${o.shippingAddress.pincode}</td>
        <td>${o.items.map(i => `${i.brand} ${i.modelName}`).join(', ')}</td>
        <td>${o.items.reduce((sum, i) => sum + i.quantity, 0)}</td>
        <td>${o.paymentMethod.toUpperCase()}</td>
        <td>${o.total}</td>
        <td>${o.status.toUpperCase()}</td>
      </tr>`;
    });
    html += `</table></body></html>`;
    const blob = new Blob([html], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}_${Date.now()}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addAuditLog(`Exported ${title} as Excel`, currentUser?.name || 'Admin');
  };

  // PDF simulated print page
  const exportPDF = (title: string, data: Order[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ccc; padding: 10px; text-align: left; font-size: 11px; }
            th { background-color: #f2f2f2; }
            h2 { color: #333; }
          </style>
        </head>
        <body>
          <h2>${title}</h2>
          <p>Generated on: ${new Date().toLocaleString('en-IN')}</p>
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Customer Name</th>
                <th>Mobile Number</th>
                <th>Products</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(o => `
                <tr>
                  <td>${o.id}</td>
                  <td>${new Date(o.orderDate).toLocaleDateString('en-IN')}</td>
                  <td>${o.customerName}</td>
                  <td>${o.customerPhone}</td>
                  <td>${o.items.map(i => `${i.brand} ${i.modelName} (x${i.quantity})`).join('<br/>')}</td>
                  <td>₹${o.total.toLocaleString('en-IN')}</td>
                  <td>${o.paymentMethod.toUpperCase()} (${o.paymentStatus})</td>
                  <td>${o.status.toUpperCase()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addAuditLog(`Exported ${title} as PDF`, currentUser?.name || 'Admin');
  };

  // GST Monospace Monochromic Monologue Print layouts
  const printGSTInvoice = (order: Order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    const cgst = Math.round(order.gstAmount / 2);
    const sgst = order.gstAmount - cgst;
    printWindow.document.write(`
      <html>
        <head>
          <title>GST Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 30px; line-height: 1.5; color: #000; }
            .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 15px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 2px; }
            .store-info { font-size: 12px; }
            .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 13px; }
            .section-title { font-weight: bold; text-decoration: underline; margin-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 15px; margin-bottom: 15px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: left; font-size: 12px; }
            th { background-color: #f2f2f2; }
            .totals { text-align: right; font-size: 13px; margin-top: 15px; }
            .footer { text-align: center; margin-top: 40px; font-size: 11px; border-top: 1px dashed #000; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">SRI SAI MOBILES</div>
            <div class="store-info">
              Opposite Big C, Angadi Bazar, Jagtial, Telangana - 505327<br/>
              Mobile: +91 8688303048 | Email: sales@srisaimobiles.com<br/>
              <strong>GSTIN: 36AAOCS1280K1Z9</strong>
            </div>
          </div>
          
          <div class="invoice-details">
            <div>
              <div class="section-title">BILL TO:</div>
              <strong>Name:</strong> ${order.customerName}<br/>
              <strong>Phone:</strong> ${order.customerPhone}<br/>
              <strong>Address:</strong><br/>
              ${order.shippingAddress.houseNumber || ''} ${order.shippingAddress.apartmentName || ''}<br/>
              ${order.shippingAddress.streetName || ''}, ${order.shippingAddress.areaColony || ''}<br/>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}
            </div>
            <div style="text-align: right;">
              <div class="section-title">INVOICE INFO:</div>
              <strong>Invoice No:</strong> SSM-INV-${order.id.slice(-6)}<br/>
              <strong>Order ID:</strong> ${order.id}<br/>
              <strong>Date:</strong> ${new Date(order.orderDate).toLocaleString('en-IN')}<br/>
              <strong>Delivery Mode:</strong> ${order.deliveryType === 'home_delivery' ? 'Home Delivery' : 'Store Pickup'}<br/>
              <strong>Payment Method:</strong> ${order.paymentMethod.toUpperCase()}<br/>
              <strong>Payment Status:</strong> ${order.paymentStatus.toUpperCase()}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>GST Rate</th>
                <th>GST Amount</th>
                <th>Total (Incl. Tax)</th>
              </tr>
            </thead>
            <tbody>
              ${order.items.map(item => `
                <tr>
                  <td>
                    <strong>${item.brand} ${item.modelName}</strong><br/>
                    Color: ${item.color} | Variant: ${item.ram}/${item.storage}
                  </td>
                  <td>${item.quantity}</td>
                  <td>₹${Math.round(item.price * 0.82).toLocaleString('en-IN')}</td>
                  <td>18% (9% CGST + 9% SGST)</td>
                  <td>₹${Math.round(item.price * 0.18).toLocaleString('en-IN')}</td>
                  <td>₹${item.price.toLocaleString('en-IN')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="totals">
            <div>Subtotal (Excl. GST): <strong>₹${Math.round((order.subtotal - order.discount) * 0.82).toLocaleString('en-IN')}</strong></div>
            <div>Discount Applied: <strong>- ₹${order.discount.toLocaleString('en-IN')}</strong></div>
            <div>CGST (9%): <strong>₹${cgst.toLocaleString('en-IN')}</strong></div>
            <div>SGST (9%): <strong>₹${sgst.toLocaleString('en-IN')}</strong></div>
            ${order.deliveryFee > 0 ? `<div>Delivery Charges: <strong>₹${order.deliveryFee}</strong></div>` : ''}
            <div style="font-size: 16px; margin-top: 5px;">GRAND TOTAL: <strong>₹${order.total.toLocaleString('en-IN')}</strong></div>
          </div>

          <div class="footer">
            Thank you for purchasing from Sri Sai Mobiles!<br/>
            This is a computer-generated tax invoice. No signature required.<br/>
            Warranty terms are subject to manufacture policy.
          </div>

          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
    addAuditLog(`Generated & Printed GST Invoice for Order ${order.id}`, currentUser?.name || 'Admin');
  };

  // WhatsApp template triggers
  const sendWhatsAppTemplate = (type: 'confirm' | 'ship' | 'deliver' | 'reminder', order: Order) => {
    let msg = '';
    const name = order.customerName;
    const phone = order.customerPhone;
    const ordId = order.id;
    const total = order.total.toLocaleString('en-IN');

    if (type === 'confirm') {
      msg = `Hi ${name}, your order ${ordId} at Sri Sai Mobiles for ₹${total} is CONFIRMED. Thank you for shopping with us!`;
    } else if (type === 'ship') {
      msg = `Hi ${name}, your order ${ordId} has been SHIPPED via ${order.deliveryPartner || 'Courier'} with Tracking: ${order.trackingNumber || 'N/A'}. Track your package here.`;
    } else if (type === 'deliver') {
      msg = `Hi ${name}, your order ${ordId} has been DELIVERED successfully. Enjoy your new smartphone!`;
    } else if (type === 'reminder') {
      msg = `Hi ${name}, this is a payment reminder for your order ${ordId}. Due amount: ₹${total}. Please complete the payment.`;
    }

    const url = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
    addAuditLog(`Sent WhatsApp ${type.toUpperCase()} alert to ${phone}`, currentUser?.name || 'Admin');
  };

  // Handle Order Selection for Bulk list
  const toggleSelectOrder = (id: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(id) ? prev.filter(oid => oid !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleOrders: Order[]) => {
    if (selectedOrderIds.length === visibleOrders.length) {
      setSelectedOrderIds([]);
    } else {
      setSelectedOrderIds(visibleOrders.map(o => o.id));
    }
  };

  // Bulk operation actions
  const handleBulkAction = (action: 'shipped' | 'delivered' | 'cancel' | 'invoice' | 'sms' | 'whatsapp') => {
    if (selectedOrderIds.length === 0) {
      alert('Please select at least one order.');
      return;
    }

    if (action === 'shipped') {
      selectedOrderIds.forEach(id => updateOrderStatus(id, 'shipped', currentUser?.email));
      alert(`Bulk Shipped updated for ${selectedOrderIds.length} orders.`);
    } else if (action === 'delivered') {
      selectedOrderIds.forEach(id => updateOrderStatus(id, 'delivered', currentUser?.email));
      alert(`Bulk Delivered updated for ${selectedOrderIds.length} orders.`);
    } else if (action === 'cancel') {
      selectedOrderIds.forEach(id => updateOrderStatus(id, 'cancelled', currentUser?.email));
      alert(`Bulk Cancelled updated for ${selectedOrderIds.length} orders.`);
    } else if (action === 'invoice') {
      selectedOrderIds.forEach(id => {
        const o = orders.find(x => x.id === id);
        if (o) printGSTInvoice(o);
      });
    } else if (action === 'whatsapp') {
      selectedOrderIds.forEach(id => {
        const o = orders.find(x => x.id === id);
        if (o) sendWhatsAppTemplate('confirm', o);
      });
    } else if (action === 'sms') {
      alert(`Simulating bulk SMS broadcasts to ${selectedOrderIds.length} customer phone numbers.`);
      addAuditLog(`Broadcasted Bulk SMS alerts to ${selectedOrderIds.length} orders`, currentUser?.name || 'Admin');
    }

    setSelectedOrderIds([]);
  };

  // Sorting Handler
  const handleSort = (field: keyof Order) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // 1. FILTER AND RESOLVE ORDERS LIST
  const filterOrders = () => {
    return orders.filter(o => {
      // Sidebar main categories routing
      if (defaultFilter !== 'all') {
        if (defaultFilter === 'preorder') {
          if (!o.isPreorder) return false;
        } else if (defaultFilter === 'store_pickup') {
          if (o.deliveryType !== 'store_pickup') return false;
        } else {
          if (o.status !== defaultFilter) return false;
        }
      }

      // Search Query evaluation
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = o.customerName.toLowerCase().includes(q);
        const matchesPhone = o.customerPhone.includes(q);
        const matchesPin = o.shippingAddress.pincode.includes(q);
        const matchesTracking = o.trackingNumber?.toLowerCase().includes(q) || false;
        const matchesProduct = o.items.some(i => i.modelName.toLowerCase().includes(q) || i.brand.toLowerCase().includes(q));

        if (!matchesId && !matchesName && !matchesPhone && !matchesPin && !matchesTracking && !matchesProduct) {
          return false;
        }
      }

      // Advanced Form filters
      if (statusFilter && o.status !== statusFilter) return false;
      if (paymentFilter && o.paymentStatus !== paymentFilter) return false;
      if (deliveryTypeFilter && o.deliveryType !== deliveryTypeFilter) return false;

      // Dates filtering
      if (dateStart && new Date(o.orderDate) < new Date(dateStart)) return false;
      if (dateEnd) {
        const nextDay = new Date(dateEnd);
        nextDay.setDate(nextDay.getDate() + 1);
        if (new Date(o.orderDate) >= nextDay) return false;
      }

      // Brand filtering
      if (brandFilter && !o.items.some(i => i.brand.toLowerCase() === brandFilter.toLowerCase())) return false;

      // Device Type & Condition classification filters
      if (conditionFilter || brandFilter) {
        const matchingDeviceIds = devices.filter(d => {
          if (brandFilter && d.brand.toLowerCase() !== brandFilter.toLowerCase()) return false;
          if (conditionFilter && d.deviceType !== conditionFilter) return false;
          return true;
        }).map(d => d.id);
        
        if (matchingDeviceIds.length > 0) {
          const itemMatches = o.items.some(i => matchingDeviceIds.includes(i.deviceId));
          if (!itemMatches) return false;
        }
      }

      return true;
    });
  };

  const processedOrders = filterOrders();

  // Sorting Resolver
  const sortedOrders = [...processedOrders].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'orderDate' || sortField === 'estimatedDeliveryDate') {
      return sortAsc 
        ? new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime()
        : new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    }
    if (typeof valA === 'number' && typeof valB === 'number') {
      return sortAsc ? valA - valB : valB - valA;
    }
    return 0;
  });

  // Pagination bounds
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(sortedOrders.length / ordersPerPage) || 1;

  // Add notes handler
  const handleAddNote = () => {
    if (!noteInput.trim() || !activeOrder) return;
    addOrderNote(activeOrder.id, noteInput.trim());
    
    // Refresh modal states
    const updated = orders.find(o => o.id === activeOrder.id);
    if (updated) setActiveOrder(updated);

    setNoteInput('');
  };

  // Add customer call log helper
  const handleAddCallLog = () => {
    if (!callSummary.trim() || !activeOrder) return;
    addCallLog(activeOrder.id, {
      duration: callDuration,
      staffName: currentUser?.name || 'Staff Admin',
      summary: callSummary.trim()
    });

    const updated = orders.find(o => o.id === activeOrder.id);
    if (updated) setActiveOrder(updated);

    setCallSummary('');
  };

  // Update Delivery executive configurations
  const handleSaveDeliveryInfo = () => {
    if (!activeOrder) return;
    updateOrderDelivery(activeOrder.id, {
      deliveryPartner: devPartner || undefined,
      deliveryExecutiveName: devExecName || undefined,
      deliveryExecutivePhone: devExecPhone || undefined,
      trackingNumber: devTracking || undefined,
      estimatedDeliveryDate: expectedDate || activeOrder.estimatedDeliveryDate
    });
    alert('Delivery Logistics updated successfully!');
    const updated = orders.find(o => o.id === activeOrder.id);
    if (updated) setActiveOrder(updated);
  };

  // Refund execution
  const handleExecuteRefund = () => {
    if (!activeOrder || !refundAmountInput) return;
    const amt = parseFloat(refundAmountInput);
    if (isNaN(amt) || amt <= 0 || amt > activeOrder.total) {
      alert(`Invalid refund amount. Must be between ₹1 and ₹${activeOrder.total}`);
      return;
    }

    issueRefund(activeOrder.id, {
      amount: amt,
      method: refundMethodInput,
      reason: refundReasonInput
    });

    alert(`Refund of ₹${amt} issued successfully!`);
    const updated = orders.find(o => o.id === activeOrder.id);
    if (updated) {
      setActiveOrder(updated);
    }
    setShowRefundSection(false);
    setRefundAmountInput('');
  };

  // Simulated screenshot upload selector
  const handleSimulateScreenshot = () => {
    // Generate a simulated gradient UPI receipt image
    const canvas = document.createElement('canvas');
    canvas.width = 300;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, '#10b981');
      gradient.addColorStop(1, '#047857');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 300, 400);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('UPI Payment Successful', 20, 50);
      
      ctx.font = '14px sans-serif';
      ctx.fillText(`Amount: ₹${activeOrder?.total.toLocaleString('en-IN')}`, 20, 100);
      ctx.fillText(`Txn ID: UPI${Date.now()}`, 20, 130);
      ctx.fillText(`Date: ${new Date().toLocaleDateString()}`, 20, 160);
      ctx.fillText('Payee: Sri Sai Mobiles', 20, 190);
      
      ctx.beginPath();
      ctx.arc(150, 300, 40, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('✓', 135, 315);

      const dataUrl = canvas.toDataURL();
      if (activeOrder) {
        updateOrderPayment(activeOrder.id, {
          paymentScreenshot: dataUrl,
          paymentStatus: 'paid'
        });
        const updated = orders.find(o => o.id === activeOrder.id);
        if (updated) setActiveOrder(updated);
        alert('Simulated UPI receipt screenshot uploaded successfully!');
      }
    }
  };

  const handleOpenOrderDetails = (order: Order) => {
    setActiveOrder(order);
    setDevPartner(order.deliveryPartner || '');
    setDevExecName(order.deliveryExecutiveName || '');
    setDevExecPhone(order.deliveryExecutivePhone || '');
    setDevTracking(order.trackingNumber || '');
    setExpectedDate(order.estimatedDeliveryDate || '');
    setShowRefundSection(false);
  };

  // Quick formatted copy string templates
  const getFormattedAddress = (addr: Address) => {
    return `${addr.fullName}\n${addr.phone}\n\n${addr.houseNumber || ''} ${addr.apartmentName || ''}\n${addr.streetName || ''}\n${addr.areaColony || ''}\n${addr.city}, ${addr.state}\n${addr.pincode}`;
  };

  const getOrderSummaryText = (order: Order) => {
    return `Order ${order.id}\nItems: ${order.items.map(i => `${i.brand} ${i.modelName} (${i.color}) x${i.quantity}`).join(', ')}\nTotal: ₹${order.total.toLocaleString('en-IN')}\nPayment Mode: ${order.paymentMethod.toUpperCase()}`;
  };

  const getTrackingMessage = (order: Order) => {
    return `Your Sri Sai Mobiles order ${order.id} is shipped via ${order.deliveryPartner || 'Courier'}. Tracking No: ${order.trackingNumber || 'N/A'}. Track here.`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 📊 ANALYTICS OVERVIEW STRIP */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, textTransform: 'capitalize' }}>
          {defaultFilter.replace(/_/g, ' ')} Orders Management
        </h1>
        
        {/* Bulk Export Options */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={() => exportExcel("All Orders", orders)} 
            className="premium-btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Download size={14} />
            <span>Export All Excel</span>
          </button>
          <button 
            onClick={() => exportCSV("Filtered Orders", sortedOrders)} 
            className="premium-btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FileText size={14} />
            <span>Export Filtered CSV</span>
          </button>
          <button 
            onClick={() => exportPDF("Filtered Orders Summary", sortedOrders)} 
            className="premium-btn btn-secondary"
            style={{ padding: '8px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Printer size={14} />
            <span>Print Current Page</span>
          </button>
        </div>
      </div>

      {/* 🔍 SEARCH AND ADVANCED FILTERS PANEL */}
      <div className="glass-card" style={{ padding: '16px 20px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Instant search inputs */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '10px', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search by Order ID, Client Name, Mobile, Tracking Number, Pincode..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600 }}>From:</span>
            <input type="date" value={dateStart} onChange={(e) => setDateStart(e.target.value)} className="input-field" style={{ width: '135px', padding: '6px' }} />
            <span style={{ fontSize: '12px', fontWeight: 600 }}>To:</span>
            <input type="date" value={dateEnd} onChange={(e) => setDateEnd(e.target.value)} className="input-field" style={{ width: '135px', padding: '6px' }} />
          </div>
        </div>

        {/* Detailed Dropdown selection Filters */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>ORDER STATUS</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '12px' }}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="packed">Packed</option>
              <option value="shipped">Shipped</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
              <option value="refund_requested">Refund Requested</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>PAYMENT STATUS</label>
            <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '12px' }}>
              <option value="">All Payments</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>DELIVERY TYPE</label>
            <select value={deliveryTypeFilter} onChange={(e) => setDeliveryTypeFilter(e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '12px' }}>
              <option value="">All Delivery Modes</option>
              <option value="home_delivery">Home Delivery</option>
              <option value="store_pickup">Store Pickup</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>BRAND</label>
            <select value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '12px' }}>
              <option value="">All Brands</option>
              <option value="apple">Apple</option>
              <option value="samsung">Samsung</option>
              <option value="oneplus">OnePlus</option>
              <option value="nothing">Nothing</option>
              <option value="google">Google</option>
              <option value="motorola">Motorola</option>
              <option value="xiaomi">Xiaomi</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>DEVICE TYPE</label>
            <select value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="input-field" style={{ padding: '6px', fontSize: '12px' }}>
              <option value="">All Device Types</option>
              <option value="brand_new">Brand New Sealed</option>
              <option value="used">Used / Pre-Owned</option>
              <option value="open_box">Open Box</option>
              <option value="refurbished">Refurbished</option>
              <option value="demo_unit">Demo Unit</option>
            </select>
          </div>
        </div>

      </div>

      {/* ⚙️ BULK OPERATIONS PANEL */}
      {selectedOrderIds.length > 0 && (
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.08)',
          border: '1px solid var(--primary)',
          padding: '12px 18px',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }} className="animate-fade">
          <div style={{ fontSize: '13px', fontWeight: 600 }}>
            ⚡ <strong>{selectedOrderIds.length}</strong> orders selected for bulk updates:
          </div>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => handleBulkAction('shipped')} className="premium-btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}>Mark Shipped</button>
            <button onClick={() => handleBulkAction('delivered')} className="premium-btn btn-primary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', backgroundColor: 'var(--success)' }}>Mark Delivered</button>
            <button onClick={() => handleBulkAction('invoice')} className="premium-btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}>Print Invoices</button>
            <button onClick={() => handleBulkAction('sms')} className="premium-btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}>Send SMS Update</button>
            <button onClick={() => handleBulkAction('whatsapp')} className="premium-btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px' }}>WhatsApp Confirmation</button>
            <button onClick={() => handleBulkAction('cancel')} className="premium-btn btn-secondary" style={{ padding: '6px 12px', fontSize: '11px', borderRadius: '6px', color: 'var(--error)' }}>Cancel Orders</button>
          </div>
        </div>
      )}

      {/* 📦 DATA GRID TABLE VIEW */}
      <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Desktop Table View */}
        <div className="desktop-only" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            
            {/* Sticky Scroll Table Headers */}
            <thead style={{
              position: 'sticky', top: 0, zIndex: 10,
              backgroundColor: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)'
            }}>
              <tr>
                <th style={{ padding: '14px 16px', width: '40px' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedOrderIds.length === currentOrders.length && currentOrders.length > 0}
                    onChange={() => toggleSelectAll(currentOrders)}
                    style={{ cursor: 'pointer' }}
                  />
                </th>
                
                <th 
                  onClick={() => handleSort('id')} 
                  style={{ padding: '14px 16px', cursor: 'pointer', width: `${colWidths.id}px` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <span>Order ID</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('orderDate')} 
                  style={{ padding: '14px 16px', cursor: 'pointer', width: `${colWidths.date}px` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <span>Date & Time</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                <th 
                  onClick={() => handleSort('customerName')} 
                  style={{ padding: '14px 16px', cursor: 'pointer', width: `${colWidths.customer}px` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <span>Customer</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                <th style={{ padding: '14px 16px', width: `${colWidths.phone}px` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone / Location</span>
                </th>

                <th style={{ padding: '14px 16px', width: `${colWidths.products}px` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Product Specifications</span>
                </th>

                <th 
                  onClick={() => handleSort('total')} 
                  style={{ padding: '14px 16px', cursor: 'pointer', width: `${colWidths.amount}px` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <span>Total Amount</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                <th style={{ padding: '14px 16px', width: `${colWidths.delivery}px` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Mode</span>
                </th>

                <th style={{ padding: '14px 16px', width: `${colWidths.payment}px` }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Payment Mode</span>
                </th>

                <th 
                  onClick={() => handleSort('status')} 
                  style={{ padding: '14px 16px', cursor: 'pointer', width: `${colWidths.status}px` }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    <span>Status</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>

                <th style={{ padding: '14px 16px', width: `${colWidths.actions}px`, textAlign: 'center' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>ERP Actions</span>
                </th>
              </tr>
            </thead>

            {/* Grid Table Rows */}
            <tbody style={{ fontSize: '13px' }}>
              {currentOrders.length === 0 ? (
                <tr>
                  <td colSpan={11} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                    No matching orders found in local records.
                  </td>
                </tr>
              ) : (
                currentOrders.map(o => {
                  const isSelected = selectedOrderIds.includes(o.id);
                  // Grab devices matched classifications
                  const firstItemType = devices.find(d => d.id === o.items[0]?.deviceId)?.deviceType || 'brand_new';
                  
                  return (
                    <tr 
                      key={o.id}
                      style={{
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.02)' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      {/* Checkbox select */}
                      <td style={{ padding: '12px 16px' }}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          onChange={() => toggleSelectOrder(o.id)}
                          style={{ cursor: 'pointer' }}
                        />
                      </td>

                      {/* Order ID */}
                      <td style={{ padding: '12px 16px' }}>
                        <strong style={{ fontFamily: 'monospace', fontSize: '13px', color: 'var(--primary)' }}>{o.id}</strong>
                      </td>

                      {/* Date */}
                      <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '12px' }}>
                        {new Date(o.orderDate).toLocaleDateString('en-IN')}<br/>
                        {new Date(o.orderDate).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Customer Info */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ fontWeight: 'bold' }}>{o.customerName}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{o.customerEmail}</div>
                      </td>

                      {/* Phone / Pincode */}
                      <td style={{ padding: '12px 16px' }}>
                        <div>{o.customerPhone}</div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Pin: {o.shippingAddress.pincode}</div>
                      </td>

                      {/* Products */}
                      <td style={{ padding: '12px 16px' }}>
                        {o.items.map(item => (
                          <div key={item.deviceId} style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 600 }}>{item.brand} {item.modelName}</span>
                            <div style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>({item.color}) • {item.quantity} Unit(s)</span>
                              {getDeviceBadge(firstItemType)}
                            </div>
                          </div>
                        ))}
                      </td>

                      {/* Total Amount */}
                      <td style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                        ₹{o.total.toLocaleString('en-IN')}
                      </td>

                      {/* Delivery Mode */}
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        {o.deliveryType === 'home_delivery' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: 600 }}>
                            <MapPin size={12} />
                            <span>Home Delivery</span>
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#3b82f6', fontWeight: 600 }}>
                            <Clock size={12} />
                            <span>Pickup (OTP: {o.pickupOtp})</span>
                          </span>
                        )}
                      </td>

                      {/* Payment Method */}
                      <td style={{ padding: '12px 16px', fontSize: '12px' }}>
                        <div style={{ textTransform: 'uppercase', fontWeight: 600 }}>{o.paymentMethod}</div>
                        <div style={{ 
                          fontSize: '10px', 
                          color: o.paymentStatus === 'paid' ? 'var(--success)' : o.paymentStatus === 'pending' ? '#f59e0b' : 'var(--error)' 
                        }}>
                          {o.paymentStatus.toUpperCase()}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '12px 16px' }}>
                        {getStatusBadge(o.status)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleOpenOrderDetails(o)}
                            className="premium-btn btn-secondary"
                            style={{ padding: '5px 8px', borderRadius: '6px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            title="View order details and updates log"
                          >
                            <Eye size={12} />
                            <span>Manage</span>
                          </button>
                          
                          {/* Quick copy menu */}
                          <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '6px', overflow: 'hidden' }}>
                            <button 
                              onClick={() => copyToClipboard(getFormattedAddress(o.shippingAddress), "Formatted Address")} 
                              style={{ padding: '4px 6px', background: 'var(--bg-subtle)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                              title="Copy Full Delivery Address"
                            >
                              <MapPin size={12} />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(getOrderSummaryText(o), "Order Summary")} 
                              style={{ padding: '4px 6px', background: 'var(--bg-subtle)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                              title="Copy Order Summary Details"
                            >
                              <FileText size={12} />
                            </button>
                            <button 
                              onClick={() => copyToClipboard(getTrackingMessage(o), "Tracking Message")} 
                              style={{ padding: '4px 6px', background: 'var(--bg-subtle)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} 
                              title="Copy Customer Tracking Message"
                            >
                              <Send size={12} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
          {currentOrders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              No matching orders found in local records.
            </div>
          ) : (
            currentOrders.map(o => {
              const isSelected = selectedOrderIds.includes(o.id);
              return (
                <div 
                  key={o.id} 
                  className="glass-card"
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-solid)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    margin: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelectOrder(o.id)}
                        style={{ cursor: 'pointer', width: '20px', height: '20px' }}
                      />
                      <strong style={{ fontFamily: 'monospace', color: 'var(--primary)' }}>{o.id}</strong>
                    </div>
                    <div>{getStatusBadge(o.status)}</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)' }}>
                    <span>{new Date(o.orderDate).toLocaleString('en-IN')}</span>
                    <strong>₹{o.total.toLocaleString('en-IN')}</strong>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '13px' }}>
                    <div style={{ fontWeight: 'bold' }}>{o.customerName} ({o.customerPhone})</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                      {o.shippingAddress.houseNumber}, {o.shippingAddress.streetName}, {o.shippingAddress.city} - {o.shippingAddress.pincode}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    {o.items.map(item => (
                      <div key={item.deviceId} style={{ fontSize: '12px', marginBottom: '4px', display: 'flex', justifyContent: 'space-between' }}>
                        <span>{item.brand} {item.modelName} ({item.color})</span>
                        <strong>x{item.quantity}</strong>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '8px' }}>
                    <div style={{ fontSize: '11px' }}>
                      Delivery: <strong>{o.deliveryType === 'home_delivery' ? 'Home' : 'Pickup'}</strong>
                    </div>
                    <div style={{ fontSize: '11px' }}>
                      Payment: <strong>{o.paymentMethod.toUpperCase()}</strong> ({o.paymentStatus.toUpperCase()})
                    </div>
                  </div>

                  {/* Actions Grid */}
                  <div style={{ display: 'flex', gap: '6px', width: '100%', marginTop: '4px' }}>
                    <button 
                      onClick={() => handleOpenOrderDetails(o)}
                      className="premium-btn btn-primary"
                      style={{ flex: 1, padding: '8px', borderRadius: '8px', fontSize: '12px', minHeight: '40px' }}
                    >
                      Manage Order
                    </button>
                    
                    <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden' }}>
                      <button 
                        onClick={() => copyToClipboard(getFormattedAddress(o.shippingAddress), "Formatted Address")} 
                        style={{ padding: '8px 12px', background: 'var(--bg-subtle)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: '40px' }} 
                        title="Copy Address"
                      >
                        <MapPin size={14} />
                      </button>
                      <button 
                        onClick={() => copyToClipboard(getOrderSummaryText(o), "Order Summary")} 
                        style={{ padding: '8px 12px', background: 'var(--bg-subtle)', border: 'none', borderLeft: '1px solid var(--border-color)', cursor: 'pointer', display: 'flex', alignItems: 'center', minHeight: '40px' }} 
                        title="Copy Summary"
                      >
                        <FileText size={14} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>

        {/* 📄 GRID TABLE PAGINATION */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '16px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)'
        }}>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Showing <strong>{indexOfFirstOrder + 1}</strong> to <strong>{Math.min(indexOfLastOrder, sortedOrders.length)}</strong> of <strong>{sortedOrders.length}</strong> entries
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="premium-btn btn-secondary"
              style={{ padding: '4px 8px', borderRadius: '6px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
            >
              <ChevronLeft size={14} />
            </button>
            <span style={{ fontSize: '12px', fontWeight: 'bold' }}>Page {currentPage} of {totalPages}</span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="premium-btn btn-secondary"
              style={{ padding: '4px 8px', borderRadius: '6px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

      </div>

      {/* 🔍 LAYER OVERLAY: DETAILED ORDER DIALOG */}
      {activeOrder && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          backgroundColor: 'var(--overlay-bg)', backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }} className="animate-fade">
          
          <div className="glass-card animate-slide" style={{
            width: '100%', maxWidth: '980px', maxHeight: '90vh',
            borderRadius: '24px', display: 'flex', flexDirection: 'column',
            border: '1px solid var(--border-color)', overflow: 'hidden', boxShadow: 'var(--glass-shadow)'
          }}>
            
            {/* Modal Header */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '18px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)'
            }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', color: 'var(--primary)', textTransform: 'uppercase' }}>SriSai ERP System</span>
                <h3 style={{ fontSize: '18px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Order Details for: {activeOrder.id}</span>
                  {getStatusBadge(activeOrder.status)}
                </h3>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button 
                  onClick={() => printGSTInvoice(activeOrder)}
                  className="premium-btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Printer size={13} />
                  <span>GST Invoice</span>
                </button>
                
                <button 
                  onClick={() => setActiveOrder(null)}
                  style={{
                    border: 'none', background: 'var(--card-bg)', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px' }}>
              
              {/* LEFT COLUMN: CUSTOMER, LOGISTICS & TIMELINE */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Customer & Delivery Address details */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '10px' }}>Client Info & Delivery Address</h4>
                  <div style={{ fontSize: '13px', lineHeight: '1.5' }}>
                    <div><strong>Name:</strong> {activeOrder.customerName}</div>
                    <div><strong>Email:</strong> {activeOrder.customerEmail}</div>
                    <div><strong>Phone:</strong> {activeOrder.customerPhone}</div>
                    {activeOrder.shippingAddress.alternatePhone && <div><strong>Alternate Mobile:</strong> {activeOrder.shippingAddress.alternatePhone}</div>}
                    <div style={{ marginTop: '8px', padding: '10px', backgroundColor: 'var(--bg-subtle)', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <strong>Shipping Address:</strong><br />
                      {activeOrder.shippingAddress.houseNumber || ''} {activeOrder.shippingAddress.apartmentName || ''}<br />
                      {activeOrder.shippingAddress.streetName || ''}, {activeOrder.shippingAddress.areaColony || ''}<br />
                      {activeOrder.shippingAddress.city}, {activeOrder.shippingAddress.state} - <strong>{activeOrder.shippingAddress.pincode}</strong>
                      
                      {activeOrder.shippingAddress.googleMapsLink && (
                        <div style={{ marginTop: '6px' }}>
                          <a href={activeOrder.shippingAddress.googleMapsLink} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', textDecoration: 'none', fontWeight: 'bold', fontSize: '11px' }}>
                            <ExternalLink size={11} />
                            <span>Open Google Maps Directions</span>
                          </a>
                        </div>
                      )}
                      
                      {activeOrder.shippingAddress.deliveryInstructions && (
                        <div style={{ fontSize: '11px', color: '#d97706', marginTop: '4px', fontWeight: 600 }}>
                          📝 instructions: "{activeOrder.shippingAddress.deliveryInstructions}"
                        </div>
                      )}
                      
                      {activeOrder.shippingAddress.preferredTimeSlot && (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          🕒 Preferred Window: <strong>{activeOrder.shippingAddress.preferredTimeSlot}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Timeline history log */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '12px' }}>Detailed Order Timeline Tracker</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingLeft: '8px' }}>
                    {activeOrder.timeline.map((evt, idx) => (
                      <div key={idx} style={{ display: 'flex', gap: '12px', position: 'relative' }}>
                        {/* timeline dot line */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--primary)', zIndex: 1 }} />
                          {idx !== activeOrder.timeline.length - 1 && (
                            <div style={{ width: '2px', flex: 1, backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
                          )}
                        </div>
                        <div style={{ fontSize: '12px', paddingBottom: idx !== activeOrder.timeline.length - 1 ? '10px' : 0 }}>
                          <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>{evt.status.replace(/_/g, ' ')}</div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{new Date(evt.timestamp).toLocaleString('en-IN')} (By: {evt.updatedBy})</div>
                          <div style={{ color: 'var(--text-main)', fontSize: '11px', marginTop: '2px' }}>{evt.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 3. WhatsApp Quick Templates triggers */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '10px' }}>WhatsApp quick actions</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button onClick={() => sendWhatsAppTemplate('confirm', activeOrder)} className="premium-btn btn-secondary" style={{ padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <MessageCircle size={13} style={{ color: '#25D366' }} />
                      <span>WhatsApp Confirmation</span>
                    </button>
                    <button onClick={() => sendWhatsAppTemplate('ship', activeOrder)} className="premium-btn btn-secondary" style={{ padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <MessageCircle size={13} style={{ color: '#25D366' }} />
                      <span>Send Shipping Info</span>
                    </button>
                    <button onClick={() => sendWhatsAppTemplate('deliver', activeOrder)} className="premium-btn btn-secondary" style={{ padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <MessageCircle size={13} style={{ color: '#25D366' }} />
                      <span>Send Delivery Update</span>
                    </button>
                    <button onClick={() => sendWhatsAppTemplate('reminder', activeOrder)} className="premium-btn btn-secondary" style={{ padding: '8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center' }}>
                      <MessageCircle size={13} style={{ color: '#25D366' }} />
                      <span>Send Payment Alert</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: PRODUCTS BILL, PAYMENTS & LOGISTICS UPDATES */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* 1. Item summary details */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px', backgroundColor: 'var(--bg-subtle)' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '10px' }}>Billing Products Summary</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    {activeOrder.items.map(item => (
                      <div key={item.deviceId} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                        <div>
                          <strong>{item.brand} {item.modelName}</strong> ({item.color})<br/>
                          <span style={{ color: 'var(--text-muted)' }}>{item.ram}/{item.storage} • x{item.quantity}</span>
                        </div>
                        <div style={{ fontWeight: 'bold' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</div>
                      </div>
                    ))}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--text-muted)', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                        <span>Subtotal (Excl. Tax)</span>
                        <span>₹{Math.round((activeOrder.subtotal - activeOrder.discount) * 0.82).toLocaleString('en-IN')}</span>
                      </div>
                      {activeOrder.discount > 0 && (
                        <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', color: 'var(--success)' }}>
                          <span>Coupon discount</span>
                          <span>- ₹{activeOrder.discount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                        <span>GST Tax Breakdown (18%)</span>
                        <span>₹{activeOrder.gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between' }}>
                        <span>Delivery Logistics Charges</span>
                        <span>₹{activeOrder.deliveryFee}</span>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', justifySelf: 'space-between', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', color: 'var(--text-main)' }}>
                      <span>Grand Total Bill</span>
                      <span>₹{activeOrder.total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Order actions picker */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '8px' }}>Update Order workflow</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'confirmed', currentUser?.email)} className="premium-btn btn-secondary" style={{ padding: '6px', fontSize: '11px' }}>Confirm Order</button>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'packed', currentUser?.email)} className="premium-btn btn-secondary" style={{ padding: '6px', fontSize: '11px' }}>Mark Packed</button>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'shipped', currentUser?.email)} className="premium-btn btn-secondary" style={{ padding: '6px', fontSize: '11px' }}>Mark Shipped</button>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'out_for_delivery', currentUser?.email)} className="premium-btn btn-secondary" style={{ padding: '6px', fontSize: '11px' }}>Out for Delivery</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'delivered', currentUser?.email)} className="premium-btn btn-primary" style={{ padding: '6px', fontSize: '11px', backgroundColor: 'var(--success)' }}>Mark Delivered</button>
                      <button onClick={() => updateOrderStatus(activeOrder.id, 'cancelled', currentUser?.email)} className="premium-btn btn-secondary" style={{ padding: '6px', fontSize: '11px', color: 'var(--error)', borderColor: 'rgba(239,68,68,0.3)' }}>Cancel Order</button>
                    </div>
                  </div>
                </div>

                {/* 3. Payments ID & Screen capture verification */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '8px' }}>Payment Audit Verification</h4>
                  <div style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div>Method: <strong style={{ textTransform: 'uppercase' }}>{activeOrder.paymentMethod}</strong></div>
                    <div>Status: <strong style={{ color: activeOrder.paymentStatus === 'paid' ? 'var(--success)' : '#f59e0b' }}>{activeOrder.paymentStatus.toUpperCase()}</strong></div>
                    
                    {activeOrder.transactionId ? (
                      <div>Transaction ID: <code>{activeOrder.transactionId}</code></div>
                    ) : (
                      <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                        <input 
                          type="text" 
                          placeholder="Enter UPI Txn ID"
                          onBlur={(e) => {
                            if (e.target.value) {
                              updateOrderPayment(activeOrder.id, { transactionId: e.target.value });
                              const updated = orders.find(o => o.id === activeOrder.id);
                              if (updated) setActiveOrder(updated);
                            }
                          }}
                          className="input-field" 
                          style={{ padding: '4px 8px', fontSize: '11px', height: '26px' }}
                        />
                      </div>
                    )}

                    {/* Screenshot Preview */}
                    <div style={{ marginTop: '8px' }}>
                      {activeOrder.paymentScreenshot ? (
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>UPI payment receipt:</span>
                          <img 
                            src={activeOrder.paymentScreenshot} 
                            alt="Receipt" 
                            style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                          />
                        </div>
                      ) : (
                        <button 
                          onClick={handleSimulateScreenshot}
                          className="premium-btn btn-secondary"
                          style={{ padding: '5px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', width: '100%', justifyContent: 'center' }}
                        >
                          <DollarSign size={13} />
                          <span>Simulate UPI Screenshot Upload</span>
                        </button>
                      )}
                    </div>

                    {/* Issue Refund SECTION (Super Admin & Manager Restricted) */}
                    {(adminRole === 'super_admin' || adminRole === 'manager') && (
                      <div style={{ borderTop: '1px dashed var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                        {!showRefundSection ? (
                          <button 
                            onClick={() => setShowRefundSection(true)} 
                            className="premium-btn btn-secondary" 
                            style={{ width: '100%', padding: '5px', fontSize: '11px', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          >
                            💸 Issue Refund Process
                          </button>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                            <div style={{ fontWeight: 'bold', color: 'var(--error)', fontSize: '11px' }}>Issue Refund Form</div>
                            
                            <div>
                              <label style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Refund Amount (Max ₹{activeOrder.total})</label>
                              <input 
                                type="number" 
                                value={refundAmountInput} 
                                onChange={(e) => setRefundAmountInput(e.target.value)} 
                                className="input-field" 
                                style={{ padding: '4px', fontSize: '11px', height: '26px' }}
                                placeholder={activeOrder.total.toString()}
                              />
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                              <div>
                                <label style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Refund Method</label>
                                <select value={refundMethodInput} onChange={(e) => setRefundMethodInput(e.target.value)} className="input-field" style={{ padding: '3px', fontSize: '10px', height: '24px' }}>
                                  <option value="UPI">UPI</option>
                                  <option value="Card">Bank Card</option>
                                  <option value="Store credit">Store Credit</option>
                                  <option value="Cash">Cash Handover</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '9px', color: 'var(--text-muted)' }}>Reason</label>
                                <input type="text" value={refundReasonInput} onChange={(e) => setRefundReasonInput(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '10px', height: '24px' }} />
                              </div>
                            </div>

                            <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                              <button onClick={() => setShowRefundSection(false)} className="premium-btn btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '10px' }}>Cancel</button>
                              <button onClick={handleExecuteRefund} className="premium-btn btn-primary" style={{ flex: 1.5, padding: '4px', fontSize: '10px', backgroundColor: 'var(--error)' }}>Execute Refund</button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                </div>

                {/* 4. Delivery logistics update (only if Home Delivery) */}
                {activeOrder.deliveryType === 'home_delivery' && (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                    <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '8px' }}>Logistics Partner & Executive Updates</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '11px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ color: 'var(--text-muted)' }}>Delivery Partner</label>
                          <input type="text" value={devPartner} onChange={(e) => setDevPartner(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '11px', height: '26px' }} placeholder="e.g. Delhivery, BlueDart" />
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-muted)' }}>Tracking Number</label>
                          <input type="text" value={devTracking} onChange={(e) => setDevTracking(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '11px', height: '26px' }} placeholder="e.g. DEL9832048" />
                        </div>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div>
                          <label style={{ color: 'var(--text-muted)' }}>Executive Name</label>
                          <input type="text" value={devExecName} onChange={(e) => setDevExecName(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '11px', height: '26px' }} />
                        </div>
                        <div>
                          <label style={{ color: 'var(--text-muted)' }}>Executive Phone</label>
                          <input type="tel" value={devExecPhone} onChange={(e) => setDevExecPhone(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '11px', height: '26px' }} />
                        </div>
                      </div>

                      <div>
                        <label style={{ color: 'var(--text-muted)' }}>Expected Delivery Timeline text</label>
                        <input type="text" value={expectedDate} onChange={(e) => setExpectedDate(e.target.value)} className="input-field" style={{ padding: '4px', fontSize: '11px', height: '26px' }} />
                      </div>

                      <button onClick={handleSaveDeliveryInfo} className="premium-btn btn-secondary" style={{ padding: '6px', width: '100%', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'center', marginTop: '4px' }}>
                        <span>Update Delivery Executive details</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* 5. Internal notes & Call lists logs */}
                <div style={{ border: '1px solid var(--border-color)', borderRadius: '14px', padding: '16px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 0, marginBottom: '8px' }}>Internal Admin Notes</h4>
                  
                  {/* Notes Feed */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', maxHeight: '100px', overflowY: 'auto' }}>
                    {activeOrder.internalNotes && activeOrder.internalNotes.length > 0 ? (
                      activeOrder.internalNotes.map((note, idx) => (
                        <div key={idx} style={{ padding: '6px 8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '11px', borderLeft: '3px solid var(--primary)' }}>
                          {note}
                        </div>
                      ))
                    ) : (
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No internal notes saved.</div>
                    )}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '6px' }}>
                    <input 
                      type="text" 
                      placeholder="Add internal note..."
                      value={noteInput}
                      onChange={(e) => setNoteInput(e.target.value)}
                      className="input-field"
                      style={{ padding: '4px 8px', fontSize: '11px', height: '28px' }}
                    />
                    <button onClick={handleAddNote} className="premium-btn btn-secondary" style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '6px' }}>Add</button>
                  </div>

                  {/* Customer Call details */}
                  <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '12px', paddingTop: '10px' }}>
                    <h5 style={{ margin: '0 0 6px 0', fontSize: '12px', fontWeight: 700 }}>Registered Call Logs</h5>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px', maxHeight: '80px', overflowY: 'auto' }}>
                      {activeOrder.callLogs && activeOrder.callLogs.length > 0 ? (
                        activeOrder.callLogs.map((c) => (
                          <div key={c.id} style={{ padding: '6px 8px', backgroundColor: 'var(--bg-subtle)', borderRadius: '6px', fontSize: '11px' }}>
                            <div>📞 <strong>{c.duration}</strong> by {c.staffName} ({new Date(c.timestamp).toLocaleDateString()})</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>{c.summary}</div>
                          </div>
                        ))
                      ) : (
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No customer call logs registered.</div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <input 
                          type="text" 
                          placeholder="Call duration (e.g. 2m 15s)"
                          value={callDuration}
                          onChange={(e) => setCallDuration(e.target.value)}
                          className="input-field"
                          style={{ padding: '4px 8px', fontSize: '10px', height: '24px', flex: 1 }}
                        />
                        <input 
                          type="text" 
                          placeholder="Brief summary of discussion..."
                          value={callSummary}
                          onChange={(e) => setCallSummary(e.target.value)}
                          className="input-field"
                          style={{ padding: '4px 8px', fontSize: '10px', height: '24px', flex: 2 }}
                        />
                      </div>
                      <button onClick={handleAddCallLog} className="premium-btn btn-secondary" style={{ padding: '4px', fontSize: '11px', width: '100%' }}>Register Call Log Entry</button>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
