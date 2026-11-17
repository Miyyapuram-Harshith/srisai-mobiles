import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldCheck, Search, Trash2, Calendar, Clock, Terminal, 
  Users, UserCheck, Activity, Eye, Filter, ArrowRight
} from 'lucide-react';

const categorizeAction = (action: string): { label: string; color: string; bg: string; icon: string } => {
  const lower = action.toLowerCase();
  if (lower.includes('order') || lower.includes('status') || lower.includes('refund') || lower.includes('placed')) {
    return { label: 'Order Processing', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', icon: '📦' };
  }
  if (lower.includes('price') || lower.includes('catalog') || lower.includes('device') || lower.includes('accessory') || lower.includes('smartphone')) {
    return { label: 'Catalog & Pricing', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', icon: '🏷️' };
  }
  if (lower.includes('flash') || lower.includes('sale') || lower.includes('banner')) {
    return { label: 'Marketing & Deals', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', icon: '🔥' };
  }
  if (lower.includes('admin') || lower.includes('account') || lower.includes('role') || lower.includes('appointed')) {
    return { label: 'Staff Privileges', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', icon: '🛡️' };
  }
  if (lower.includes('instagram') || lower.includes('whatsapp') || lower.includes('settings')) {
    return { label: 'Storefront Settings', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', icon: '⚙️' };
  }
  return { label: 'Operational Change', color: 'var(--text-muted)', bg: 'var(--bg-subtle)', icon: '📝' };
};

export const AuditLogManager: React.FC = () => {
  const { auditLogs, clearAuditLogs, adminRole, admins } = useApp();
  const [activeView, setActiveView] = useState<'employee_tracking' | 'system_audit'>('employee_tracking');
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Extract unique staff members
  const uniqueAdmins = Array.from(new Set(auditLogs.map(log => log.adminName)));

  // Separate non-superadmin employee actions
  const employeeLogs = auditLogs.filter(log => {
    const isSuper = log.adminName.toLowerCase().includes('super admin') || log.adminName.toLowerCase().includes('system');
    return !isSuper;
  });

  const handleClearLogs = () => {
    if (adminRole !== 'super_admin') {
      alert('Permission Denied: Only Super Admins can clear the system audit log feed.');
      return;
    }

    if (window.confirm('WARNING: Are you sure you want to permanently clear the system audit logs? This action is irreversible.')) {
      clearAuditLogs();
      alert('System audit logs cleared successfully.');
    }
  };

  // Base list depending on active tab
  const baseList = activeView === 'employee_tracking' ? (adminFilter === 'all' ? employeeLogs : auditLogs) : auditLogs;

  // Filter logs
  const filteredLogs = baseList.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdmin = adminFilter === 'all' || log.adminName === adminFilter;
    const matchesDate = !dateFilter || log.date === new Date(dateFilter).toLocaleDateString('en-IN');
    
    let matchesCategory = true;
    if (categoryFilter !== 'all') {
      const cat = categorizeAction(log.action).label;
      matchesCategory = cat.toLowerCase().includes(categoryFilter.toLowerCase());
    }

    return matchesSearch && matchesAdmin && matchesDate && matchesCategory;
  });

  // Calculate employee stats
  const employeeStats = uniqueAdmins.map(adminName => {
    const staffLogs = auditLogs.filter(l => l.adminName === adminName);
    const lastActive = staffLogs[0] ? `${staffLogs[0].date} @ ${staffLogs[0].time}` : 'N/A';
    const matchingAdminObj = admins.find(a => a.name.toLowerCase() === adminName.toLowerCase() || a.email.toLowerCase() === adminName.toLowerCase());
    const role = matchingAdminObj ? matchingAdminObj.role : (adminName.toLowerCase().includes('super') ? 'super_admin' : 'staff');

    return {
      name: adminName,
      email: matchingAdminObj?.email || '',
      role,
      actionCount: staffLogs.length,
      lastActive
    };
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={22} style={{ color: 'var(--primary)' }} />
            <span>Employee Changes & Audit Tracking</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
            Super Admin Security Console: Monitor all changes performed by employees, catalog edits, and order updates.
          </p>
        </div>
        
        {adminRole === 'super_admin' && auditLogs.length > 0 && (
          <button 
            onClick={handleClearLogs}
            className="premium-btn btn-secondary"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '6px', 
              padding: '8px 16px', 
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              fontSize: '12px'
            }}
          >
            <Trash2 size={14} />
            <span>Clear Audit Feed</span>
          </button>
        )}
      </div>

      {/* Primary Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '12px',
        borderBottom: '1px solid var(--border-color)',
        paddingBottom: '12px'
      }}>
        <button
          onClick={() => { setActiveView('employee_tracking'); setAdminFilter('all'); }}
          className={`premium-btn ${activeView === 'employee_tracking' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Users size={16} />
          <span>Employee Activity Tracker ({employeeLogs.length} Changes)</span>
        </button>

        <button
          onClick={() => setActiveView('system_audit')}
          className={`premium-btn ${activeView === 'system_audit' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '8px 18px', borderRadius: '12px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <ShieldCheck size={16} />
          <span>Full Master Audit Feed ({auditLogs.length})</span>
        </button>
      </div>

      {/* Employee Quick Selector Cards */}
      {activeView === 'employee_tracking' && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px'
        }}>
          {employeeStats.map(emp => (
            <div
              key={emp.name}
              onClick={() => setAdminFilter(adminFilter === emp.name ? 'all' : emp.name)}
              className="glass-card"
              style={{
                padding: '14px 18px',
                borderRadius: '14px',
                cursor: 'pointer',
                border: adminFilter === emp.name ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                backgroundColor: adminFilter === emp.name ? 'rgba(59, 130, 246, 0.08)' : 'var(--card-bg)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>{emp.name}</span>
                <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', fontWeight: 700 }}>
                  {emp.role.replace(/_/g, ' ')}
                </span>
              </div>
              {emp.email && <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{emp.email}</div>}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '11px' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 700 }}>{emp.actionCount} Actions</span>
                <span style={{ color: 'var(--text-muted)' }}>Last: {emp.lastActive}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Toolbar Filter Section */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1.5, minWidth: '220px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search action keyword, employee, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>

        {/* Staff Filter */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <select 
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="input-field"
            style={{ height: '40px', padding: '0 10px', fontSize: '12px' }}
          >
            <option value="all">All Team Members</option>
            {uniqueAdmins.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field"
            style={{ height: '40px', padding: '0 10px', fontSize: '12px' }}
          >
            <option value="all">All Action Categories</option>
            <option value="Order Processing">Order Processing</option>
            <option value="Catalog & Pricing">Catalog & Pricing</option>
            <option value="Marketing & Deals">Marketing & Deals</option>
            <option value="Staff Privileges">Staff Privileges</option>
            <option value="Storefront Settings">Storefront Settings</option>
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ width: '150px' }}>
          <input 
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ height: '40px', padding: '0 10px', fontSize: '12px' }}
          />
        </div>
      </div>

      {/* Logs Feed: Cards / Table */}
      {filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <Terminal size={42} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: '10px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>No employee activity logs match the selected filter.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          
          {/* Desktop Table View */}
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '12px 16px', width: '160px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', width: '180px' }}>Staff Member</th>
                  <th style={{ padding: '12px 16px', width: '180px' }}>Category</th>
                  <th style={{ padding: '12px 16px' }}>Action & Minimal Change Description</th>
                  <th style={{ padding: '12px 16px', width: '140px' }}>Origin IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => {
                  const cat = categorizeAction(log.action);
                  return (
                    <tr 
                      key={log.id} 
                      style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Timestamp */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          <span style={{ fontWeight: 'bold' }}>{log.date}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{log.time}</span>
                        </div>
                      </td>

                      {/* Staff Member */}
                      <td style={{ padding: '14px 16px' }}>
                        <strong style={{ color: 'var(--text-main)' }}>{log.adminName}</strong>
                      </td>

                      {/* Category Pill */}
                      <td style={{ padding: '14px 16px' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 8px',
                          borderRadius: '12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          backgroundColor: cat.bg,
                          color: cat.color
                        }}>
                          <span>{cat.icon}</span>
                          <span>{cat.label}</span>
                        </span>
                      </td>

                      {/* Action & Minimal Changes */}
                      <td style={{ padding: '14px 16px', lineHeight: 1.4, color: 'var(--text-main)' }}>
                        <span style={{ fontWeight: 600 }}>{log.action}</span>
                      </td>

                      {/* IP */}
                      <td style={{ padding: '14px 16px' }}>
                        <code style={{ 
                          fontSize: '11px', 
                          backgroundColor: 'var(--bg-subtle)',
                          border: '1px solid var(--border-color)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          color: 'var(--text-muted)'
                        }}>
                          {log.ipAddress}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px' }}>
            {filteredLogs.map((log) => {
              const cat = categorizeAction(log.action);
              return (
                <div 
                  key={log.id} 
                  className="glass-card"
                  style={{
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    margin: 0
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 700,
                      backgroundColor: cat.bg,
                      color: cat.color
                    }}>
                      {cat.icon} {cat.label}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {log.date} @ {log.time}
                    </span>
                  </div>

                  <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', lineHeight: 1.4 }}>
                    {log.action}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px' }}>
                    <span>By: <strong style={{ color: 'var(--text-main)' }}>{log.adminName}</strong></span>
                    <code>{log.ipAddress}</code>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
