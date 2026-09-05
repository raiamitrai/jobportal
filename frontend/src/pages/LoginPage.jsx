import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User, Building, Lock, Mail, Eye, EyeOff,
  CheckCircle2, AlertCircle, Smartphone, RefreshCw,
  KeyRound, ShieldCheck, ArrowLeft, Users, ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getSettings } from '../utils/settingsManager';
import careonixLogo from '../assets/careonix-logo-transparent.png';

const GOOGLE_CLIENT_ID = '2829663012-gi9u6ejtn5n4ftb26l3ain40qsucv6t1.apps.googleusercontent.com';

function decodeGoogleJwt(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export default function LoginPage({ onBack, defaultIsRegister = false }) {
  const navigate = useNavigate();
  const {
    login,
    findUserByEmail,
    registerUser,
    registeredUsers,
    saveRegisteredUsers,
    updatePassword,
  } = useAuth();

  const [userAccountType, setUserAccountType] = useState('candidate');
  const [isRegister, setIsRegister] = useState(defaultIsRegister);

  useEffect(() => {
    setIsRegister(defaultIsRegister);
  }, [defaultIsRegister]);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration OTP states
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [timer, setTimer] = useState(120);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpError, setOtpError] = useState('');
  const [otpNotice, setOtpNotice] = useState('');

  // General UI states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // ── FORGOT PASSWORD ─────────────────────────────────────────
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotOtpDigits, setForgotOtpDigits] = useState(['', '', '', '', '', '']);
  const [forgotOtpSent, setForgotOtpSent] = useState('');
  const [forgotTimer, setForgotTimer] = useState(120);
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccess, setForgotSuccess] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  // Social & OAuth SSO states
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);
  const [linkedinLoading, setLinkedinLoading] = useState(false);
  const googleDivRef = useRef(null);
  const googleInitDoneRef = useRef(false);

  // ── GitHub OAuth Interactive Modal States ────────────────
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [githubUsername, setGithubUsername]   = useState('');
  const [githubFullName, setGithubFullName]   = useState('');
  const [githubEmail, setGithubEmail]         = useState('');
  const [ghProfile, setGhProfile]             = useState(null);
  const [ghError, setGhError]                 = useState('');
  const [ghChecking, setGhChecking]           = useState(false);

  // ── LinkedIn OAuth Interactive Modal States ──────────────
  const [showLinkedinModal, setShowLinkedinModal] = useState(false);
  const [linkedinName, setLinkedinName]           = useState('');
  const [linkedinEmail, setLinkedinEmail]         = useState('');
  const [linkedinHeadline, setLinkedinHeadline]   = useState('');

  useEffect(() => {
    document.title = 'Sign In | Careonix Portal';
  }, []);

  // ── Registration OTP timer ─────────────────────────────────
  useEffect(() => {
    let interval = null;
    if (showOtpModal && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showOtpModal, timer]);

  // ── Forgot password OTP timer ──────────────────────────────
  useEffect(() => {
    let interval = null;
    if (showForgotModal && forgotStep === 'otp' && forgotTimer > 0) {
      interval = setInterval(() => setForgotTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [showForgotModal, forgotStep, forgotTimer]);

  // ── Google Identity Services init ─────────────────────────
  // Eagerly initialize as soon as the script is ready (poll until available)
  const googleTokenClientRef = useRef(null);
  useEffect(() => {
    let attempts = 0;
    const MAX_ATTEMPTS = 40; // 4 seconds max
    const tryInit = () => {
      if (!GOOGLE_CLIENT_ID) return;
      if (window.google?.accounts?.oauth2 && !googleTokenClientRef.current) {
        try {
          googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: 'email profile openid',
            callback: handleGoogleTokenResponse,
          });
        } catch (e) {}
      }
      // Also init One-Tap (fallback) if available
      if (window.google?.accounts?.id && !googleInitDoneRef.current) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
          });
          googleInitDoneRef.current = true;
        } catch (e) {}
      }
      if (!googleTokenClientRef.current && attempts < MAX_ATTEMPTS) {
        attempts++;
        setTimeout(tryInit, 100);
      }
    };
    tryInit();
  }, []);

  // Handle implicit grant token (oauth2.initTokenClient response)
  const handleGoogleTokenResponse = async (tokenResponse) => {
    setGoogleLoading(true);
    setError('');
    try {
      if (tokenResponse.error) {
        setError('Google sign-in cancelled or failed.');
        setGoogleLoading(false);
        return;
      }
      // Fetch user info using the access token
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
      });
      if (!res.ok) {
        setError('Google sign-in failed. Could not fetch profile.');
        setGoogleLoading(false);
        return;
      }
      const payload = await res.json();
      if (!payload.email) {
        setError('Google sign-in failed. Could not read account info.');
        setGoogleLoading(false);
        return;
      }
      // Reuse same logic as handleGoogleCredential
      const fakeResponse = {
        credential: btoa(JSON.stringify({ alg: 'RS256' })) + '.' + btoa(JSON.stringify(payload)) + '.sig'
      };
      // Directly process payload inline (avoid double fetch)
      processGooglePayload(payload);
    } catch (e) {
      setError('Google sign-in error: ' + e.message);
    }
    setGoogleLoading(false);
  };

  const sendOtp = async (recipient, setOtpState, setNotice, setErr) => {
    setErr('');
    setNotice(`Sending 6-digit OTP to ${recipient}...`);
    try {
      const res = await fetch('http://localhost:8086/notifications/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipient, type: 'EMAIL' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.otpCode) {
          setOtpState(data.otpCode);
          setNotice(`✅ OTP sent to ${recipient}! Check your inbox.`);
          return data.otpCode;
        }
      }
      setErr('Failed to send OTP. Please check the notification service (port 8086).');
    } catch {
      setErr('Could not reach notification service. Is it running on port 8086?');
    }
    return null;
  };

  const ADMIN_EMAILS = ['admin@careonix.com', 'raiamitrai1001@gmail.com'];
  const isAdminEmail = (e) => ADMIN_EMAILS.includes((e || '').toLowerCase().trim());

  // Process Google user payload (shared between token and credential flows)
  const processGooglePayload = (payload) => {
    try {
      const gEmail = (payload.email || '').toLowerCase().trim();
      const gName = payload.name || (payload.given_name ? `${payload.given_name} ${payload.family_name || ''}`.trim() : gEmail.split('@')[0]);
      const gPhoto = payload.picture || null;

      if (isAdminEmail(gEmail)) {
        login({ email: gEmail, name: 'Admin (Rai Amit Rai)', role: 'admin', accountType: 'admin', photoUrl: gPhoto });
        return;
      }

      const existingUser = findUserByEmail(gEmail);
      if (existingUser) {
        const resolvedAccountType = existingUser.accountType || (existingUser.company ? 'recruiter' : 'candidate');
        const resolvedRole = existingUser.role || (resolvedAccountType === 'recruiter' ? 'client' : 'candidate');
        login({ ...existingUser, photoUrl: gPhoto || existingUser.photoUrl, accountType: resolvedAccountType, role: resolvedRole });
      } else {
        const newUser = {
          email: gEmail, name: gName, photoUrl: gPhoto,
          company: userAccountType === 'recruiter' ? (companyName || null) : null,
          role: 'client', accountType: userAccountType,
          oauthProvider: 'google', password: '',
          approvalStatus: userAccountType === 'recruiter' ? 'PENDING_APPROVAL' : 'APPROVED',
        };
        const registered = registerUser(newUser, '');
        login({ ...registered, photoUrl: gPhoto });
      }
    } catch (e) {
      setError('Google sign-in error: ' + e.message);
    }
    setGoogleLoading(false);
  };

  const handleGoogleCredential = (response) => {
    setGoogleLoading(true);
    setError('');
    try {
      const payload = decodeGoogleJwt(response.credential);
      if (!payload || !payload.email) {
        setError('Google sign-in failed. Could not read account info.');
        setGoogleLoading(false);
        return;
      }
      processGooglePayload(payload);
    } catch (e) {
      setError('Google sign-in error: ' + e.message);
      setGoogleLoading(false);
    }
  };

  const triggerGoogleSignIn = () => {
    if (!GOOGLE_CLIENT_ID) {
      setError('⚙️ Google Sign-In is not yet configured.');
      return;
    }
    if (!window.google) {
      setError('Google Sign-In script not loaded. Please refresh the page.');
      return;
    }
    setError('');
    setGoogleLoading(true);
    try {
      // Prefer instant OAuth2 token popup (no One-Tap delay)
      if (googleTokenClientRef.current) {
        googleTokenClientRef.current.requestAccessToken({ prompt: 'select_account' });
        return;
      }
      // Fallback: One-Tap prompt
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleLoading(false);
          // If One-Tap also failed, try re-initialising token client
          if (window.google?.accounts?.oauth2) {
            const client = window.google.accounts.oauth2.initTokenClient({
              client_id: GOOGLE_CLIENT_ID,
              scope: 'email profile openid',
              callback: handleGoogleTokenResponse,
            });
            client.requestAccessToken({ prompt: 'select_account' });
          }
        }
      });
    } catch (e) {
      setError('Google sign-in failed: ' + e.message);
      setGoogleLoading(false);
    }
  };

  const triggerGithubSignIn = () => {
    setGithubLoading(true);
    setError('');
    sessionStorage.setItem('careonix_oauth_role', userAccountType);

    const integrations = getSettings()?.integrations || {};
    const clientId = (integrations.githubClientId || 'Ov23li7BdZOdL1WhHgNg').trim();

    // Redirect to GitHub OAuth — redirect_uri must exactly match what's registered in GitHub OAuth App settings
    // We send window.location.origin dynamically so it works on any port (3000, 5173, or production domain)
    const callbackUrl = `${window.location.origin}/auth/callback/github`;
    window.location.href = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(callbackUrl)}&scope=user:email&allow_signup=true`;
  };

  const triggerLinkedinSignIn = () => {
    setLinkedinLoading(true);
    setError('');
    sessionStorage.setItem('careonix_oauth_role', userAccountType);

    const integrations = getSettings()?.integrations || {};
    const clientId = (integrations.linkedInClientId || '').trim();

    // 1. If real LinkedIn Client ID is configured in Admin Settings -> Integrations
    if (clientId && clientId.length > 3) {
      const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback/linkedin`);
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${encodeURIComponent(clientId)}&redirect_uri=${redirectUri}&scope=r_liteprofile%20r_emailaddress`;
      return;
    }

    // 2. Direct notice for real OAuth configuration
    setError('⚙️ Real LinkedIn OAuth requires a LinkedIn Client ID. Please go to Admin Settings ➔ Integrations ➔ LinkedIn OAuth and enter your Client ID.');
  };

  const validatePasswordPolicy = (pass) => {
    const sec = getSettings()?.security || {};
    const minLen = parseInt(sec.minPasswordLength || '6', 10) || 6;
    if (!pass || pass.length < minLen) {
      return `Password must be at least ${minLen} characters long.`;
    }
    if (sec.requireUppercase && !/[A-Z]/.test(pass)) {
      return 'Password must contain at least one uppercase letter (A-Z).';
    }
    if (sec.requireNumber && !/[0-9]/.test(pass)) {
      return 'Password must contain at least one numerical digit (0-9).';
    }
    if (sec.requireSymbol && !/[!@#$%^&*(),.?":{}|<>]/.test(pass)) {
      return 'Password must contain at least one special symbol (!@#$).';
    }
    return null;
  };

  const FIXED_ADMIN = { email: 'admin@careonix.com', password: 'admin@123' };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    try { sessionStorage.removeItem('careonix_view_override'); } catch {}

    const emailLower = email.toLowerCase().trim();
    const inputPass = password.trim();

    if (!emailLower) { setError('Please enter your email address.'); return; }
    if (!inputPass)  { setError('Please enter your password.'); return; }

    // ── Security Check: Brute-Force Lockout Prevention ──
    const sec = getSettings()?.security || {};
    const maxAttempts = parseInt(sec.maxFailedAttempts || '3', 10) || 3;
    const lockoutMinutes = parseInt(sec.lockoutDuration || '15', 10) || 15;
    const lockoutKey = `careonix_lockout_${emailLower}`;
    const attemptsKey = `careonix_attempts_${emailLower}`;

    const lockTime = localStorage.getItem(lockoutKey);
    if (lockTime) {
      const remainingMs = parseInt(lockTime, 10) - Date.now();
      if (remainingMs > 0) {
        const remMins = Math.ceil(remainingMs / (60 * 1000));
        setError(`🚨 Account temporarily locked due to ${maxAttempts} consecutive failed login attempts. Try again in ${remMins} minute(s).`);
        return;
      } else {
        localStorage.removeItem(lockoutKey);
        localStorage.removeItem(attemptsKey);
      }
    }

    if (isAdminEmail(emailLower)) {
      if (inputPass === FIXED_ADMIN.password || inputPass === 'admin@123') {
        localStorage.removeItem(attemptsKey);
        localStorage.removeItem(lockoutKey);
        login({ email: emailLower, name: 'Admin (Rai Amit Rai)', role: 'admin', accountType: 'admin' });
        return;
      }
      const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10) + 1;
      if (currentAttempts >= maxAttempts) {
        localStorage.setItem(lockoutKey, String(Date.now() + lockoutMinutes * 60 * 1000));
        localStorage.removeItem(attemptsKey);
        setError(`🚨 Admin account locked for ${lockoutMinutes} minutes due to ${maxAttempts} failed login attempts.`);
      } else {
        localStorage.setItem(attemptsKey, String(currentAttempts));
        setError(`❌ Incorrect admin password. (${currentAttempts}/${maxAttempts} attempts before temporary lockout).`);
      }
      return;
    }

    let deletedList = [];
    try {
      const delSaved = localStorage.getItem('careonix_deleted_users');
      if (delSaved) deletedList = JSON.parse(delSaved);
    } catch {}

    if (deletedList.includes(emailLower)) {
      setError('❌ No account found with this email. Click "Create Account" below to sign up.');
      return;
    }

    let allUsers = [];
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      allUsers = saved ? JSON.parse(saved) : [];
    } catch {}
    allUsers = allUsers.filter(u => {
      const e = (u.email || u.identifier || '').toLowerCase().trim();
      return e && !deletedList.includes(e);
    });

    let existingUser = allUsers.find(u =>
      (u.email || u.identifier || '').toLowerCase().trim() === emailLower
    );

    if (!existingUser && !deletedList.includes(emailLower)) {
      try {
        const res = await fetch(`http://localhost:8082/profiles/email?email=${encodeURIComponent(emailLower)}`);
        if (res.ok) {
          const matched = await res.json();
          if (matched && !deletedList.includes(emailLower)) {
            const isRec = Boolean(matched.companyName);
            existingUser = {
              identifier: emailLower, email: emailLower,
              password: matched.password,
              name: matched.fullName || emailLower.split('@')[0],
              company: matched.companyName || null,
              role: 'client', accountType: isRec ? 'recruiter' : 'candidate',
              approvalStatus: matched.approvalStatus || 'APPROVED',
            };
            saveRegisteredUsers([...allUsers, existingUser]);
          }
        }
      } catch {}
    }

    if (existingUser) {
      const registeredType = existingUser.accountType || (existingUser.company ? 'recruiter' : 'candidate');
      const savedPass = (existingUser.password || '').trim();
      if (!savedPass && existingUser.oauthProvider === 'google') {
        setError('⚠️ This account was created with Google Sign-In. Please use "Sign in with Google".');
        return;
      }
      if (savedPass && inputPass !== savedPass) {
        const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || '0', 10) + 1;
        if (currentAttempts >= maxAttempts) {
          localStorage.setItem(lockoutKey, String(Date.now() + lockoutMinutes * 60 * 1000));
          localStorage.removeItem(attemptsKey);
          setError(`🚨 Account temporarily locked for ${lockoutMinutes} minutes due to ${maxAttempts} consecutive failed login attempts.`);
        } else {
          localStorage.setItem(attemptsKey, String(currentAttempts));
          setError(`❌ Incorrect password. (${currentAttempts}/${maxAttempts} attempts before temporary lockout).`);
        }
        return;
      }
      if (userAccountType !== registeredType) {
        setError(
          registeredType === 'recruiter'
            ? '❌ This email belongs to a Recruiter account. Switch to the Recruiter tab.'
            : '❌ This email belongs to a Candidate account. Switch to the Candidate tab.'
        );
        return;
      }
      localStorage.removeItem(attemptsKey);
      localStorage.removeItem(lockoutKey);
      login({ ...existingUser, accountType: registeredType });
      return;
    }

    setError('❌ No account found with this email. Click "Create Account" below.');
  };

  // ── Deep Multi-Source Check if Email Already Exists ─────────
  const checkEmailAlreadyExists = async (targetEmail) => {
    const clean = (targetEmail || '').toLowerCase().trim();
    if (!clean) return null;

    // 1. Admin Email Check
    if (isAdminEmail(clean)) {
      return { exists: true, role: 'Admin', name: 'Admin', email: clean };
    }

    // 2. AuthContext findUserByEmail check
    if (typeof findUserByEmail === 'function') {
      const u = findUserByEmail(clean);
      if (u) return { exists: true, role: u.accountType || u.role || 'Candidate', ...u };
    }

    // 3. React state registeredUsers array
    if (Array.isArray(registeredUsers)) {
      const u = registeredUsers.find(x => (x.email || x.identifier || '').toLowerCase().trim() === clean);
      if (u) return { exists: true, role: u.accountType || u.role || 'Candidate', ...u };
    }

    // 4. LocalStorage careonix_registered_users
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      if (saved) {
        const list = JSON.parse(saved);
        if (Array.isArray(list)) {
          const u = list.find(x => (x.email || x.identifier || '').toLowerCase().trim() === clean);
          if (u) return { exists: true, role: u.accountType || u.role || 'Candidate', ...u };
        }
      }
    } catch {}

    // 5. Currently active user in session/localStorage
    try {
      const sessionUser = sessionStorage.getItem('careonix_user') || localStorage.getItem('careonix_user');
      if (sessionUser) {
        const u = JSON.parse(sessionUser);
        if ((u.email || u.identifier || '').toLowerCase().trim() === clean) {
          return { exists: true, role: u.accountType || u.role || 'Candidate', ...u };
        }
      }
    } catch {}

    // 6. Check careonix_user_profile
    try {
      const prof = localStorage.getItem('careonix_user_profile');
      if (prof) {
        const u = JSON.parse(prof);
        if ((u.email || '').toLowerCase().trim() === clean) {
          return { exists: true, role: 'Candidate', ...u };
        }
      }
    } catch {}

    // 7. Check backend MySQL profile-service directly (port 8082)
    try {
      const res = await fetch(`http://localhost:8082/profiles/email?email=${encodeURIComponent(clean)}`, {
        signal: typeof AbortSignal !== 'undefined' && AbortSignal.timeout ? AbortSignal.timeout(2000) : undefined
      }).catch(() => null);

      if (res && res.ok) {
        const dbUser = await res.json();
        if (dbUser && dbUser.email && dbUser.email.toLowerCase().trim() === clean) {
          const isRec = (dbUser.role || '').toLowerCase().includes('recruiter') || Boolean(dbUser.companyName);
          return {
            exists: true,
            role: isRec ? 'Recruiter' : 'Candidate',
            name: dbUser.fullName || clean.split('@')[0],
            email: clean,
            company: dbUser.companyName || null
          };
        }
      }
    } catch {}

    return null;
  };

  const sendRealOtp = async () => {
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    setGeneratedOtp(null);
    setTimer(120);
    return await sendOtp(email, setGeneratedOtp, setOtpNotice, setOtpError);
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccessMsg('');
    const emailLower = (email || '').toLowerCase().trim();

    const passPolicyErr = validatePasswordPolicy(password);
    if (passPolicyErr) { setError(passPolicyErr); return; }
    if (userAccountType === 'recruiter' && !companyName.trim()) {
      setError('Please enter your Company / Organization Name.'); return;
    }

    setLoading(true);

    // 🛑 STRICT VERIFICATION: Check if email is already registered before sending any OTP!
    const existing = await checkEmailAlreadyExists(emailLower);
    if (existing) {
      setLoading(false);
      const roleName = (existing.role || 'user').toLowerCase() === 'recruiter' ? 'Recruiter' : 'Candidate';
      setError(`⚠️ This email "${emailLower}" is already registered (${roleName} account)! Please switch to Sign In to log into your account.`);
      return;
    }

    setSuccessMsg(`Sending 6-digit OTP to ${email}...`);
    const otp = await sendRealOtp();
    setLoading(false);
    if (!otp) { setSuccessMsg(''); setError('Could not send OTP. Is the notification service running?'); return; }
    setShowOtpModal(true);
  };

  const handleOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otpDigits];
    updated[index] = value;
    setOtpDigits(updated);
    if (value && index < 5) {
      document.getElementById(`rotp-${index + 1}`)?.focus();
    }
  };

  const handleVerifyOtp = () => {
    const entered = otpDigits.join('');
    if (entered.length < 6) { setOtpError('Please enter the full 6-digit code.'); return; }
    if (!generatedOtp) { setOtpError('No OTP found. Click "Resend" below.'); return; }
    if (entered !== generatedOtp) { setOtpError('Invalid OTP code. Please try again.'); return; }

    setLoading(true);
    registerUser({
      email: email.toLowerCase().trim(), name: fullName || email.split('@')[0],
      company: userAccountType === 'recruiter' ? companyName : null,
      role: 'client', accountType: userAccountType,
    }, password);
    setSuccessMsg('✅ Account created! Please sign in with your email & password.');
    setTimeout(() => {
      setShowOtpModal(false); setLoading(false); setIsRegister(false);
      setOtpDigits(['', '', '', '', '', '']); setGeneratedOtp(null);
      setFullName(''); setCompanyName(''); setPassword('');
    }, 1500);
  };

  const openForgotModal = () => {
    setForgotEmail(''); setForgotError(''); setForgotSuccess('');
    setForgotOtpDigits(['', '', '', '', '', '']); setForgotOtpSent('');
    setForgotStep('email'); setNewPassword(''); setConfirmPassword('');
    setShowForgotModal(true);
  };

  const handleForgotSendOtp = async () => {
    setForgotError(''); setForgotSuccess('');
    const emailLower = forgotEmail.toLowerCase().trim();
    if (!emailLower.includes('@')) { setForgotError('Please enter a valid email address.'); return; }

    let found = null;
    try {
      const saved = localStorage.getItem('careonix_registered_users');
      const list = saved ? JSON.parse(saved) : [];
      found = list.find(u => (u.email || u.identifier || '').toLowerCase().trim() === emailLower);
    } catch {}
    if (!found && Array.isArray(registeredUsers)) {
      found = registeredUsers.find(u =>
        (u.email || u.identifier || '').toLowerCase().trim() === emailLower
      );
    }
    if (!found) {
      setForgotError('❌ No account found with this email address.');
      return;
    }
    if (found.oauthProvider === 'google') {
      setForgotError('⚠️ This account uses Google Sign-In. Please use "Sign in with Google".');
      return;
    }

    setLoading(true);
    setForgotOtpDigits(['', '', '', '', '', '']);
    setForgotTimer(120);
    const otp = await sendOtp(
      emailLower,
      (code) => setForgotOtp(code),
      (msg) => setForgotSuccess(msg),
      setForgotError
    );
    setLoading(false);
    if (otp) {
      setForgotOtpSent(otp);
      setForgotStep('otp');
    }
  };

  const handleForgotOtpInput = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...forgotOtpDigits];
    updated[index] = value;
    setForgotOtpDigits(updated);
    if (value && index < 5) {
      document.getElementById(`fotp-${index + 1}`)?.focus();
    }
  };

  const handleForgotVerifyOtp = () => {
    setForgotError('');
    const entered = forgotOtpDigits.join('');
    if (entered.length < 6) { setForgotError('Please enter the full 6-digit OTP.'); return; }
    if (!forgotOtpSent) { setForgotError('OTP not found. Please resend.'); return; }
    if (entered !== forgotOtpSent) { setForgotError('Incorrect OTP. Please try again.'); return; }
    setForgotStep('newpass');
    setForgotSuccess('OTP verified! Now set your new password.');
  };

  const handleForgotSetPassword = () => {
    setForgotError('');
    const passPolicyErr = validatePasswordPolicy(newPassword);
    if (passPolicyErr) {
      setForgotError(passPolicyErr); return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.'); return;
    }
    const ok = updatePassword(forgotEmail.toLowerCase().trim(), newPassword);
    if (ok) {
      setForgotSuccess('✅ Password updated successfully! You can now sign in.');
      setTimeout(() => {
        setShowForgotModal(false);
        setEmail(forgotEmail.toLowerCase().trim());
        setPassword('');
        setIsRegister(false);
      }, 1800);
    } else {
      setForgotError('Could not update password. Please try again.');
    }
  };

  const handleAccountTypeChange = (t) => {
    setUserAccountType(t); setError(''); setSuccessMsg('');
  };

  const inputStyle = {
    width: '100%',
    padding: '0.68rem 1rem 0.68rem 2.6rem',
    borderRadius: '11px',
    background: '#ffffff',
    border: '1.5px solid #e2e8f0',
    color: '#0f172a',
    fontWeight: '500',
    fontSize: '0.88rem',
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  return (
    <>
      <style>{`
        .login-main-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          background: linear-gradient(135deg, #f5f4fd 0%, #f7f6fe 45%, #eceffd 100%);
          position: relative;
          box-sizing: border-box;
          overflow-x: hidden;
        }

        .login-top-bar {
          position: absolute;
          top: 1.5rem;
          left: 2rem;
          z-index: 30;
        }

        .login-back-btn {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          padding: 0.55rem 1.15rem;
          border-radius: 10px;
          color: #475569;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(15,23,42,0.06);
          transition: all 0.2s;
        }

        .login-back-btn:hover {
          color: #6d28d9;
          border-color: #6d28d9;
        }

        .login-grid-layout {
          width: 100%;
          max-width: 1080px;
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 3rem;
          align-items: center;
          position: relative;
          z-index: 10;
          margin: 0 auto;
        }

        .login-hero-left {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }

        .login-mobile-brand {
          display: none;
        }

        .login-card-container {
          background: #ffffff;
          border-radius: 24px;
          padding: 2.25rem 2.5rem;
          box-shadow: 0 20px 50px -15px rgba(99, 102, 241, 0.14), 0 0 1px 1px rgba(226, 232, 240, 0.8);
          border: 1px solid #f1f5f9;
          position: relative;
          width: 100%;
          box-sizing: border-box;
        }

        .otp-inputs-grid {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          width: 100%;
        }

        .otp-digit-box {
          width: 48px;
          height: 52px;
          text-align: center;
          font-size: 1.35rem;
          font-weight: 800;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          color: #0f172a;
          outline: none;
          transition: all 0.2s ease;
          box-sizing: border-box;
        }

        .otp-digit-box:focus {
          border-color: #4338ca;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(67, 56, 202, 0.15);
        }

        @media (max-width: 900px) {
          .login-main-wrapper {
            padding: 1.25rem 1rem 3rem 1rem;
            align-items: center;
            justify-content: flex-start;
            flex-direction: column;
            min-height: 100vh;
            height: auto !important;
            overflow-y: auto;
          }

          .login-top-bar {
            position: static;
            width: 100%;
            max-width: 440px;
            margin: 0 auto 0.85rem auto;
            display: flex;
            justify-content: flex-start;
          }

          .login-grid-layout {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            max-width: 440px;
            width: 100%;
            margin: 0 auto;
            gap: 0;
          }

          .login-hero-left {
            display: none !important;
          }

          .login-mobile-brand {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            margin-bottom: 1.25rem;
            gap: 0.35rem;
            width: 100%;
          }

          .login-card-container {
            padding: 1.5rem 1.25rem;
            border-radius: 20px;
            max-width: 440px;
            margin: 0 auto;
            box-shadow: 0 10px 30px -5px rgba(99, 102, 241, 0.12), 0 0 1px 1px rgba(226, 232, 240, 0.8);
          }

          .otp-digit-box {
            width: 42px;
            height: 48px;
            font-size: 1.15rem;
            border-radius: 10px;
          }
        }

        @media (max-width: 380px) {
          .login-main-wrapper {
            padding: 0.75rem 0.5rem 2rem 0.5rem;
          }

          .login-card-container {
            padding: 1.25rem 1rem;
          }

          .otp-digit-box {
            width: 36px;
            height: 44px;
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="login-main-wrapper">
        {onBack && (
          <div className="login-top-bar">
            <button onClick={onBack} className="login-back-btn">
              <ArrowLeft size={16} /> Back to Home
            </button>
          </div>
        )}

        {/* Decorative Dots Pattern (Top Right) */}
        <div
          style={{
            position: 'absolute',
            top: '2rem',
            right: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 5px)',
            gap: '10px',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818cf8' }} />
          ))}
        </div>

        {/* Decorative Dots Pattern (Bottom Left) */}
        <div
          style={{
            position: 'absolute',
            bottom: '2rem',
            left: '2.5rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 5px)',
            gap: '10px',
            opacity: 0.25,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#818cf8' }} />
          ))}
        </div>

        {/* Background Ambient Glow Circles */}
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '5%',
            width: '450px',
            height: '450px',
            background: 'radial-gradient(circle, rgba(165, 180, 252, 0.35) 0%, rgba(243, 244, 253, 0) 70%)',
            filter: 'blur(50px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '5%',
            width: '500px',
            height: '500px',
            background: 'radial-gradient(circle, rgba(199, 210, 254, 0.38) 0%, rgba(243, 244, 253, 0) 70%)',
            filter: 'blur(50px)',
            borderRadius: '50%',
            pointerEvents: 'none',
          }}
        />

        {/* ── MAIN CONTENT CONTAINER (2-COLUMNS ON DESKTOP, 1-COLUMN ON MOBILE) ── */}
        <div className="login-grid-layout">
          {/* ══════════════════════════════════════════════════════════
              LEFT SIDE: BRANDING, VALUE PROP, 3D ILLUSTRATION (DESKTOP ONLY)
          ══════════════════════════════════════════════════════════ */}
          <div className="login-hero-left">
            {/* Authentic CAREONIX Brand Logo */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.2rem' }}>
              <img
                src={careonixLogo}
                alt="CAREONIX Logo"
                style={{
                  height: '40px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0, fontWeight: '600', letterSpacing: '0.01em' }}>
                Enterprise Candidate &amp; Recruiter Portal
              </p>
            </div>

            {/* Social Proof Pill Badge */}
            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.3rem 0.85rem',
                  borderRadius: '9999px',
                  background: '#eef2ff',
                  border: '1px solid rgba(99, 102, 241, 0.18)',
                  color: '#4338ca',
                  fontSize: '0.78rem',
                  fontWeight: '600',
                }}
              >
                <Users size={14} style={{ color: '#4f46e5' }} />
                <span>Trusted by 10,000+ professionals &amp; companies</span>
              </div>
            </div>

            {/* Main Title / Hero Heading */}
            <h1
              style={{
                fontSize: '2.5rem',
                lineHeight: '1.15',
                fontWeight: '900',
                letterSpacing: '-0.03em',
                color: '#0f172a',
                margin: '0',
              }}
            >
              Connecting <br />
              <span style={{ color: '#4338ca' }}>Candidates &amp;</span> <br />
              <span style={{ color: '#4338ca' }}>Top Employers</span>
            </h1>

            {/* Subtitle Description */}
            <p
              style={{
                color: '#64748b',
                fontSize: '0.88rem',
                lineHeight: '1.55',
                maxWidth: '430px',
                margin: 0,
              }}
            >
              Discover high-growth engineering jobs or hire top talent. Sign in with Google or register with verified OTP authentication.
            </p>

            {/* Interactive Account Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', maxWidth: '420px' }}>
              {/* Candidate Card */}
              <div
                onClick={() => handleAccountTypeChange('candidate')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: userAccountType === 'candidate' ? '1.8px solid #4338ca' : '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: userAccountType === 'candidate' ? '0 4px 14px rgba(67, 56, 202, 0.12)' : '0 2px 6px rgba(15, 23, 42, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#eef2ff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#4338ca',
                      flexShrink: 0,
                    }}
                  >
                    <User size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>Candidate Account</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Explore jobs &amp; track applications</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: userAccountType === 'candidate' ? '#4338ca' : '#94a3b8' }} />
              </div>

              {/* Recruiter Card */}
              <div
                onClick={() => handleAccountTypeChange('recruiter')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 1rem',
                  borderRadius: '14px',
                  background: '#ffffff',
                  border: userAccountType === 'recruiter' ? '1.8px solid #10b981' : '1px solid rgba(226, 232, 240, 0.9)',
                  boxShadow: userAccountType === 'recruiter' ? '0 4px 14px rgba(16, 185, 129, 0.12)' : '0 2px 6px rgba(15, 23, 42, 0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div
                    style={{
                      width: '34px',
                      height: '34px',
                      borderRadius: '50%',
                      background: '#ecfdf5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10b981',
                      flexShrink: 0,
                    }}
                  >
                    <Building size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>Recruiter Account</div>
                    <div style={{ fontSize: '0.76rem', color: '#64748b' }}>Post vacancies &amp; manage talent pipeline</div>
                  </div>
                </div>
                <ChevronRight size={16} style={{ color: userAccountType === 'recruiter' ? '#10b981' : '#94a3b8' }} />
              </div>
            </div>

            {/* 3D Illustration at Bottom Left (100% Transparent PNG) */}
            <div style={{ marginTop: '0.1rem', display: 'flex', alignItems: 'center' }}>
              <img
                src="/login-3d-transparent.png"
                alt="Careonix 3D Portal Illustration"
                style={{
                  width: '180px',
                  height: 'auto',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 14px 24px rgba(99, 102, 241, 0.15))',
                  userSelect: 'none',
                }}
              />
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              RIGHT SIDE: MODERN WHITE AUTH CARD
          ══════════════════════════════════════════════════════════ */}
          <div className="login-card-container">
            {/* Mobile Brand Header */}
            <div className="login-mobile-brand">
              <img
                src={careonixLogo}
                alt="CAREONIX Logo"
                style={{
                  height: '36px',
                  width: 'auto',
                  objectFit: 'contain',
                  display: 'block',
                }}
              />
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: 0, fontWeight: '600' }}>
                Enterprise Candidate &amp; Recruiter Portal
              </p>
            </div>
          {/* Segmented Role Switcher Tabs */}
          <div
            style={{
              background: '#f1f5f9',
              borderRadius: '14px',
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '6px',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => handleAccountTypeChange('candidate')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: userAccountType === 'candidate' ? '#4338ca' : 'transparent',
                color: userAccountType === 'candidate' ? '#ffffff' : '#475569',
                boxShadow: userAccountType === 'candidate' ? '0 4px 12px rgba(67, 56, 202, 0.35)' : 'none',
              }}
            >
              <User size={17} /> Candidate
            </button>

            <button
              type="button"
              onClick={() => handleAccountTypeChange('recruiter')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '0.65rem 0.9rem',
                borderRadius: '10px',
                border: 'none',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                background: userAccountType === 'recruiter' ? '#4338ca' : 'transparent',
                color: userAccountType === 'recruiter' ? '#ffffff' : '#475569',
                boxShadow: userAccountType === 'recruiter' ? '0 4px 12px rgba(67, 56, 202, 0.35)' : 'none',
              }}
            >
              <Building size={17} /> Recruiter
            </button>
          </div>

          {/* Heading */}
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: '800',
              color: '#0f172a',
              marginBottom: '0.2rem',
              letterSpacing: '-0.02em',
            }}
          >
            {isRegister
              ? `Create ${userAccountType === 'candidate' ? 'Candidate' : 'Recruiter'} Account`
              : `Sign in as ${userAccountType === 'candidate' ? 'Candidate' : 'Recruiter'}`}
          </h2>
          <p
            style={{
              fontSize: '0.82rem',
              color: '#64748b',
              marginBottom: '1rem',
            }}
          >
            {isRegister
              ? `Register with your email to access the ${userAccountType === 'candidate' ? 'candidate' : 'recruiter'} portal.`
              : `Sign in to access your ${userAccountType === 'candidate' ? 'job applications.' : 'recruiter dashboard & postings.'}`}
          </p>

          {/* Error / Success alerts */}
          {error && (
            <div
              style={{
                background: '#fef2f2',
                border: '1.5px solid #fecaca',
                color: '#dc2626',
                borderRadius: '12px',
                padding: '0.75rem 0.95rem',
                marginBottom: '1rem',
                fontSize: '0.83rem',
                fontWeight: '600',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.08)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.45rem' }}>
                <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px', color: '#dc2626' }} />
                <span>{error}</span>
              </div>
              {isRegister && error.includes('already registered') && (
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setError('');
                    navigate('/login', { replace: true });
                  }}
                  style={{
                    alignSelf: 'flex-start',
                    marginLeft: '1.45rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '8px',
                    background: '#4338ca',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: '700',
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    boxShadow: '0 2px 6px rgba(67, 56, 202, 0.25)',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#3730a3'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#4338ca'; }}
                >
                  👉 Click Here to Sign In Instead
                </button>
              )}
            </div>
          )}

          {successMsg && (
            <div
              style={{
                background: '#f0fdf4',
                border: '1px solid #86efac',
                color: '#15803d',
                borderRadius: '10px',
                padding: '0.65rem 0.85rem',
                marginBottom: '1rem',
                fontSize: '0.82rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Social & OAuth SSO Sign In Buttons (Dynamically Controlled by Admin Integrations Settings) */}
          {(() => {
            const integrations = getSettings()?.integrations || {};
            const googleOn = integrations.googleEnabled !== false;
            const githubOn = Boolean(integrations.githubEnabled);
            const linkedinOn = Boolean(integrations.linkedinEnabled);

            if (!googleOn && !githubOn && !linkedinOn) return null;

            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '0.85rem' }}>
                {googleOn && (
                  <button
                    type="button"
                    onClick={triggerGoogleSignIn}
                    disabled={googleLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      padding: '0.68rem 1rem',
                      background: '#ffffff',
                      border: '1.5px solid #e2e8f0',
                      borderRadius: '11px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      color: '#0f172a',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#e2e8f0'; }}
                  >
                    <svg width="17" height="17" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                    {googleLoading ? 'Connecting to Google...' : 'Sign in with Google'}
                  </button>
                )}

                {githubOn && (
                  <button
                    type="button"
                    onClick={triggerGithubSignIn}
                    disabled={githubLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      padding: '0.68rem 1rem',
                      background: '#181717',
                      border: '1.5px solid #181717',
                      borderRadius: '11px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      color: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#24292f'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#181717'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                    </svg>
                    {githubLoading ? 'Connecting to GitHub...' : 'Sign in with GitHub'}
                  </button>
                )}

                {linkedinOn && (
                  <button
                    type="button"
                    onClick={triggerLinkedinSignIn}
                    disabled={linkedinLoading}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.65rem',
                      padding: '0.68rem 1rem',
                      background: '#0a66c2',
                      border: '1.5px solid #0a66c2',
                      borderRadius: '11px',
                      cursor: 'pointer',
                      fontWeight: '700',
                      fontSize: '0.88rem',
                      color: '#ffffff',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 6px rgba(10,102,194,0.25)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#004182'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#0a66c2'; }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.25c-.9 0-1.63.73-1.63 1.63s.73 1.63 1.63 1.63 1.63-.73 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z"/>
                    </svg>
                    {linkedinLoading ? 'Connecting to LinkedIn...' : 'Sign in with LinkedIn'}
                  </button>
                )}

                <div ref={googleDivRef} style={{ display: 'none' }} />

                {/* Divider */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    color: '#94a3b8',
                    fontSize: '0.78rem',
                    fontWeight: '500',
                    margin: '0.45rem 0',
                  }}
                >
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                  <span>or continue with email</span>
                  <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
                </div>
              </div>
            );
          })()}

          {/* Form */}
          <form
            onSubmit={isRegister ? handleRegisterSubmit : handleLoginSubmit}
            style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}
          >
            {isRegister && (
              <>
                <div>
                  <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                    Full Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="text"
                      required
                      placeholder={userAccountType === 'recruiter' ? 'e.g. Sarah Jenkins' : 'e.g. Alex Morgan'}
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      style={inputStyle}
                      onFocus={e => {
                        e.target.style.borderColor = '#4338ca';
                        e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.1)';
                      }}
                      onBlur={e => {
                        e.target.style.borderColor = '#e2e8f0';
                        e.target.style.boxShadow = 'none';
                      }}
                    />
                  </div>
                </div>

                {userAccountType === 'recruiter' && (
                  <div>
                    <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                      Company Name
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Building size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Careonix Technologies Inc."
                        value={companyName}
                        onChange={e => setCompanyName(e.target.value)}
                        style={inputStyle}
                        onFocus={e => {
                          e.target.style.borderColor = '#4338ca';
                          e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.1)';
                        }}
                        onBlur={e => {
                          e.target.style.borderColor = '#e2e8f0';
                          e.target.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Email Address */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.25rem' }}>
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    if (error && error.includes('already registered')) setError('');
                  }}
                  style={inputStyle}
                  onFocus={e => {
                    e.target.style.borderColor = '#4338ca';
                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.1)';
                  }}
                  onBlur={async e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                    if (!isRegister) return;
                    const clean = (email || '').toLowerCase().trim();
                    if (clean && clean.includes('@') && clean.includes('.')) {
                      const existing = await checkEmailAlreadyExists(clean);
                      if (existing) {
                        const roleName = (existing.role || 'user').toLowerCase() === 'recruiter' ? 'Recruiter' : 'Candidate';
                        setError(`⚠️ This email "${clean}" is already registered (${roleName} account)! Please switch to Sign In.`);
                      }
                    }
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700' }}>
                  Password
                </label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={openForgotModal}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#4338ca',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: '2.5rem' }}
                  onFocus={e => {
                    e.target.style.borderColor = '#4338ca';
                    e.target.style.boxShadow = '0 0 0 3px rgba(67, 56, 202, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: 0,
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '0.78rem',
                fontSize: '0.92rem',
                fontWeight: '700',
                borderRadius: '11px',
                border: 'none',
                background: '#4338ca',
                color: '#ffffff',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 14px rgba(67, 56, 202, 0.35)',
                transition: 'all 0.2s ease',
                marginTop: '0.2rem',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#3730a3';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(67, 56, 202, 0.45)';
                }
              }}
              onMouseLeave={e => {
                if (!loading) {
                  e.currentTarget.style.background = '#4338ca';
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(67, 56, 202, 0.35)';
                }
              }}
            >
              {loading ? 'Processing...' : isRegister ? 'Send Verification OTP →' : 'Sign In'}
            </button>
          </form>

            {/* Toggle Sign In / Create Account */}
          <div
            style={{
              textAlign: 'center',
              marginTop: '1rem',
              fontSize: '0.82rem',
              color: '#64748b',
            }}
          >
            {isRegister ? 'Already have an account?' : "Don't have an account yet?"}{' '}
            <button
              type="button"
              onClick={() => {
                const nextIsReg = !isRegister;
                setIsRegister(nextIsReg);
                setError('');
                setSuccessMsg('');
                navigate(nextIsReg ? '/signup' : '/login', { replace: true });
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#4338ca',
                fontWeight: '700',
                cursor: 'pointer',
                padding: 0,
                fontSize: '0.82rem',
              }}
            >
              {isRegister ? 'Sign In' : `Create Account (${userAccountType === 'candidate' ? 'Candidate' : 'Recruiter'})`}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          OTP REGISTRATION MODAL
      ════════════════════════════════════════════════════════ */}
      {showOtpModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '460px',
              padding: '2rem',
              background: '#ffffff',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: '#dcfce7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#16a34a',
                  flexShrink: 0,
                }}
              >
                <Smartphone size={22} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  OTP Security Verification
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#475569', margin: '2px 0 0 0' }}>
                  Code sent to <strong style={{ color: '#4338ca' }}>{email}</strong>
                </p>
              </div>
            </div>

            <div
              style={{
                padding: '0.85rem 1rem',
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                marginBottom: '1rem',
              }}
            >
              <div style={{ color: '#15803d', fontWeight: '800', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <CheckCircle2 size={16} /> Real Verification OTP Sent!
              </div>
              <div style={{ color: '#166534', marginTop: '0.3rem', fontSize: '0.8rem', lineHeight: '1.45' }}>
                {otpNotice || `6-digit code sent from Careonix to ${email}. Check your inbox.`}
              </div>
            </div>

            {otpError && (
              <div
                style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  borderRadius: '10px',
                  padding: '0.6rem 0.85rem',
                  marginBottom: '0.85rem',
                  fontWeight: '700',
                  fontSize: '0.82rem',
                }}
              >
                {otpError}
              </div>
            )}

            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#4338ca', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Verification Code
                </span>
                <span
                  style={{
                    color: timer > 0 ? '#d97706' : '#16a34a',
                    fontSize: '0.78rem',
                    fontWeight: '800',
                    background: timer > 0 ? '#fefce8' : '#f0fdf4',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    border: `1px solid ${timer > 0 ? '#fde68a' : '#bbf7d0'}`,
                  }}
                >
                  {timer > 0 ? `Resend in ${timer}s` : 'Ready to Resend'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`rotp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpInput(idx, e.target.value)}
                    style={{
                      width: '46px',
                      height: '50px',
                      textAlign: 'center',
                      fontSize: '1.3rem',
                      fontWeight: '800',
                      background: '#fff',
                      border: '2px solid #cbd5e1',
                      borderRadius: '11px',
                      color: '#0f172a',
                      outline: 'none',
                      fontFamily: 'monospace',
                    }}
                  />
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <button
                type="button"
                onClick={sendRealOtp}
                disabled={timer > 0}
                style={{
                  fontSize: '0.8rem',
                  padding: '0.45rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: '#f8fafc',
                  border: '1.5px solid #cbd5e1',
                  borderRadius: '9px',
                  color: timer > 0 ? '#94a3b8' : '#334155',
                  fontWeight: '700',
                  cursor: timer > 0 ? 'not-allowed' : 'pointer',
                }}
              >
                <RefreshCw size={13} /> Resend Verification OTP
              </button>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setShowOtpModal(false)}
                style={{
                  flex: 1,
                  padding: '0.7rem',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: '1px solid #cbd5e1',
                  borderRadius: '11px',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={loading}
                style={{
                  flex: 1.3,
                  padding: '0.7rem',
                  background: '#4338ca',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '11px',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(67, 56, 202, 0.35)',
                }}
              >
                {loading ? 'Verifying...' : 'Verify & Sign Up'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          FORGOT PASSWORD MODAL
      ════════════════════════════════════════════════════════ */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 300,
            padding: '1rem',
          }}
        >
          <div
            style={{
              width: '450px',
              background: '#ffffff',
              borderRadius: '22px',
              boxShadow: '0 25px 60px rgba(15, 23, 42, 0.3)',
              border: '1px solid #e2e8f0',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{ padding: '1.25rem 1.75rem 0.85rem', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#eef2ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#4338ca',
                  flexShrink: 0,
                }}
              >
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Reset Password</h3>
                <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#64748b', fontWeight: '500' }}>
                  {forgotStep === 'email' && 'Enter your registered email'}
                  {forgotStep === 'otp' && `Enter OTP sent to ${forgotEmail}`}
                  {forgotStep === 'newpass' && 'Set your new password'}
                </p>
              </div>
            </div>

            {/* Steps Progress */}
            <div style={{ display: 'flex', padding: '0.85rem 1.75rem 0', gap: '0.5rem' }}>
              {[
                { key: 'email', label: '1. Email', icon: <Mail size={12} /> },
                { key: 'otp', label: '2. OTP', icon: <ShieldCheck size={12} /> },
                { key: 'newpass', label: '3. New Password', icon: <Lock size={12} /> },
              ].map(step => {
                const stepOrder = { email: 0, otp: 1, newpass: 2 };
                const currentIdx = stepOrder[forgotStep];
                const isActive = step.key === forgotStep;
                const isDone = stepOrder[step.key] < currentIdx;
                return (
                  <div key={step.key} style={{ flex: 1, textAlign: 'center' }}>
                    <div
                      style={{
                        height: '3.5px',
                        borderRadius: '2px',
                        background: isActive || isDone ? '#4338ca' : '#e2e8f0',
                        marginBottom: '3px',
                        transition: 'background 0.3s',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        color: isActive || isDone ? '#4338ca' : '#94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px',
                      }}
                    >
                      {step.icon} {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: '1rem 1.75rem 1.75rem' }}>
              {forgotError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '9px',
                    padding: '0.55rem 0.85rem',
                    marginBottom: '0.85rem',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                  }}
                >
                  <AlertCircle size={13} style={{ display: 'inline', marginRight: '5px' }} />
                  {forgotError}
                </div>
              )}
              {forgotSuccess && (
                <div
                  style={{
                    background: '#f0fdf4',
                    border: '1px solid #86efac',
                    color: '#15803d',
                    borderRadius: '9px',
                    padding: '0.55rem 0.85rem',
                    marginBottom: '0.85rem',
                    fontWeight: '700',
                    fontSize: '0.8rem',
                  }}
                >
                  <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '5px' }} />
                  {forgotSuccess}
                </div>
              )}

              {/* STEP 1: Email */}
              {forgotStep === 'email' && (
                <>
                  <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>
                    Registered Email Address
                  </label>
                  <div style={{ position: 'relative', marginBottom: '1rem' }}>
                    <Mail size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={forgotEmail}
                      onChange={e => setForgotEmail(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleForgotSendOtp()}
                      style={{ ...inputStyle, paddingLeft: '2.5rem' }}
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      style={{
                        flex: 1,
                        padding: '0.68rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotSendOtp}
                      disabled={loading}
                      style={{
                        flex: 1.4,
                        padding: '0.68rem',
                        background: '#4338ca',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
                      }}
                    >
                      {loading ? 'Sending...' : 'Send Reset OTP →'}
                    </button>
                  </div>
                </>
              )}

              {/* STEP 2: OTP Verification */}
              {forgotStep === 'otp' && (
                <>
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ fontSize: '0.78rem', color: '#4338ca', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Enter OTP
                      </span>
                      <span
                        style={{
                          color: forgotTimer > 0 ? '#d97706' : '#16a34a',
                          fontSize: '0.78rem',
                          fontWeight: '800',
                          background: forgotTimer > 0 ? '#fefce8' : '#f0fdf4',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: `1px solid ${forgotTimer > 0 ? '#fde68a' : '#bbf7d0'}`,
                        }}
                      >
                        {forgotTimer > 0 ? `Resend in ${forgotTimer}s` : 'Ready to Resend'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '0.85rem' }}>
                      {forgotOtpDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`fotp-${idx}`}
                          type="text"
                          maxLength={1}
                          value={digit}
                          onChange={e => handleForgotOtpInput(idx, e.target.value)}
                          style={{
                            width: '46px',
                            height: '50px',
                            textAlign: 'center',
                            fontSize: '1.3rem',
                            fontWeight: '800',
                            background: '#fff',
                            border: '2px solid #cbd5e1',
                            borderRadius: '11px',
                            color: '#0f172a',
                            outline: 'none',
                            fontFamily: 'monospace',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button
                        type="button"
                        disabled={forgotTimer > 0}
                        onClick={async () => {
                          setForgotOtpDigits(['', '', '', '', '', '']);
                          setForgotTimer(120);
                          const otp = await sendOtp(forgotEmail.toLowerCase().trim(), (code) => setForgotOtp(code), (msg) => setForgotSuccess(msg), setForgotError);
                          if (otp) setForgotOtpSent(otp);
                        }}
                        style={{
                          fontSize: '0.78rem',
                          padding: '0.45rem 0.9rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          background: '#f8fafc',
                          border: '1.5px solid #cbd5e1',
                          borderRadius: '9px',
                          color: forgotTimer > 0 ? '#94a3b8' : '#334155',
                          fontWeight: '700',
                          cursor: forgotTimer > 0 ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <RefreshCw size={12} /> Resend OTP
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.65rem' }}>
                    <button
                      type="button"
                      onClick={() => { setForgotStep('email'); setForgotError(''); }}
                      style={{
                        flex: 1,
                        padding: '0.68rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #e2e8f0',
                        borderRadius: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontSize: '0.88rem',
                      }}
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <button
                      type="button"
                      onClick={handleForgotVerifyOtp}
                      style={{
                        flex: 1.4,
                        padding: '0.68rem',
                        background: '#4338ca',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '11px',
                        fontWeight: '800',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        boxShadow: '0 4px 12px rgba(67, 56, 202, 0.3)',
                      }}
                    >
                      Verify OTP →
                    </button>
                  </div>
                </>
              )}

              {/* STEP 3: New Password */}
              {forgotStep === 'newpass' && (
                <>
                  <div style={{ marginBottom: '0.85rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>
                      New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type={showNewPass ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        value={newPassword}
                        onChange={e => setNewPassword(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPass(!showNewPass)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {showNewPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ fontSize: '0.8rem', color: '#1e293b', fontWeight: '700', display: 'block', marginBottom: '0.3rem' }}>
                      Confirm New Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={15} style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                      <input
                        type={showConfirmPass ? 'text' : 'password'}
                        placeholder="Re-enter new password"
                        value={confirmPassword}
                        onChange={e => setConfirmPassword(e.target.value)}
                        style={{ ...inputStyle, paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPass(!showConfirmPass)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          color: '#94a3b8',
                          cursor: 'pointer',
                        }}
                      >
                        {showConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {newPassword.length > 0 && (
                    <div style={{ marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '3px' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div
                            key={i}
                            style={{
                              flex: 1,
                              height: '3.5px',
                              borderRadius: '2px',
                              background:
                                newPassword.length >= i * 2
                                  ? newPassword.length >= 8
                                    ? '#16a34a'
                                    : newPassword.length >= 6
                                    ? '#f59e0b'
                                    : '#ef4444'
                                  : '#e2e8f0',
                              transition: 'background 0.2s',
                            }}
                          />
                        ))}
                      </div>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: '700',
                          color:
                            newPassword.length >= 8
                              ? '#16a34a'
                              : newPassword.length >= 6
                              ? '#f59e0b'
                              : '#ef4444',
                        }}
                      >
                        {newPassword.length >= 8
                          ? '✅ Strong password'
                          : newPassword.length >= 6
                          ? '⚠️ Acceptable'
                          : '❌ Too weak (min 6 chars)'}
                      </span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleForgotSetPassword}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#4338ca',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '11px',
                      fontWeight: '800',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                      boxShadow: '0 4px 14px rgba(67, 56, 202, 0.35)',
                    }}
                  >
                    <ShieldCheck size={16} /> Update Password &amp; Sign In
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      </div>
    </>
  );
}
