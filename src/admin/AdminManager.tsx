import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { AdminUser } from '../types';
import { Plus, ToggleLeft, ToggleRight, Trash, Mail, UserCheck, ShieldAlert, Save } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const AdminManager: React.FC = () => {
  const { admins, currentUser, showToast, registerUnsavedChanges, refetchAdmins } = useApp();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Buffer states
  const [localAdmins, setLocalAdmins] = useState<AdminUser[]>([]);
  const [deletedAdminEmails, setDeletedAdminEmails] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'unsaved' | 'saving' | 'saved' | 'error'>('idle');

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

  // Sync with context on load / save success
  useEffect(() => {
    if (saveStatus !== 'unsaved' && saveStatus !== 'saving') {
      setLocalAdmins(admins);
      setDeletedAdminEmails([]);
    }
  }, [admins, saveStatus]);

  // Check for unsaved changes
  useEffect(() => {
    const hasDiff = JSON.stringify(localAdmins) !== JSON.stringify(admins)
      || deletedAdminEmails.length > 0;
      
    if (hasDiff) {
      setSaveStatus('unsaved');
      registerUnsavedChanges('admins', true);
    } else {
      setSaveStatus('idle');
      registerUnsavedChanges('admins', false);
    }
  }, [localAdmins, deletedAdminEmails, admins]);

  // Unmount protection
  useEffect(() => {
    return () => {
      registerUnsavedChanges('admins', false);
    };
  }, []);

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

    if (localAdmins.some(a => a.email.toLowerCase() === cleanEmail)) {
      setError('This Gmail is already registered as an administrator.');
      return;
    }

    const newAdmin: AdminUser = {
      email: cleanEmail,
      name: name.trim(),
      role: 'manager',
      enabled: true,
      dateAdded: new Date().toISOString()
    };

    setLocalAdmins(prev => [...prev, newAdmin]);
    setSuccess(`Administrator account added locally for ${cleanEmail}`);
    setEmail('');
    setName('');
  };

  const handleToggleAdminState = (targetEmail: string) => {
    setLocalAdmins(prev => 
      prev.map(a => a.email.toLowerCase() === targetEmail.toLowerCase() ? { ...a, enabled: !a.enabled } : a)
    );
  };

  const handleRemoveAdmin = (targetEmail: string) => {
    if (window.confirm(`Are you sure you want to delete admin account ${targetEmail}?`)) {
      setLocalAdmins(prev => prev.filter(a => a.email.toLowerCase() !== targetEmail.toLowerCase()));
      if (admins.some(a => a.email.toLowerCase() === targetEmail.toLowerCase())) {
        setDeletedAdminEmails(prev => [...prev, targetEmail]);
      }
    }
  };

  const handleDiscard = () => {
    setLocalAdmins(admins);
    setDeletedAdminEmails([]);
    setSaveStatus('idle');
    registerUnsavedChanges('admins', false);
    showToast("Changes discarded", "info");
  };

  const handleSaveChanges = async () => {
    setSaveStatus('saving');
    setError(null);
    setSuccess(null);
    try {
      // 1. Delete removed admins from Supabase
      for (const email of deletedAdminEmails) {
        const { error } = await supabase.from('users').delete().eq('email', email);
        if (error) throw error;
      }
      
      // 2. Insert/Update local admins in Supabase
      for (const local of localAdmins) {
        const dbRole = local.enabled ? local.role : 'disabled_manager';
        
        const exists = admins.some(x => x.email.toLowerCase() === local.email.toLowerCase());
        if (!exists) {
          const { error } = await supabase.from('users').insert({
            email: local.email.toLowerCase(),
            name: local.name,
            role: dbRole,
            enabled: local.enabled
          });
          if (error) throw error;
        } else {
          const { error } = await supabase.from('users').update({
            name: local.name,
            role: dbRole,
            enabled: local.enabled
          }).eq('email', local.email.toLowerCase());
          if (error) throw error;
        }
      }
      
      await refetchAdmins();
      setSaveStatus('saved');
      registerUnsavedChanges('admins', false);
      showToast("Admins saved successfully!", "success");
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      console.error("Failed to save admins:", err);
      setSaveStatus('error');
      setError("Failed to save accounts: " + err.message);
      showToast("Failed to save admins: " + err.message, "error");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800 }}>Manage Administrator Accounts</h2>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Super Admin Console. Authorize, enable, or disable administrator accounts.</p>
      </div>

      {/* Floating Save Changes Bar */}
      {saveStatus !== 'idle' && (
        <div style={{
          position: 'sticky',
          top: '10px',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 24px',
          borderRadius: '16px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          border: '1px solid var(--border-color)',
          backdropFilter: 'blur(12px)',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: saveStatus === 'unsaved' ? '#f59e0b' : (saveStatus === 'saving' ? '#3b82f6' : (saveStatus === 'saved' ? '#10b981' : '#ef4444')),
              boxShadow: `0 0 10px ${saveStatus === 'unsaved' ? '#f59e0b' : (saveStatus === 'saving' ? '#3b82f6' : (saveStatus === 'saved' ? '#10b981' : '#ef4444'))}`
            }} />
            <span style={{ fontSize: '13px', fontWeight: 600 }}>
              {saveStatus === 'unsaved' && "You have unsaved changes"}
              {saveStatus === 'saving' && "Saving changes to Supabase..."}
              {saveStatus === 'saved' && "Changes saved successfully!"}
              {saveStatus === 'error' && "Failed to save changes. Please check RLS permissions."}
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              type="button"
              onClick={handleDiscard}
              className="premium-btn btn-secondary"
              style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '12px' }}
              disabled={saveStatus === 'saving'}
            >
              Discard Changes
            </button>
            <button 
              type="button"
              onClick={handleSaveChanges}
              className="premium-btn btn-primary"
              style={{ padding: '8px 20px', borderRadius: '10px', fontSize: '12px', minWidth: '120px' }}
              disabled={saveStatus !== 'unsaved'}
            >
              {saveStatus === 'saving' ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}

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
            {localAdmins.map(admin => {
              const isSelf = admin.email.toLowerCase() === currentUser?.email?.toLowerCase();
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
                          onClick={() => handleToggleAdminState(admin.email)}
                          style={{ border: 'none', background: 'none', cursor: 'pointer', color: admin.enabled ? 'var(--success)' : 'var(--text-muted)' }}
                          title={admin.enabled ? 'Disable Admin' : 'Enable Admin'}
                        >
                          {admin.enabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                        </button>
                        
                        <button
                          onClick={() => handleRemoveAdmin(admin.email)}
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
