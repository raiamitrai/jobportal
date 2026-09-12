import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSettings } from '../utils/settingsManager';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

// Module-level flag — survives StrictMode remount unlike useRef
// Cleared on page unload so fresh attempts always work
const EXCHANGE_KEY = '__careonix_oauth_code_exchanged__';

function fetchWithTimeout(url, options, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { provider = 'github' } = useParams();
  const { login, registerUser, findUserByEmail } = useAuth();

  const [status, setStatus] = useState('processing');
  const [errorMsg, setErrorMsg] = useState('');
  const [profileData, setProfileData] = useState(null);
  const didRun = useRef(false);

  const completeLoginWithUser = (ghUser) => {
    const isRecruiter = sessionStorage.getItem('careonix_oauth_role') === 'recruiter';
    const accountType = isRecruiter ? 'recruiter' : 'candidate';

    const realName = ghUser.name || ghUser.login || 'GitHub User';
    const realEmail = (ghUser.email || `${(ghUser.login || 'user').toLowerCase()}@users.noreply.github.com`).toLowerCase();
    const realAvatar = ghUser.avatar_url || `https://github.com/${ghUser.login || 'octocat'}.png`;

    setProfileData({ name: realName, email: realEmail, avatar: realAvatar });
    setStatus('success');

    // Clear exchange flag after successful login
    sessionStorage.removeItem(EXCHANGE_KEY);

    const existing = findUserByEmail(realEmail);

    const userDataToSave = {
      identifier: realEmail,
      email: realEmail,
      name: realName,
      company: isRecruiter ? (ghUser.company || (existing && existing.company) || `${realName} Technologies`) : null,
      role: 'client',
      accountType,
      oauthProvider: 'github',
      password: (existing && existing.password) || '',
      approvalStatus: 'APPROVED',
      photoUrl: realAvatar,
      avatar: realAvatar,
      githubUsername: ghUser.login,
      bio: ghUser.bio || (existing && existing.bio) || '',
      token: 'jwt_mock_token_' + Date.now(),
      loginTime: new Date().toISOString()
    };

    // Save to sessionStorage and localStorage FIRST
    try {
      sessionStorage.setItem('careonix_user', JSON.stringify(userDataToSave));
      sessionStorage.setItem('careonix_active_tab', 'dashboard');
      sessionStorage.removeItem('careonix_view_override');
      localStorage.setItem('careonix_user', JSON.stringify(userDataToSave));
    } catch (e) {}

    if (existing) {
      login(userDataToSave);
    } else {
      registerUser(userDataToSave, '');
      login(userDataToSave);
    }

    const targetPath = isRecruiter ? '/recruiter/dashboard' : '/candidate/dashboard';

    setTimeout(() => {
      window.location.replace(targetPath);
    }, 1000);
  };

  useEffect(() => {
    // StrictMode in dev runs effects twice on same component instance.
    // We use a ref (per-instance) to guard against that.
    if (didRun.current) return;
    didRun.current = true;

    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    const errorParam = params.get('error');
    const errorDesc = params.get('error_description');

    // Handle GitHub declining/cancelling
    if (errorParam) {
      setStatus('error');
      setErrorMsg(errorDesc || 'GitHub sign-in was cancelled.');
      return;
    }

    if (!code) {
      setStatus('error');
      setErrorMsg('No authorization code found. Please try signing in again.');
      return;
    }

    // Use sessionStorage to prevent the SAME code being exchanged twice
    // (handles browser back/forward and HMR reload edge cases)
    const alreadyUsedCode = sessionStorage.getItem(EXCHANGE_KEY);
    if (alreadyUsedCode === code) {
      setStatus('error');
      setErrorMsg('This sign-in link has already been used. Please click "Sign in with GitHub" again.');
      return;
    }
    sessionStorage.setItem(EXCHANGE_KEY, code);

    const handleOAuthCallback = async () => {
      const settings = getSettings()?.integrations || {};
      const clientId = (settings.githubClientId || import.meta.env.VITE_GITHUB_CLIENT_ID || 'Ov23li7BdZOdL1WhHgNg').trim();
      const clientSecret = (settings.githubClientSecret || import.meta.env.VITE_GITHUB_CLIENT_SECRET || '').trim();
      const redirectUri = `${window.location.origin}/auth/callback/github`;

      let accessToken = null;
      let githubError = '';

      // ── Step 1: Vite dev server proxy ─────────────────────────────────────
      try {
        const res = await fetchWithTimeout('/api/github-oauth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, redirect_uri: redirectUri })
        }, 8000);

        if (res.ok) {
          const data = await res.json();
          if (data.access_token) {
            accessToken = data.access_token;
          } else if (data.error) {
            githubError = data.error_description || data.error;
          }
        }
      } catch (e) {
        // Dev proxy unavailable, try backend
      }

      // ── Step 2: Backend Auth Service / Gateway fallback ───────────────────
      if (!accessToken && !githubError) {
        const authCandidates = [
          '/auth/oauth/github',
          '/api/auth/oauth/github',
          'http://localhost:8080/auth/oauth/github',
          'http://localhost:8085/auth/oauth/github'
        ];
        for (const authUrl of authCandidates) {
          try {
            const res = await fetchWithTimeout(authUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
              body: JSON.stringify({ clientId, clientSecret, code })
            }, 8000);

            if (res.ok) {
              const userProfile = await res.json();
              if (userProfile && (userProfile.id || userProfile.login)) {
                completeLoginWithUser(userProfile);
                return;
              }
            }
          } catch (_) {}
        }
      }

      // ── Step 3: Fetch real GitHub user profile ─────────────────────────────
      if (accessToken) {
        try {
          const userRes = await fetchWithTimeout('https://api.github.com/user', {
            headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
          }, 8000);

          if (userRes.ok) {
            const ghUser = await userRes.json();

            // Fetch primary verified email (handles private email accounts)
            try {
              const emailRes = await fetchWithTimeout('https://api.github.com/user/emails', {
                headers: { 'Authorization': `Bearer ${accessToken}`, 'Accept': 'application/vnd.github.v3+json' }
              }, 6000);
              if (emailRes.ok) {
                const emails = await emailRes.json();
                if (Array.isArray(emails) && emails.length > 0) {
                  const primary = emails.find(e => e.primary && e.verified)
                    || emails.find(e => e.primary)
                    || emails[0];
                  if (primary?.email) ghUser.email = primary.email;
                }
              }
            } catch (_) {}

            completeLoginWithUser(ghUser);
            return;
          } else {
            console.warn('[OAuth] GitHub user API error:', userRes.status);
          }
        } catch (e) {
          console.warn('[OAuth] GitHub user fetch error:', e.message);
        }
      }

      // ── Step 4: Show specific error message ────────────────────────────────
      sessionStorage.removeItem(EXCHANGE_KEY); // Allow retry
      let msg = 'GitHub sign-in could not be completed. Please try again.';
      if (githubError.includes('bad_verification_code') || githubError === 'bad_verification_code') {
        msg = 'The GitHub authorization code expired or was already used. Please click "Back to Login" and try again.';
      } else if (githubError.includes('incorrect_client_credentials')) {
        msg = 'GitHub OAuth app credentials are incorrect.';
      } else if (githubError) {
        msg = `GitHub error: ${githubError}`;
      }
      setStatus('error');
      setErrorMsg(msg);
    };

    handleOAuthCallback();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', padding: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#ffffff', borderRadius: '20px', border: '1px solid #e2e8f0', padding: '2.5rem', width: '100%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.06)' }}>

        {status === 'processing' && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#e0e7ff', color: '#4f46e5', marginBottom: '1.25rem' }}>
              <Loader2 size={32} style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Signing in with GitHub...</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0 }}>Verifying your identity. Please wait...</p>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#dcfce7', color: '#16a34a', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={36} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: '0 0 0.5rem 0' }}>Signed in Successfully!</h2>
            {profileData && (
              <div style={{ margin: '1.25rem 0', display: 'flex', alignItems: 'center', gap: '12px', background: '#f0fdf4', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'left' }}>
                <img src={profileData.avatar} alt={profileData.name} style={{ width: '44px', height: '44px', borderRadius: '50%', border: '2px solid #16a34a', objectFit: 'cover' }} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.92rem', color: '#0f172a' }}>{profileData.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#475569', wordBreak: 'break-all' }}>{profileData.email}</div>
                </div>
              </div>
            )}
            <p style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: '700', margin: 0 }}>Redirecting to your dashboard...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', marginBottom: '1.25rem' }}>
              <AlertCircle size={36} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#991b1b', margin: '0 0 0.5rem 0' }}>Sign-In Failed</h2>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1.5rem 0', fontWeight: '500', lineHeight: 1.5 }}>{errorMsg}</p>
            <button
              onClick={() => { sessionStorage.removeItem(EXCHANGE_KEY); navigate('/login'); }}
              style={{ width: '100%', padding: '0.75rem', background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', fontSize: '0.88rem' }}
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
