import React from 'react';
import { useApp } from '../context/AppContext';
import { SystemNotification } from '../types';
import { Bell, ShieldAlert, CheckCheck, Inbox, Flame, ShoppingBag, Clock } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useApp();

  const handleMarkRead = (id: string) => {
    markNotificationRead(id);
  };

  const getIcon = (type: SystemNotification['type']) => {
    switch (type) {
      case 'low_stock':
        return <ShieldAlert style={{ color: 'var(--error)' }} size={16} />;
      case 'failed_otp':
        return <ShieldAlert style={{ color: 'var(--warning)' }} size={16} />;
      case 'new_order':
        return <ShoppingBag style={{ color: 'var(--success)' }} size={16} />;
      case 'sale_ending':
        return <Flame style={{ color: 'var(--error)' }} size={16} />;
      default:
        return <Bell style={{ color: 'var(--primary)' }} size={16} />;
    }
  };

  const formatTime = (isoString: string): string => {
    const d = new Date(isoString);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>System Notifications</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Admin warning desk for inventory alerts, transactions, and authentication logs.</p>
        </div>

        {notifications.length > 0 && (
          <button 
            onClick={markAllNotificationsRead}
            className="premium-btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '10px', fontSize: '12px' }}
          >
            <CheckCheck size={14} />
            <span>Mark All Read</span>
          </button>
        )}
      </div>

      {/* Main Alert List */}
      <div className="glass-card" style={{ padding: '24px', minHeight: '300px' }}>
        {notifications.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            color: 'var(--text-muted)',
            padding: '80px 0'
          }}>
            <Inbox size={48} strokeWidth={1} />
            <p>Your notification inbox is clean.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => handleMarkRead(n.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  padding: '14px 16px',
                  backgroundColor: n.read ? 'transparent' : 'rgba(59, 130, 246, 0.04)',
                  border: n.read ? '1px solid var(--border-color)' : '1px solid rgba(59, 130, 246, 0.25)',
                  borderRadius: '12px',
                  cursor: n.read ? 'default' : 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  backgroundColor: 'var(--bg-subtle)',
                  padding: '8px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {getIcon(n.type)}
                </div>

                <div style={{ flex: 1, fontSize: '13px' }}>
                  <div style={{ fontWeight: n.read ? 'normal' : 'bold', color: 'var(--text-main)' }}>
                    {n.message}
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '4px', 
                    color: 'var(--text-muted)', 
                    fontSize: '11px',
                    marginTop: '4px' 
                  }}>
                    <Clock size={10} />
                    <span>{formatTime(n.timestamp)}</span>
                  </div>
                </div>

                {!n.read && (
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    marginTop: '8px'
                  }} />
                )}

              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
