import { LoginHistoryEntry } from '../types';

interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
  timestamp: number;
}

// Memory cache for OTP rates and values (resets on reload, which is standard for mock backends)
const activeOTPs: Record<string, OTPRecord> = {};
const otpRequestsTracker: Record<string, number[]> = {}; // Map of email -> request timestamps

export const generateOTP = (email: string): { success: boolean; code?: string; message: string; retryInSeconds?: number } => {
  const now = Date.now();
  const minuteAgo = now - 60000;

  // Clean trackers
  if (!otpRequestsTracker[email]) {
    otpRequestsTracker[email] = [];
  }
  otpRequestsTracker[email] = otpRequestsTracker[email].filter(time => time > minuteAgo);

  // Rate Limiting: max 3 requests per minute
  if (otpRequestsTracker[email].length >= 3) {
    const oldestRequest = otpRequestsTracker[email][0];
    const waitTime = Math.ceil((oldestRequest + 60000 - now) / 1000);
    return {
      success: false,
      message: `Too many login attempts. Please wait ${waitTime} seconds before requesting a new OTP.`,
      retryInSeconds: waitTime
    };
  }

  // Generate 6-digit OTP code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = now + 5 * 60000; // 5 minutes validity

  activeOTPs[email] = {
    email,
    code,
    expiresAt,
    timestamp: now
  };

  otpRequestsTracker[email].push(now);

  console.log(`[SriSai OTP Service] Generated Code for ${email}: ${code}`);

  return {
    success: true,
    code,
    message: `OTP sent successfully to the registered mobile number linked to ${email}.`
  };
};

export const verifyOTP = (email: string, code: string): { success: boolean; message: string } => {
  const record = activeOTPs[email];
  const now = Date.now();

  if (!record) {
    return {
      success: false,
      message: 'No active OTP request found for this email. Please request a new code.'
    };
  }

  if (now > record.expiresAt) {
    delete activeOTPs[email];
    return {
      success: false,
      message: 'OTP has expired. Please request a new one.'
    };
  }

  if (record.code !== code) {
    return {
      success: false,
      message: 'Invalid OTP code. Please check and try again.'
    };
  }

  // Valid OTP
  delete activeOTPs[email]; // Consume code
  return {
    success: true,
    message: 'OTP verified successfully.'
  };
};

export const logLoginAttempt = (
  email: string, 
  role: string, 
  status: 'success' | 'failed_otp' | 'rate_limited',
  deviceInfo: string
): LoginHistoryEntry => {
  const historyStr = localStorage.getItem('srisai_login_history') || '[]';
  const historyList = JSON.parse(historyStr);

  const entry: LoginHistoryEntry = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    email,
    role,
    loginTime: new Date().toISOString(),
    deviceInfo,
    status
  };

  historyList.unshift(entry);
  localStorage.setItem('srisai_login_history', JSON.stringify(historyList.slice(0, 100))); // keep last 100 entries
  return entry;
};
