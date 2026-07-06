import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Search, Trash2, Calendar, Clock, Terminal } from 'lucide-react';

export const AuditLogManager: React.FC = () => {
  const { auditLogs, clearAuditLogs, adminRole, currentUser } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [adminFilter, setAdminFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  // Extract unique admin names for filtering
  const uniqueAdmins = Array.from(new Set(auditLogs.map(log => log.adminName)));

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

  // Filter logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.adminName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAdmin = adminFilter === 'all' || log.adminName === adminFilter;
    const matchesDate = !dateFilter || log.date === new Date(dateFilter).toLocaleDateString('en-IN');
    return matchesSearch && matchesAdmin && matchesDate;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck size={22} style={{ color: 'var(--primary)' }} />
            <span>System Audit Activity Log</span>
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Real-time tracking of administrative workflows, product updates, price adjustments, and checkout actions.
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
              padding: '10px 18px', 
              borderRadius: '12px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: 'var(--error)',
              backgroundColor: 'rgba(239, 68, 68, 0.05)'
            }}
          >
            <Trash2 size={16} />
            <span>Clear Audit Feed</span>
          </button>
        )}
      </div>

      {/* Toolbar Filter Section */}
      <div className="glass-card" style={{ padding: '16px', borderRadius: '16px', display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
        {/* Search */}
        <div style={{ flex: 1.5, minWidth: '240px', position: 'relative' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search action keyword, admin email, IP..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '38px', height: '40px' }}
          />
        </div>

        {/* Admin Filter */}
        <div style={{ flex: 1, minWidth: '160px' }}>
          <select 
            value={adminFilter}
            onChange={(e) => setAdminFilter(e.target.value)}
            className="input-field"
            style={{ height: '40px', padding: '0 10px' }}
          >
            <option value="all">All Administrators</option>
            {uniqueAdmins.map(admin => (
              <option key={admin} value={admin}>{admin}</option>
            ))}
          </select>
        </div>

        {/* Date Filter */}
        <div style={{ width: '180px' }}>
          <input 
            type="date"
            className="input-field"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            style={{ height: '40px', padding: '0 10px' }}
          />
        </div>

        <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
          Found <strong>{filteredLogs.length}</strong> activity logs
        </div>
      </div>

      {/* Table grid layout */}
      {filteredLogs.length === 0 ? (
        <div className="glass-card" style={{ padding: '80px 20px', textAlign: 'center', borderRadius: '16px' }}>
          <Terminal size={48} strokeWidth={1} style={{ color: 'var(--text-muted)', marginBottom: '12px' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>No audit entries match the selected criteria.</p>
        </div>
      ) : (
        <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden', padding: 0 }}>
          
          {/* Desktop Table View */}
          <div className="desktop-only" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)' }}>
                  <th style={{ padding: '12px 16px', width: '160px' }}>Timestamp</th>
                  <th style={{ padding: '12px 16px', width: '200px' }}>Staff User</th>
                  <th style={{ padding: '12px 16px' }}>Action Logged</th>
                  <th style={{ padding: '12px 16px', width: '140px' }}>Device Host IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr 
                    key={log.id} 
                    style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Timestamp */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                          <Calendar size={12} style={{ color: 'var(--primary)' }} />
                          <span>{log.date}</span>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '11px' }}>
                          <Clock size={12} />
                          <span>{log.time}</span>
                        </span>
                      </div>
                    </td>

                    {/* Staff email/name */}
                    <td style={{ padding: '14px 16px' }}>
                      <strong style={{ color: 'var(--text-main)' }}>{log.adminName}</strong>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '14px 16px', lineHeight: 1.4, color: 'var(--text-main)' }}>
                      {log.action}
                    </td>

                    {/* IP Address */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ 
                        fontFamily: 'monospace', 
                        fontSize: '11px', 
                        backgroundColor: 'var(--bg-subtle)',
                        border: '1px solid var(--border-color)',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        color: 'var(--text-muted)'
                      }}>
                        {log.ipAddress}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile View */}
          <div className="mobile-only" style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '12px' }}>
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="glass-card"
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-solid)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  margin: 0
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '12px' }}>
                    <Calendar size={12} style={{ color: 'var(--primary)' }} />
                    <span>{log.date}</span>
                    <Clock size={12} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                  </div>
                  <span style={{ 
                    fontFamily: 'monospace', 
                    fontSize: '10px', 
                    backgroundColor: 'var(--bg-subtle)',
                    border: '1px solid var(--border-color)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    color: 'var(--text-muted)'
                  }}>
                    {log.ipAddress}
                  </span>
                </div>

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '8px', fontSize: '13px' }}>
                  <div>Staff: <strong style={{ color: 'var(--text-main)' }}>{log.adminName}</strong></div>
                  <div style={{ marginTop: '4px', lineHeight: 1.4, color: 'var(--text-muted)' }}>
                    {log.action}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
