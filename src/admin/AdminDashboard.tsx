import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShoppingBag, ShieldAlert, Award, TrendingUp, 
  Smartphone, BarChart2, IndianRupee, Eye, DollarSign, Map, Clock,
  MessageCircle, RefreshCw, CheckCircle2, Truck, Package
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { 
    devices, accessories, orders, auditLogs, whatsAppAnalytics,
    refetchOrders, refetchProducts, refetchAccessories, showToast 
  } = useApp();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(new Date().toLocaleTimeString('en-IN'));

  // Auto-refresh real-time data on mount
  useEffect(() => {
    handleRefresh(true);
  }, []);

  const handleRefresh = async (silent = false) => {
    setIsRefreshing(true);
    try {
      await Promise.allSettled([
        refetchOrders?.(),
        refetchProducts?.(),
        refetchAccessories?.()
      ]);
      setLastRefreshed(new Date().toLocaleTimeString('en-IN'));
      if (!silent) {
        showToast('Dashboard metrics refreshed from database!', 'success');
      }
    } catch (err: any) {
      console.error('Failed to refresh dashboard:', err);
      if (!silent) {
        showToast('Failed to refresh live data: ' + err.message, 'error');
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Metrics Calculations
  const totalProductsCount = devices.length + (accessories?.length || 0);
  
  // Real-time Revenue & Orders Calculations
  const todayDateStr = new Date().toISOString().split('T')[0];
  const validOrders = orders.filter(o => o.status !== 'cancelled');
  const ordersToday = validOrders.filter(o => o.orderDate && o.orderDate.startsWith(todayDateStr));
  const revenueToday = ordersToday.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  // Total products bought / units sold calculation
  const totalUnitsSold = validOrders.reduce((acc, o) => {
    if (Array.isArray(o.items)) {
      return acc + o.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
    }
    return acc;
  }, 0);

  const unitsSoldToday = ordersToday.reduce((acc, o) => {
    if (Array.isArray(o.items)) {
      return acc + o.items.reduce((sum, item) => sum + (Number(item?.quantity) || 1), 0);
    }
    return acc;
  }, 0);

  const totalRevenue = validOrders.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

  // Average Order Value (AOV)
  const aov = validOrders.length > 0 ? Math.round(totalRevenue / validOrders.length) : 0;

  // Refunded amount
  const totalRefunded = orders.reduce((acc, o) => acc + (Number(o.refundAmount) || 0), 0);

  // Status breakdown
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inTransitOrders = orders.filter(o => ['confirmed', 'packed', 'shipped', 'out_for_delivery'].includes(o.status));
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  // Low stock warning list
  const lowStockProducts = devices.filter(d => d.stockCount <= 2 && d.status === 'available');

  // Popular and sales
  const mostViewed = [...devices].sort((a, b) => b.views - a.views).slice(0, 5);
  const bestSelling = [...devices].sort((a, b) => b.sales - a.sales).slice(0, 5);

  // Top Purchasing Cities (Null-Safe)
  const cityCount = orders.reduce((acc: Record<string, number>, o) => {
    let city = 'Store Pickup';
    if (o.shippingAddress && typeof o.shippingAddress === 'object' && o.shippingAddress.city) {
      city = o.shippingAddress.city;
    } else if (o.deliveryType === 'home_delivery') {
      city = 'Jagtial';
    }
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});
  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // Best Selling Brands list (Null-Safe)
  const brandSales = orders.reduce((acc: Record<string, number>, o) => {
    if (Array.isArray(o.items)) {
      o.items.forEach(item => {
        if (item && item.brand) {
          acc[item.brand] = (acc[item.brand] || 0) + (Number(item.quantity) || 1);
        }
      });
    }
    return acc;
  }, {});
  const bestBrands = Object.entries(brandSales).sort((a, b) => b[1] - a[1]).slice(0, 4);

  // 📈 REAL 7-DAY REVENUE CALCULATION
  const now = new Date();
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const dayRevenue = orders
      .filter(o => o.orderDate && o.orderDate.startsWith(dateStr) && o.status !== 'cancelled')
      .reduce((acc, o) => acc + (Number(o.total) || 0), 0);

    return {
      day: dayLabel,
      date: dateStr,
      revenue: dayRevenue
    };
  });

  const chartWidth = 500;
  const chartHeight = 160;
  const padding = 20;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;
  const maxVal = Math.max(...chartData.map(d => d.revenue), 10000);

  const points = chartData.map((d, i) => {
    const x = padding + (i * (graphWidth / (chartData.length - 1)));
    const y = chartHeight - padding - ((d.revenue / maxVal) * graphHeight);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Page Header with Real-Time Refresh Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>SriSai Operations Dashboard</span>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }} />
              LIVE
            </span>
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Real-time business intelligence, live D1 order metrics, and diagnostic audit logs. (Last synced: {lastRefreshed})
          </p>
        </div>

        <button
          onClick={() => handleRefresh(false)}
          disabled={isRefreshing}
          className="premium-btn btn-secondary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 700
          }}
        >
          <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Sync Live Data'}</span>
        </button>
      </div>

      {/* 🚀 PRIMARY KPI GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        
        {/* Total Revenue */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success)',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <IndianRupee size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TOTAL REVENUE</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>₹{totalRevenue.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Today's Revenue */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#f59e0b',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TODAY'S SALES ({ordersToday.length})</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>₹{revenueToday.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(59, 130, 246, 0.12)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <Package size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>TOTAL ORDERS</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{orders.length}</span>
          </div>
        </div>

        {/* Units Sold / Products Bought */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(99, 102, 241, 0.12)', color: '#6366f1',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <Smartphone size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>UNITS SOLD ({unitsSoldToday} today)</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{totalUnitsSold}</span>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: pendingOrders.length > 0 ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: pendingOrders.length > 0 ? 'var(--error)' : 'var(--success)',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <ShoppingBag size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>PENDING ORDERS</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: pendingOrders.length > 0 ? 'var(--error)' : 'inherit' }}>
              {pendingOrders.length}
            </span>
          </div>
        </div>

        {/* In-Transit Orders */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(6, 182, 212, 0.12)', color: '#06b6d4',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <Truck size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>IN DISPATCH / TRANSIT</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{inTransitOrders.length}</span>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <TrendingUp size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>AVG. ORDER VALUE</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>₹{aov.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: lowStockProducts.length > 0 ? 'rgba(245, 158, 11, 0.12)' : 'rgba(16, 185, 129, 0.12)',
            color: lowStockProducts.length > 0 ? '#f59e0b' : 'var(--success)',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <ShieldAlert size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>LOW STOCK ALERTS</span>
            <span style={{ fontSize: '20px', fontWeight: 800, color: lowStockProducts.length > 0 ? '#f59e0b' : 'inherit' }}>
              {lowStockProducts.length}
            </span>
          </div>
        </div>

        {/* WhatsApp Support Clicks */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
          <div style={{
            width: '42px', height: '42px', borderRadius: '10px',
            backgroundColor: 'rgba(37, 211, 102, 0.12)', color: '#25D366',
            display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center'
          }}>
            <MessageCircle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block' }}>WHATSAPP INQUIRIES</span>
            <span style={{ fontSize: '20px', fontWeight: 800 }}>{whatsAppAnalytics?.totalClicks || 0}</span>
          </div>
        </div>

      </div>

      {/* 📊 REAL 7-DAY SALES PERFORMANCE & AUDIT ACTIVITY FEED */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Real 7-day Line Chart */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: 'var(--primary)' }} />
              <span>Real 7-Day Revenue Trend</span>
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Total 7D: ₹{chartData.reduce((acc, d) => acc + d.revenue, 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', width: '100%', overflowX: 'auto' }}>
            <svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
              <line x1={padding} y1={padding} x2={chartWidth - padding} y2={padding} stroke="var(--border-color)" strokeWidth={0.5} strokeDasharray="3 3" />
              <line x1={padding} y1={chartHeight / 2} x2={chartWidth - padding} y2={chartHeight / 2} stroke="var(--border-color)" strokeWidth={0.5} strokeDasharray="3 3" />
              <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="var(--border-color)" strokeWidth={1} />
              
              <polyline fill="none" stroke="var(--primary)" strokeWidth="3" points={points} />

              {chartData.map((d, i) => {
                const x = padding + (i * (graphWidth / (chartData.length - 1)));
                const y = chartHeight - padding - ((d.revenue / maxVal) * graphHeight);
                return (
                  <g key={i}>
                    <circle cx={x} cy={y} r="5" fill="var(--primary)" stroke="var(--card-bg)" strokeWidth="2" />
                    <text x={x} y={chartHeight - 4} fontSize="9" textAnchor="middle" fill="var(--text-muted)" fontWeight="600">{d.day}</text>
                    <text x={x} y={Math.max(14, y - 8)} fontSize="8" textAnchor="middle" fill="var(--text-main)" fontWeight="bold">₹{Math.round(d.revenue / 1000)}k</text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* 📋 LIVE AUDIT ACTIVITY FEED */}
        <div className="glass-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span>Recent Operational Actions</span>
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{auditLogs?.length || 0} entries</span>
          </div>
          
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '8px', 
            overflowY: 'auto', flex: 1, maxHeight: '140px',
            scrollbarWidth: 'thin'
          }}>
            {auditLogs && auditLogs.length > 0 ? (
              auditLogs.slice(0, 10).map((log) => (
                <div 
                  key={log.id}
                  style={{
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                    <span style={{ color: 'var(--primary)' }}>{log.adminName}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '9px' }}>{log.date} @ {log.time}</span>
                  </div>
                  <div style={{ color: 'var(--text-main)', marginTop: '2px' }}>{log.action}</div>
                </div>
              ))
            ) : (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                No audit entries recorded in this session.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 📈 PERFORMANCE STATS AND REGIONAL METRICS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '20px'
      }}>
        
        {/* Top Cities */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Map size={14} />
            <span>Top Purchasing Cities</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topCities.length > 0 ? (
              topCities.map(([city, count]) => (
                <div key={city} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{city}</strong>
                  <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{count} Order(s)</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No local sales mapped.</div>
            )}
          </div>
        </div>

        {/* Best Brands */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Award size={14} />
            <span>Best Selling Brands</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {bestBrands.length > 0 ? (
              bestBrands.map(([brand, count]) => (
                <div key={brand} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                  <strong style={{ textTransform: 'capitalize' }}>{brand}</strong>
                  <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{count} Unit(s)</span>
                </div>
              ))
            ) : (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>No products sold yet.</div>
            )}
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <TrendingUp size={14} />
            <span>Top Selling Products</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {bestSelling.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{d.modelName}</span>
                <span style={{ color: 'var(--success)', fontWeight: 'bold' }}>{d.sales} sold ({d.stockCount} left)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Devices */}
        <div className="glass-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Eye size={14} />
            <span>Top Viewed Products</span>
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {mostViewed.slice(0, 4).map(d => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '4px' }}>
                <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{d.modelName}</span>
                <span style={{ color: 'var(--text-muted)' }}>{d.views} views</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
