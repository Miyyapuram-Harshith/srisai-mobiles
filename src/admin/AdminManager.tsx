import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, ToggleLeft, ToggleRight, Trash, Mail, UserCheck, ShieldAlert } from 'lucide-react';

export const AdminManager: React.FC = () => {
  const { admins, addAdminEmail, removeAdminEmail, toggleAdminState, currentUser } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Restrict access for non-superadmins in visual wrapper
  if (currentUser?.role !== 'super_admin') {
    return (
      <div className="glass-card" style={{ padding: '30px', textAlign: 'center' }}>
        <ShieldAlert size={48} style={{ color: 'var(--error)' }} />
        <h3 style={{ fontSize: '18px', margin: '16px 0 8px 0' }}>Access Denied</h3>
        <p style={{ color: 'var(--text-muted)' }}>Only Super Administrators can access admin account controls.</p>
      </div>
    );
  }

  const handleAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Please enter a valid Gmail address.');
      return;
    }

    if (!name.trim()) {
      setError('Please enter the name of the administrator.');
      return;
    }

    const added = addAdminEmail(cleanEmail, name.trim());
    if (added) {
      setSuccess(`Administrator account created successfully for ${cleanEmail}`);
      setEmail('');
      setName('');
    } else {
      setError('This Gmail is already registered as an administrator.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Manage Administrator Accounts</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Super Admin Console. Authorize, enable, or disable administrator accounts.</p>
      </div>

      {/* Grid: Creator and Table */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
        gap: '24px'
      }}>
        
        {/* Creator Form */}
        <div className="glass-card" style={{ padding: '24px', height: 'fit-content' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Plus size={18} style={{ color: 'var(--primary)' }} />
            <span>Add Administrator</span>
          </span>

          {error && (
            <div style={{
              backgroundColor: 'rgba(239,68,68,0.1)',
              color: 'var(--error)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{
              backgroundColor: 'rgba(16,185,129,0.1)',
              color: 'var(--success)',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600,
              marginBottom: '16px'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Gmail Address *
              </label>
              <input 
                type="email"
                placeholder="e.g. partner@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Admin Name *
              </label>
              <input 
                type="text"
                placeholder="e.g. Ramesh Kumar"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                required
              />
            </div>

            <button
              type="submit"
              className="premium-btn btn-primary"
              style={{ padding: '12px', borderRadius: '10px', fontSize: '13px', marginTop: '6px' }}
            >
              Add Authorized User
            </button>
          </form>
        </div>

        {/* Admins Table List */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <UserCheck size={18} style={{ color: 'var(--success)' }} />
            <span>Authorized Administrators</span>
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {admins.map(admin => {
              const isSelf = admin.email.toLowerCase() === currentUser.email.toLowerCase();
              return (
                <div 
                  key={admin.email}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: admin.enabled ? 'var(--bg-surface)' : 'rgba(239, 68, 68, 0.03)',
                    borderRadius: '12px',
                    opacity: admin.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                    <div style={{ color: 'var(--text-muted)' }}>
                      <Mail size={16} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <strong style={{ fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{admin.name}</strong>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {admin.email} • {admin.role.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Settings togglers */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {!isSelf && admin.email !== 'superadmin@srisaimobiles.com' ? (
                      <>
                        <button
                          onClick={() => toggleAdminState(admin.email)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: admin.enabled ? 'var(--success)' : 'var(--text-muted)' }}
                          title={admin.enabled ? 'Disable Admin' : 'Enable Admin'}
                        >
                          {admin.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                        
                        <button
                          onClick={() => removeAdminEmail(admin.email)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--error)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                          title="Delete Admin Account"
                        >
                          <Trash size={14} />
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: '11px', color: 'var(--success)', fontWeight: 'bold' }}>Protected</span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
