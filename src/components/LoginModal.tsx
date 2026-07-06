import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { generateOTP, verifyOTP, logLoginAttempt } from '../utils/authService';
import { X, Mail, Key, ShieldCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { PermissionRole } from '../types';
import { supabase } from '../lib/supabase';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { admins, setCurrentUser, navigateTo, addNotification } = useApp();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<1 | 2>(1); // 1 = Email Input, 2 = OTP Input

  // Simulated OTP notification badge overlay
  const [sentOtpCode, setSentOtpCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  const countdownTimerRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen) {
      setEmail('');
      setOtp('');
      setStep(1);
      setSentOtpCode(null);
      setErrorMsg(null);
      setInfoMsg(null);
      setCountdown(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (countdown > 0) {
      countdownTimerRef.current = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (countdownTimerRef.current) clearTimeout(countdownTimerRef.current);
    };
  }, [countdown]);

  if (!isOpen) return null;

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const res = generateOTP(cleanEmail);
      setLoading(false);

      if (res.success && res.code) {
        setSentOtpCode(res.code);
        setStep(2);
        setInfoMsg(res.message);
        setCountdown(60); // 60s cooldown for requests
      } else {
        setErrorMsg(res.message);
        
        // Log rate-limited failure
        logLoginAttempt(cleanEmail, 'unknown', 'rate_limited', navigator.userAgent);

        // Notify superadmins
        addNotification(
          'failed_otp',
          `Rate limit hit on login request for ${cleanEmail}`,
          { email: cleanEmail }
        );

        if (res.retryInSeconds) {
          setCountdown(res.retryInSeconds);
        }
      }
    }, 800);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim().toLowerCase();
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setErrorMsg('OTP must be a 6-digit number.');
      return;
    }

    setLoading(true);

    // Simulate short latency for UX animation
    await new Promise(resolve => setTimeout(resolve, 800));

    const verifyRes = verifyOTP(cleanEmail, otp);
    setLoading(false);

    if (verifyRes.success) {
      // Resolve user role based on email in admin database / Supabase database
      const adminMatch = admins.find(a => a.email.toLowerCase() === cleanEmail);
      
      let role: PermissionRole = 'customer';
      let name = 'Customer';

      try {
        const { data: userRecord, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('email', cleanEmail)
          .single();

        if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

        if (userRecord) {
          role = userRecord.role as PermissionRole;
          name = role === 'customer' ? 'Customer' : (adminMatch ? adminMatch.name : 'Administrator');
        } else {
          // Register new customer in Supabase user table
          role = adminMatch ? adminMatch.role : 'customer';
          name = adminMatch ? adminMatch.name : 'Customer';
          const { error: insertError } = await supabase
            .from('users')
            .insert({ email: cleanEmail, role });
          if (insertError) throw insertError;
        }

        if (adminMatch && !adminMatch.enabled) {
          setErrorMsg('This administrator account has been disabled. Please contact support.');
          logLoginAttempt(cleanEmail, adminMatch.role, 'failed_otp', navigator.userAgent);
          return;
        }
      } catch (err) {
        console.error('Failed to resolve role or register user in Supabase:', err);
      }

      // Complete Session
      setCurrentUser({
        email: cleanEmail,
        role,
        name,
        mobileNumber: '+91 ******' + Math.floor(1000 + Math.random() * 9000), // simulated registered mobile
        loginTime: new Date().toISOString(),
        deviceInfo: navigator.userAgent
      });

      // Log successful login
      logLoginAttempt(cleanEmail, role, 'success', navigator.userAgent);

      onClose();

      // Redirect based on role
      if (role !== 'customer') {
        navigateTo('admin');
      } else {
        navigateTo('home');
      }
    } else {
      setErrorMsg(verifyRes.message);
      logLoginAttempt(cleanEmail, 'unknown', 'failed_otp', navigator.userAgent);
    }
  };

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
      padding: '20px'
    }} className="animate-fade">
      
      <div className="glass animate-slide" style={{
        width: 'min(100%, 420px)',
        maxWidth: '100%',
        borderRadius: '24px',
        border: '1px solid var(--border-color)',
        padding: '30px 24px',
        boxShadow: 'var(--glass-shadow)',
        position: 'relative'
      }}>
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            border: 'none',
            background: 'var(--bg-subtle)',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.12)',
            color: 'var(--primary)',
            marginBottom: '12px'
          }}>
            {step === 1 ? <Mail size={24} /> : <Key size={24} />}
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 800 }}>
            {step === 1 ? 'Welcome to Sri Sai Mobiles' : 'Enter OTP Code'}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {step === 1 
              ? 'Access your customer dashboard or admin panels.' 
              : `A 6-digit OTP code has been simulated for ${email}`
            }
          </p>
        </div>

        {/* Form alerts */}
        {errorMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: 'var(--error)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <ShieldAlert size={14} />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            color: 'var(--success)',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '16px'
          }}>
            <ShieldCheck size={14} />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* Step 1: Email Form */}
        {step === 1 ? (
          <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Gmail Address
              </label>
              <input
                type="email"
                placeholder="e.g. customer@gmail.com or admin@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="premium-btn btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '14px' }}
              disabled={loading}
            >
              {loading ? 'Requesting OTP...' : 'Send OTP'}
            </button>

            {/* Hint Box for testing convenience */}
            <div style={{
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-color)',
              padding: '10px 14px',
              borderRadius: '12px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <strong>Quick Test Profiles:</strong>
              <ul style={{ paddingLeft: '16px', marginTop: '4px' }}>
                <li>Admin: <code>admin@gmail.com</code></li>
                <li>Customer: <code>customer@gmail.com</code></li>
                <li>Super Admin: <code>superadmin@srisaimobiles.com</code></li>
              </ul>
            </div>

          </form>
        ) : (
          /* Step 2: OTP Verification Form */
          <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Mock OTP Preview helper */}
            {sentOtpCode && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px dashed var(--primary)',
                color: 'var(--primary)',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 600
              }} className="animate-pulse-slow">
                <Sparkles size={14} />
                <span>Simulated SMS Code: <strong>{sentOtpCode}</strong></span>
              </div>
            )}

            <div>
              <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Enter 6-Digit OTP
              </label>
              <input
                type="text"
                placeholder="Check Sms Code above"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="input-field"
                maxLength={6}
                required
                disabled={loading}
                style={{ textAlign: 'center', fontSize: '18px', letterSpacing: '0.3em', fontWeight: 'bold' }}
              />
            </div>

            <button
              type="submit"
              className="premium-btn btn-primary"
              style={{ padding: '12px', borderRadius: '12px', fontSize: '14px' }}
              disabled={loading}
            >
              {loading ? 'Verifying OTP...' : 'Verify & Login'}
            </button>

            {/* Resend Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)', textDecoration: 'underline' }}
              >
                Change Gmail
              </button>
              
              {countdown > 0 ? (
                <span style={{ color: 'var(--text-muted)' }}>Resend in {countdown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOTP}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600 }}
                >
                  Resend OTP
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
