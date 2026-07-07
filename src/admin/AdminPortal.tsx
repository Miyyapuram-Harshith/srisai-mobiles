import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { DeviceManager } from './DeviceManager';
import { BannerManager } from './BannerManager';
import { FlashSaleManager } from './FlashSaleManager';
import { AdminManager } from './AdminManager';
import { NotificationCenter } from './NotificationCenter';
import { OrderManager } from './OrderManager';
import { CommunicationManager } from './CommunicationManager';
import { InstagramManager } from './InstagramManager';
import { AccessoryManager } from './AccessoryManager';
import { AuditLogManager } from './AuditLogManager';
import { 
  LayoutDashboard, Smartphone, Image as ImageIcon, Flame, 
  Users, Bell, Home, Menu, X, ShieldCheck, Package, ChevronDown, ChevronRight,
  MessageCircle, Camera, Tag, FileText
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { currentUser, navigateTo, notifications, orders, adminRole, setAdminRole, hasAnyUnsavedChanges, showToast } = useApp();
  const [activeSubRoute, setActiveSubRoute] = useState<'dashboard' | 'devices' | 'banners' | 'sales' | 'admins' | 'notifications' | 'orders' | 'communications' | 'instagram' | 'accessories' | 'audit_logs'>('dashboard');
  const [ordersFilter, setOrdersFilter] = useState<string>('all');
  const [ordersMenuExpanded, setOrdersMenuExpanded] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSubRouteSwitch = (route: typeof activeSubRoute, orderFilterVal?: string) => {
    if (hasAnyUnsavedChanges) {
      if (window.confirm("You have unsaved changes in the admin panel. Switching tabs will discard them. Are you sure you want to proceed?")) {
        setActiveSubRoute(route);
        if (orderFilterVal !== undefined) setOrdersFilter(orderFilterVal);
      } else {
        showToast("Tab switch cancelled. Save your changes first.", "info");
      }
    } else {
      setActiveSubRoute(route);
      if (orderFilterVal !== undefined) setOrdersFilter(orderFilterVal);
    }
  };

  // Security Verification: Lock out non-admins
  useEffect(() => {
    if (!currentUser || currentUser.role === 'customer') {
      navigateTo('home');
    }
  }, [currentUser]);

  // Permissions path guard
  useEffect(() => {
    if (activeSubRoute === 'devices' || activeSubRoute === 'banners' || activeSubRoute === 'sales' || activeSubRoute === 'communications' || activeSubRoute === 'accessories' || activeSubRoute === 'instagram') {
      if (adminRole !== 'super_admin' && adminRole !== 'manager') {
        setActiveSubRoute('orders');
      }
    }
    if (activeSubRoute === 'admins' || activeSubRoute === 'audit_logs') {
      if (adminRole !== 'super_admin') {
        setActiveSubRoute('orders');
      }
    }
    if (activeSubRoute === 'notifications') {
      if (adminRole === 'delivery_staff') {
        setActiveSubRoute('orders');
      }
    }
  }, [adminRole, activeSubRoute]);

  if (!currentUser || currentUser.role === 'customer') {
    return (
      <div style={{ padding: '80px 20px', textAlign: 'center' }}>
        <h2>Checking credentials...</h2>
      </div>
    );
  }

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // Order Counts by Status/Category
  const getOrderCount = (type: string) => {
    switch (type) {
      case 'all': return orders.length;
      case 'pending': return orders.filter(o => o.status === 'pending').length;
      case 'confirmed': return orders.filter(o => o.status === 'confirmed').length;
      case 'packed': return orders.filter(o => o.status === 'packed').length;
      case 'shipped': return orders.filter(o => o.status === 'shipped').length;
      case 'out_for_delivery': return orders.filter(o => o.status === 'out_for_delivery').length;
      case 'delivered': return orders.filter(o => o.status === 'delivered').length;
      case 'cancelled': return orders.filter(o => o.status === 'cancelled').length;
      case 'returned': return orders.filter(o => o.status === 'returned').length;
      case 'refund_requested': return orders.filter(o => o.status === 'refund_requested').length;
      case 'preorder': return orders.filter(o => o.isPreorder).length;
      case 'store_pickup': return orders.filter(o => o.deliveryType === 'store_pickup').length;
      default: return 0;
    }
  };

  const orderSubMenus = [
    { label: 'All Orders', key: 'all' },
    { label: 'Pending Orders', key: 'pending' },
    { label: 'Confirmed Orders', key: 'confirmed' },
    { label: 'Packed Orders', key: 'packed' },
    { label: 'Shipped Orders', key: 'shipped' },
    { label: 'Out For Delivery', key: 'out_for_delivery' },
    { label: 'Delivered Orders', key: 'delivered' },
    { label: 'Cancelled Orders', key: 'cancelled' },
    { label: 'Returned Orders', key: 'returned' },
    { label: 'Refund Requests', key: 'refund_requested' },
    { label: 'Preorders', key: 'preorder' },
    { label: 'Store Pickup', key: 'store_pickup' }
  ];

  return (
    <div style={{
      display: 'flex',
      minHeight: 'calc(100vh - 70px)',
      position: 'relative'
    }} className="animate-fade">
      
      {/* Sidebar Navigation */}
      <aside 
        className="glass"
        style={{
          width: sidebarOpen ? '260px' : '0px',
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          borderRight: sidebarOpen ? '1px solid var(--border-color)' : 'none',
          transition: 'width 0.3s ease',
          zIndex: 40,
          position: 'sticky',
          top: '70px',
          height: 'calc(100vh - 70px)',
          flexShrink: 0
        }}
      >
        {/* User Card & Permission Switcher */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '16px'
            }}>
              {currentUser.email.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser.email.split('@')[0]}</span>
              <span style={{ fontSize: '10px', color: 'var(--accent)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '3px' }}>
                <ShieldCheck size={11} />
                <span>{adminRole.replace('_', ' ').toUpperCase()}</span>
              </span>
            </div>
          </div>
          
          {/* Permission Switcher Widget */}
          <div style={{ marginTop: '4px' }}>
            <label style={{ fontSize: '9px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '2px' }}>Role Simulator (Test Permissions)</label>
            <select
              value={adminRole}
              onChange={(e) => setAdminRole(e.target.value as any)}
              className="input-field"
              style={{ fontSize: '11px', padding: '4px 8px', height: '28px', width: '100%', cursor: 'pointer' }}
            >
              <option value="super_admin">Super Admin (Full Access)</option>
              <option value="manager">Manager (Inventory + Orders)</option>
              <option value="sales_staff">Sales Staff (Orders Only)</option>
              <option value="delivery_staff">Delivery Staff (Updates Only)</option>
            </select>
          </div>
        </div>

        {/* Navigation list */}
        <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          
          <button
            onClick={() => handleSubRouteSwitch('dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: activeSubRoute === 'dashboard' ? 'var(--gradient-blue)' : 'none',
              color: activeSubRoute === 'dashboard' ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              textAlign: 'left'
            }}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>

          {/* 📦 ORDER MANAGEMENT SECTION (nested sub-menus) */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <button
              onClick={() => {
                handleSubRouteSwitch('orders');
                setOrdersMenuExpanded(!ordersMenuExpanded);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'orders' ? 'rgba(59, 130, 246, 0.08)' : 'none',
                color: activeSubRoute === 'orders' ? 'var(--primary)' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Package size={18} style={{ color: activeSubRoute === 'orders' ? 'var(--primary)' : 'inherit' }} />
                <span>Order Management</span>
              </div>
              {ordersMenuExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {ordersMenuExpanded && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                paddingLeft: '32px',
                marginTop: '4px',
                borderLeft: '1px solid var(--border-color)',
                marginLeft: '22px'
              }}>
                {orderSubMenus.map(sub => {
                  const isActive = activeSubRoute === 'orders' && ordersFilter === sub.key;
                  const count = getOrderCount(sub.key);
                  return (
                    <button
                      key={sub.key}
                      onClick={() => {
                        handleSubRouteSwitch('orders', sub.key);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        border: 'none',
                        background: isActive ? 'var(--gradient-blue)' : 'none',
                        color: isActive ? 'white' : 'var(--text-muted)',
                        cursor: 'pointer',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '12px',
                        textAlign: 'left'
                      }}
                    >
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{sub.label}</span>
                      <span style={{
                        fontSize: '10px',
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.25)' : 'var(--bg-subtle)',
                        color: isActive ? 'white' : 'var(--text-main)',
                        padding: '1px 6px',
                        borderRadius: '8px',
                        fontWeight: 'bold'
                      }}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Manage Devices */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('devices')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'devices' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'devices' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Smartphone size={18} />
              <span>Manage Devices</span>
            </button>
          )}

          {/* Accessories */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('accessories')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'accessories' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'accessories' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Tag size={18} />
              <span>Manage Accessories</span>
            </button>
          )}

          {/* Banners */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('banners')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'banners' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'banners' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <ImageIcon size={18} />
              <span>Banners Management</span>
            </button>
          )}

          {/* Flash Sales */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('sales')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'sales' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'sales' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Flame size={18} />
              <span>Flash Sales</span>
            </button>
          )}

          {/* Manage Admins */}
          {adminRole === 'super_admin' && (
            <button
              onClick={() => handleSubRouteSwitch('admins')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'admins' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'admins' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Users size={18} />
              <span>Manage Admins</span>
            </button>
          )}

          {/* Audit Logs */}
          {adminRole === 'super_admin' && (
            <button
              onClick={() => handleSubRouteSwitch('audit_logs')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'audit_logs' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'audit_logs' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <FileText size={18} />
              <span>System Audit Logs</span>
            </button>
          )}

          {/* Alerts Notifications */}
          {(adminRole === 'super_admin' || adminRole === 'manager' || adminRole === 'sales_staff') && (
            <button
              onClick={() => handleSubRouteSwitch('notifications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'notifications' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'notifications' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Bell size={18} />
                <span>System Alerts</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span style={{
                  backgroundColor: activeSubRoute === 'notifications' ? 'white' : 'var(--error)',
                  color: activeSubRoute === 'notifications' ? 'var(--primary)' : 'white',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px'
                }}>
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          )}

          {/* Comm Settings */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('communications')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'communications' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'communications' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <MessageCircle size={18} />
              <span>Comm Settings</span>
            </button>
          )}

          {/* Instagram Feed */}
          {(adminRole === 'super_admin' || adminRole === 'manager') && (
            <button
              onClick={() => handleSubRouteSwitch('instagram')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 'none',
                background: activeSubRoute === 'instagram' ? 'var(--gradient-blue)' : 'none',
                color: activeSubRoute === 'instagram' ? 'white' : 'var(--text-main)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textAlign: 'left'
              }}
            >
              <Camera size={18} />
              <span>Instagram Feed</span>
            </button>
          )}
        </nav>

        {/* Exit footer */}
        <div style={{ padding: '20px 12px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => {
              if (hasAnyUnsavedChanges) {
                if (window.confirm("You have unsaved changes in the admin panel. Leaving will discard them. Are you sure you want to proceed?")) {
                  navigateTo('home');
                }
              } else {
                navigateTo('home');
              }
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              width: '100%',
              padding: '10px 14px',
              borderRadius: '10px',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: 'var(--text-main)',
              fontWeight: 600,
              fontSize: '13px',
              textAlign: 'left'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Home size={18} />
            <span>Customer Store</span>
          </button>
        </div>

      </aside>

      {/* Main Administrative Screen Area */}
      <main style={{
        flex: 1,
        padding: '24px 30px',
        overflowX: 'hidden'
      }}>
        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            border: 'none',
            background: 'var(--bg-subtle)',
            padding: '6px 12px',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '20px'
          }}
        >
          {sidebarOpen ? <X size={14} /> : <Menu size={14} />}
          <span>{sidebarOpen ? 'Hide Navigation' : 'Show Navigation'}</span>
        </button>

        <div className="animate-fade">
          {activeSubRoute === 'dashboard' && <AdminDashboard />}
          {activeSubRoute === 'devices' && <DeviceManager />}
          {activeSubRoute === 'accessories' && <AccessoryManager />}
          {activeSubRoute === 'banners' && <BannerManager />}
          {activeSubRoute === 'sales' && <FlashSaleManager />}
          {activeSubRoute === 'instagram' && <InstagramManager />}
          {activeSubRoute === 'admins' && <AdminManager />}
          {activeSubRoute === 'notifications' && <NotificationCenter />}
          {activeSubRoute === 'orders' && <OrderManager defaultFilter={ordersFilter} />}
          {activeSubRoute === 'communications' && <CommunicationManager />}
          {activeSubRoute === 'audit_logs' && <AuditLogManager />}
        </div>
      </main>

    </div>
  );
};
