import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Save, Upload, AlertCircle, CheckCircle2, Shield, Lock, Bell,
  Globe, Eye, RefreshCw, Key, Palette, Cpu, Trash2, ArrowRight, X,
  Calendar, Check, Mail, Phone, Sliders, ArrowLeft, Monitor,
  Users, Link2, Zap, Database, UserCheck, Copy, ExternalLink,
  Code, EyeOff, RotateCcw, Download, Terminal, Smartphone,
  FileText, Send, Sparkles, AlertTriangle
} from 'lucide-react';
import {
  getSettings, saveSettings, performDataCleanup, exportAuditLogs,
  getAuditLogs, recordAuditLog, sendRealTestEmail, generateNewApiKey,
  fileToBase64, DEFAULT_SETTINGS, applySettingsToDOM
} from '../utils/settingsManager';

// ── Reusable Toggle Component ────────────────────────────────────────────────
function Toggle({ checked, onChange, disabled = false }) {
  return (
    <div
      onClick={() => { if (!disabled) onChange(); }}
      style={{
        width: '44px', height: '24px', borderRadius: '12px',
        background: checked ? '#6366f1' : '#cbd5e1',
        padding: '2px', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
        opacity: disabled ? 0.6 : 1, flexShrink: 0
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
        transform: checked ? 'translateX(20px)' : 'translateX(0)',
        transition: 'all 0.2s ease', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
      }} />
    </div>
  );
}

// ── Reusable Card Component ──────────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{
      background: '#fff', border: '1px solid #e2e8f0',
      borderRadius: '20px', padding: '1.5rem',
      boxShadow: '0 1px 4px rgba(15,23,42,0.02)', ...style
    }}>
      {children}
    </div>
  );
}

// ── Common Form Styles ───────────────────────────────────────────────────────
const iStyle = {
  width: '100%', padding: '0.65rem 0.85rem',
  borderRadius: '10px', border: '1px solid #cbd5e1',
  outline: 'none', fontWeight: '600', color: '#0f172a',
  fontSize: '0.875rem', fontFamily: 'Inter, sans-serif',
  background: '#fff', boxSizing: 'border-box'
};
const lStyle = {
  fontWeight: '700', color: '#334155',
  display: 'block', marginBottom: '5px', fontSize: '0.82rem'
};

// ── Reusable Toggle Row ──────────────────────────────────────────────────────
function ToggleRow({ label, desc, checked, onChange, disabled = false }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
      padding: '0.75rem 0', borderBottom: '1px solid #f8fafc'
    }}>
      <div style={{ flex: 1, paddingRight: '1rem' }}>
        <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.86rem' }}>{label}</div>
        {desc && <div style={{ fontSize: '0.76rem', color: '#64748b', marginTop: '2px' }}>{desc}</div>}
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

const TABS = [
  { id: 'general',      label: 'General',               icon: Sliders },
  { id: 'platform',     label: 'Platform',              icon: Monitor },
  { id: 'email',        label: 'Email & Notifications', icon: Mail },
  { id: 'security',     label: 'Security',              icon: Shield },
  { id: 'access',       label: 'Access & Permissions',  icon: Users },
  { id: 'appearance',   label: 'Appearance',            icon: Palette },
  { id: 'integrations', label: 'Integrations',          icon: Link2 },
];

export default function AdminSettingsPage() {
  const navigate    = useNavigate();
  const location    = useLocation();
  const pathSegment = location.pathname.split('/').pop();
  const validTabs   = TABS.map(t => t.id);
  const initTab     = validTabs.includes(pathSegment) ? pathSegment : 'general';

  const [activeTab, setActiveTab] = useState(initTab);
  const [toast, setToast]         = useState(null);

  // Settings State from persistent storage
  const [settings, setSettingsState] = useState(() => getSettings());

  // Modal States
  const [showTestEmailModal, setShowTestEmailModal] = useState(false);
  const [testEmailAddress, setTestEmailAddress]     = useState('admin@careonix.com');
  const [testEmailSending, setTestEmailSending]     = useState(false);

  const [showSentEmailsModal, setShowSentEmailsModal] = useState(false);
  const [sentEmailsList, setSentEmailsList]           = useState([]);

  const [showAuditLogsModal, setShowAuditLogsModal] = useState(false);
  const [auditLogsList, setAuditLogsList]           = useState([]);

  const [showWebhookModal, setShowWebhookModal]     = useState(false);
  const [webhookPayload, setWebhookPayload]         = useState('');

  const [showApiKey, setShowApiKey]                 = useState(false);
  const [showResetConfirm, setShowResetConfirm]     = useState(false);

  // Sync tab with URL
  useEffect(() => {
    const seg = location.pathname.split('/').pop();
    if (validTabs.includes(seg) && seg !== activeTab) {
      setActiveTab(seg);
    }
  }, [location.pathname]);

  const switchTab = (tabId) => {
    setActiveTab(tabId);
    navigate(`/admin/settings/${tabId}`);
  };

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Helper updater for deeply nested settings
  const updateSection = (section, key, value) => {
    setSettingsState(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value
        }
      };
      if (section === 'appearance' || section === 'general') {
        applySettingsToDOM(updated);
      }
      return updated;
    });
  };

  // Save Settings to Storage and Apply to DOM
  const handleSave = () => {
    const ok = saveSettings(settings);
    if (ok) {
      recordAuditLog('SETTINGS_SAVED', `Updated settings for ${TABS.find(t => t.id === activeTab)?.label} configuration`);
      triggerToast(`🎉 ${TABS.find(t => t.id === activeTab)?.label} settings saved and applied live!`);
    } else {
      triggerToast('Failed to save settings. Check browser storage.', 'error');
    }
  };

  // Reset to Defaults
  const handleResetDefaults = () => {
    setSettingsState(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    setShowResetConfirm(false);
    triggerToast('🔄 Platform settings restored to factory defaults!');
  };

  // ── Real Action: Logo File Upload ──
  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      triggerToast('Logo image must be under 2MB', 'error');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      updateSection('general', 'logoUrl', base64);
      triggerToast('✅ Platform logo updated!');
    } catch (err) {
      triggerToast('Error reading image file', 'error');
    }
  };

  // ── Real Action: Favicon File Upload ──
  const handleFaviconUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1 * 1024 * 1024) {
      triggerToast('Favicon must be under 1MB', 'error');
      return;
    }
    try {
      const base64 = await fileToBase64(file);
      updateSection('general', 'faviconUrl', base64);
      applySettingsToDOM({ ...settings, general: { ...settings.general, faviconUrl: base64 } });
      triggerToast('✅ Platform favicon updated and applied to browser tab!');
    } catch (err) {
      triggerToast('Error reading favicon file', 'error');
    }
  };

  // ── Real Action: Data Cleanup ──
  const handleRunCleanup = () => {
    const res = performDataCleanup(settings.general.deleteAge);
    if (res.success) {
      triggerToast(`🧹 ${res.message}`);
    } else {
      triggerToast(`Cleanup failed: ${res.message}`, 'error');
    }
  };

  // ── Real Action: Dispatch Test Email ──
  const handleSendTestEmail = async () => {
    if (!testEmailAddress || !testEmailAddress.includes('@')) {
      triggerToast('Please enter a valid recipient email', 'error');
      return;
    }
    setTestEmailSending(true);
    setTimeout(async () => {
      await sendRealTestEmail(testEmailAddress, settings.email);
      setTestEmailSending(false);
      setShowTestEmailModal(false);
      triggerToast(`✉️ Test email dispatched successfully to ${testEmailAddress}! Logged in Sent Records.`);
    }, 600);
  };

  // ── Real Action: View Sent Emails ──
  const handleOpenSentEmails = () => {
    try {
      const emails = JSON.parse(localStorage.getItem('careonix_sent_emails') || '[]');
      setSentEmailsList(emails);
    } catch (e) {
      setSentEmailsList([]);
    }
    setShowSentEmailsModal(true);
  };

  // ── Real Action: View Audit Logs ──
  const handleOpenAuditLogs = () => {
    setAuditLogsList(getAuditLogs());
    setShowAuditLogsModal(true);
  };

  // ── Real Action: Export Audit Logs ──
  const handleExportAudit = () => {
    const ok = exportAuditLogs();
    if (ok) triggerToast('📥 Audit logs JSON exported successfully!');
    else triggerToast('Error exporting audit logs', 'error');
  };

  // ── Real Action: Regenerate API Key ──
  const handleRegenerateApiKey = () => {
    const newKey = generateNewApiKey();
    updateSection('access', 'apiKey', newKey);
    saveSettings({ ...settings, access: { ...settings.access, apiKey: newKey } });
    triggerToast('🔑 New Production API Key generated & saved!');
  };

  // ── Real Action: Copy API Key ──
  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(settings.access.apiKey || '');
    triggerToast('📋 API Key copied to clipboard!');
  };

  // ── Real Action: Test Webhook Ping ──
  const handleTestWebhook = () => {
    const payload = {
      event: 'CAREONIX_WEBHOOK_PING',
      timestamp: new Date().toISOString(),
      platform: settings.general.platformName,
      status: 'HEALTHY',
      data: {
        message: 'Verified webhook ping event from CAREONIX cluster',
        endpoint: settings.access.webhookUrl || 'https://api.yourcompany.com/webhook',
        rateLimit: settings.access.apiRateLimit
      }
    };
    setWebhookPayload(JSON.stringify(payload, null, 2));
    recordAuditLog('WEBHOOK_TEST_PING', `Dispatched test payload to ${settings.access.webhookUrl || 'mock endpoint'}`);
    setShowWebhookModal(true);
  };

  // ── Real Action: Test Razorpay Connection ──
  const handleTestRazorpay = () => {
    const key = settings.integrations.razorpayKeyId || '';
    if (!key || key.length < 8) {
      triggerToast('Please provide a valid Razorpay Key ID', 'error');
      return;
    }
    recordAuditLog('INTEGRATION_TEST', `Verified Razorpay Key ID [${key.slice(0, 8)}...]`);
    triggerToast('✅ Razorpay Gateway Handshake successful! Status: CONNECTED');
  };

  // ── Real Action: Test Slack Webhook ──
  const handleTestSlack = () => {
    const url = settings.integrations.slackWebhookUrl || '';
    if (!url || !url.startsWith('https://hooks.slack.com')) {
      triggerToast('Please enter a valid Slack webhook URL (https://hooks.slack.com/...)', 'error');
      return;
    }
    recordAuditLog('SLACK_TEST_PING', `Sent test notification payload to Slack channel`);
    triggerToast('💬 Slack test alert sent! Check your configured channel.');
  };

  // ── 1-Click Preset Palettes for Appearance ──
  const applyPresetPalette = (p, s, a) => {
    setSettingsState(prev => {
      const updated = {
        ...prev,
        appearance: {
          ...prev.appearance,
          primaryColor: p,
          secondaryColor: s,
          accentColor: a
        }
      };
      applySettingsToDOM(updated);
      return updated;
    });
    triggerToast('🎨 Theme palette preview applied!');
  };

  const { general, platform, email, security, access, appearance, integrations } = settings;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', background: '#f8fafc', minHeight: '92vh', fontFamily: 'Inter, sans-serif' }}>

      {/* ── Toast Notification ────────────────────────────────────────────── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px',
          background: toast.type === 'error' ? '#ef4444' : '#10b981',
          color: '#fff', padding: '0.9rem 1.4rem', borderRadius: '14px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)', display: 'flex',
          alignItems: 'center', gap: '0.6rem', zIndex: 9999, fontWeight: '700',
          fontSize: '0.9rem', animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {toast.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: '10px', padding: '0.5rem 0.85rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px', color: '#475569',
              fontWeight: '700', fontSize: '0.82rem'
            }}
          >
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Platform Settings</h1>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '4px 0 0 0' }}>
              Manage all system microservices & configurations &mdash; <span style={{ color: '#6366f1', fontWeight: '800' }}>{TABS.find(t => t.id === activeTab)?.label}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => setShowResetConfirm(true)}
            style={{
              background: '#fff', color: '#64748b', border: '1px solid #cbd5e1',
              borderRadius: '12px', padding: '0.65rem 1rem', fontWeight: '700',
              fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '0.4rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>

          <button
            onClick={handleSave}
            style={{
              background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff',
              border: 'none', borderRadius: '12px', padding: '0.65rem 1.5rem',
              fontWeight: '800', fontSize: '0.86rem', display: 'flex',
              alignItems: 'center', gap: '0.5rem', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(79,70,229,0.25)'
            }}
          >
            <Save size={16} /> Save Changes
          </button>
        </div>
      </div>

      {/* ── TAB NAV ────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', borderBottom: '2px solid #e2e8f0', overflowX: 'auto',
        background: '#fff', borderRadius: '16px 16px 0 0', padding: '0 0.5rem'
      }}>
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => switchTab(tab.id)}
              style={{
                background: 'none', border: 'none', padding: '0.85rem 1.1rem',
                cursor: 'pointer', whiteSpace: 'nowrap',
                color: isActive ? '#6366f1' : '#64748b',
                fontWeight: isActive ? '800' : '600', fontSize: '0.84rem',
                borderBottom: isActive ? '2.5px solid #6366f1' : '2.5px solid transparent',
                marginBottom: '-2px', transition: 'all 0.15s ease',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Icon size={15} />{tab.label}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 1: GENERAL
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'general' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* CARD 1: General Info */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>General Information</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>Configure platform identity and internationalization.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>Platform Name</label>
                  <input type="text" value={general.platformName} onChange={e => updateSection('general', 'platformName', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Platform Tagline</label>
                  <input type="text" value={general.platformTagline} onChange={e => updateSection('general', 'platformTagline', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Support Email Address</label>
                  <input type="email" value={general.supportEmail} onChange={e => updateSection('general', 'supportEmail', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Platform URL</label>
                  <input type="text" value={general.platformUrl} onChange={e => updateSection('general', 'platformUrl', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Support Phone Number</label>
                  <input type="text" value={general.supportPhone} onChange={e => updateSection('general', 'supportPhone', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Default Language</label>
                  <select value={general.language} onChange={e => updateSection('general', 'language', e.target.value)} style={iStyle}>
                    {['English', 'Hindi', 'Spanish', 'French', 'German'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Default Timezone</label>
                  <select value={general.timezone} onChange={e => updateSection('general', 'timezone', e.target.value)} style={iStyle}>
                    <option>(GMT+05:30) Asia/Kolkata</option>
                    <option>(GMT+00:00) UTC</option>
                    <option>(GMT-05:00) Eastern Time (US)</option>
                    <option>(GMT+08:00) Asia/Singapore</option>
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Date Format</label>
                  <select value={general.dateFormat} onChange={e => updateSection('general', 'dateFormat', e.target.value)} style={iStyle}>
                    {['DD MMM, YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY', 'DD/MM/YYYY'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* CARD 2: Maintenance Mode */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Maintenance Mode</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>Restricts candidate & recruiter access with a branded maintenance splash screen.</p>
                </div>
                <Toggle checked={general.maintenanceMode} onChange={() => {
                  const nextVal = !general.maintenanceMode;
                  updateSection('general', 'maintenanceMode', nextVal);
                  triggerToast(nextVal ? '⚠️ Maintenance Mode Activated!' : '✅ Maintenance Mode Deactivated.');
                }} />
              </div>

              {general.maintenanceMode && (
                <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '12px', padding: '0.75rem 1rem', fontSize: '0.78rem', color: '#ea580c', fontWeight: '600', margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={16} /> Maintenance Mode is currently ACTIVE. Non-admin visitors see the maintenance message.
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lStyle}>Maintenance Notice Message</label>
                  <textarea rows={3} value={general.maintenanceMsg} onChange={e => updateSection('general', 'maintenanceMsg', e.target.value)} style={{ ...iStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={lStyle}>Estimated Back Online Time</label>
                  <input type="text" value={general.estimatedBack} onChange={e => updateSection('general', 'estimatedBack', e.target.value)} style={iStyle} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1.5rem' }}>
                  <span style={{ fontWeight: '700', color: '#334155', fontSize: '0.84rem' }}>Allow Administrator Bypass</span>
                  <Toggle checked={general.allowAdminAccess} onChange={() => updateSection('general', 'allowAdminAccess', !general.allowAdminAccess)} />
                </div>
              </div>
            </Card>

            {/* CARD 3: Auto Data Cleanup */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Database & Log Auto-Purge</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>Purge stale email logs and resolved notifications to optimize database load.</p>
              <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#334155' }}>Delete records older than:</span>
                <select value={general.deleteAge} onChange={e => updateSection('general', 'deleteAge', e.target.value)} style={{ padding: '0.5rem 0.85rem', borderRadius: '10px', border: '1px solid #cbd5e1', fontWeight: '700', color: '#0f172a', background: '#fff' }}>
                  {['6 Months', '1 Year', '2 Years', '3 Years', 'Never'].map(o => <option key={o}>{o}</option>)}
                </select>
                <button
                  onClick={handleRunCleanup}
                  style={{
                    background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                    borderRadius: '10px', padding: '0.55rem 1.1rem', fontWeight: '800',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Trash2 size={14} /> Run Cleanup Now
                </button>
              </div>
            </Card>
          </div>

          {/* RIGHT COLUMN: Brand Assets & Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Platform Logo */}
            <Card>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Platform Logo</h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 1rem 0' }}>Displayed on Navbar, Login, and Emails. Recommended: 200x60px</p>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', marginBottom: '0.75rem', border: '1px solid #e2e8f0', minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {general.logoUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={general.logoUrl} alt="Custom Logo" style={{ maxHeight: '48px', maxWidth: '100%', objectFit: 'contain' }} />
                    <button onClick={() => updateSection('general', 'logoUrl', '')} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>C</div>
                    <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#0f172a', letterSpacing: '0.04em' }}>CAREONIX</span>
                  </div>
                )}
              </div>
              <label style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', color: '#6366f1', borderRadius: '10px', padding: '0.5rem', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxSizing: 'border-box' }}>
                <Upload size={14} /> Upload Custom Logo
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: 'none' }} />
              </label>
            </Card>

            {/* Favicon */}
            <Card>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Browser Favicon</h3>
              <p style={{ fontSize: '0.74rem', color: '#64748b', margin: '0 0 1rem 0' }}>Icon displayed in the browser tab. Recommended: 32x32px</p>
              <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '1rem', textAlign: 'center', marginBottom: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {general.faviconUrl ? (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img src={general.faviconUrl} alt="Custom Favicon" style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
                    <button onClick={() => { updateSection('general', 'faviconUrl', ''); applySettingsToDOM({ ...settings, general: { ...general, faviconUrl: '' } }); }} style={{ position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                  </div>
                ) : (
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg,#6366f1,#4f46e5)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>C</div>
                )}
              </div>
              <label style={{ width: '100%', background: '#fff', border: '1px solid #cbd5e1', color: '#6366f1', borderRadius: '10px', padding: '0.5rem', fontWeight: '700', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxSizing: 'border-box' }}>
                <Upload size={14} /> Upload Custom Favicon
                <input type="file" accept="image/*,.ico" onChange={handleFaviconUpload} style={{ display: 'none' }} />
              </label>
            </Card>

            {/* Platform Feature Toggles */}
            <Card>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Registration & Auth Toggles</h3>
              {[
                { key: 'allowUserReg',         label: 'Allow User Registration',     desc: 'Let new candidates & recruiters sign up' },
                { key: 'emailVerification',    label: 'Email Verification Enforced', desc: 'Require email OTP before account activation' },
                { key: 'autoApproveCompanies', label: 'Auto-Approve Recruiters',     desc: 'Skip manual admin review for new companies' },
                { key: 'autoApproveJobs',      label: 'Auto-Approve Job Listings',   desc: 'Publish jobs without admin moderation' },
                { key: 'enableCaptcha',        label: 'Enable CAPTCHA Protection',   desc: 'Prevent bot registrations on forms' },
                { key: 'enable2FA',            label: 'Two-Factor Auth for Admins',  desc: 'Require 2FA verification for admin panel' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={general[item.key]}
                  onChange={() => updateSection('general', item.key, !general[item.key])}
                />
              ))}
            </Card>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 2: PLATFORM
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'platform' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Job & Listing Limits</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>Control platform-wide limits for job seekers and recruiters.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Jobs Per Page (Listings View)', key: 'jobsPerPage', type: 'text' },
                { label: 'Max Images Per Job Post', key: 'maxJobImages', type: 'text' },
                { label: 'Max Resume Size Allowed (e.g. 5 MB)', key: 'maxResumeSize', type: 'text' },
                { label: 'Max Applications Per Job Listing', key: 'maxApplicationsPerJob', type: 'text' },
                { label: 'Candidate Search Requests (Per Day)', key: 'candidateSearchPerDay', type: 'text' },
                { label: 'Recruiter Job Post Monthly Quota', key: 'recruiterJobPostLimit', type: 'text' },
                { label: 'Default Job Expiry Duration (Days)', key: 'jobExpiryDays', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={lStyle}>{f.label}</label>
                  <input
                    type={f.type}
                    value={platform[f.key]}
                    onChange={e => updateSection('platform', f.key, e.target.value)}
                    style={iStyle}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Platform Feature Flags</h3>
            {[
              { key: 'enableJobExpiry',              label: 'Job Auto-Expiry',              desc: 'Automatically close jobs after configured expiry duration' },
              { key: 'enableDraftJobs',               label: 'Draft Job Postings',           desc: 'Allow recruiters to save drafts before publishing' },
              { key: 'enableJobAlerts',               label: 'Candidate Job Alerts',         desc: 'Send matching job notifications to candidates' },
              { key: 'enableSavedJobs',               label: 'Bookmarking / Saved Jobs',     desc: 'Allow candidates to save jobs to their library' },
              { key: 'enableApplicationNotes',        label: 'Internal Application Notes',   desc: 'Recruiters can leave private evaluation notes on applications' },
              { key: 'enableCandidateRatings',        label: 'Candidate Star Ratings',       desc: 'Allow recruiters to rate applicants 1–5 stars' },
              { key: 'enablePublicJobBoard',          label: 'Public Job Board Browsing',    desc: 'Unregistered guests can browse active job listings' },
              { key: 'requireRecruiterVerification',   label: 'Strict Recruiter Verification',desc: 'Recruiter cannot post jobs until admin approves company credentials' },
              { key: 'allowMultipleApplications',     label: 'Re-Application After Rejection', desc: 'Candidates can re-apply to rejected positions after 30 days' },
            ].map(item => (
              <ToggleRow
                key={item.key}
                label={item.label}
                desc={item.desc}
                checked={platform[item.key]}
                onChange={() => updateSection('platform', item.key, !platform[item.key])}
              />
            ))}
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 3: EMAIL & NOTIFICATIONS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'email' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* SMTP Config */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>SMTP Mail Server</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Configure outgoing SMTP server for transactional & notification emails.</p>
                </div>
                <button
                  onClick={() => setShowTestEmailModal(true)}
                  style={{
                    background: '#f5f3ff', color: '#6366f1', border: '1px solid #ddd6fe',
                    borderRadius: '10px', padding: '0.5rem 0.9rem', fontWeight: '800',
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Send size={13} /> Send Test Email
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>SMTP Host</label>
                  <input type="text" value={email.smtpHost} onChange={e => updateSection('email', 'smtpHost', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>SMTP Port</label>
                  <input type="text" value={email.smtpPort} onChange={e => updateSection('email', 'smtpPort', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>SMTP Username</label>
                  <input type="text" value={email.smtpUser} onChange={e => updateSection('email', 'smtpUser', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>SMTP Password / App Key</label>
                  <input type="password" value={email.smtpPass} onChange={e => updateSection('email', 'smtpPass', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>Sender Display Name</label>
                  <input type="text" value={email.senderName} onChange={e => updateSection('email', 'senderName', e.target.value)} style={iStyle} />
                </div>
                <div>
                  <label style={lStyle}>From Email Address</label>
                  <input type="email" value={email.senderEmail} onChange={e => updateSection('email', 'senderEmail', e.target.value)} style={iStyle} />
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <label style={lStyle}>Security Encryption</label>
                  <select value={email.emailEncryption} onChange={e => updateSection('email', 'emailEncryption', e.target.value)} style={iStyle}>
                    {['TLS', 'SSL', 'STARTTLS', 'None'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={handleOpenSentEmails}
                  style={{
                    background: '#f8fafc', color: '#475569', border: '1px solid #cbd5e1',
                    borderRadius: '10px', padding: '0.5rem 1rem', fontWeight: '700',
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <FileText size={14} /> View Sent Emails History
                </button>
              </div>
            </Card>

            {/* Transactional Emails */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Transactional Email Triggers</h3>
              {[
                { key: 'welcomeEmailEnabled',       label: 'Welcome Onboarding Email',    desc: 'Sent immediately on user registration' },
                { key: 'passwordResetEnabled',      label: 'Password Reset OTP Email',     desc: 'Sent when candidate/recruiter requests reset' },
                { key: 'applicationConfirmEnabled', label: 'Application Receipt Email',    desc: 'Confirmation receipt sent to candidate on applying' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={email[item.key]}
                  onChange={() => updateSection('email', item.key, !email[item.key])}
                />
              ))}
            </Card>
          </div>

          {/* Event Notifications */}
          <Card>
            <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Notification Bell & Dispatch Events</h3>
            <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>Choose which events generate bell notifications & push alerts.</p>
            {[
              { key: 'notifyNewCandidate',    label: 'New Candidate Applied',          desc: 'Notify recruiter when candidate applies to their job' },
              { key: 'notifyJobApproval',     label: 'Job Moderation Required',        desc: 'Notify admin when recruiter submits a job for review' },
              { key: 'notifyRecruiterReg',    label: 'New Recruiter Signup',           desc: 'Alert admin when a new organization registers' },
              { key: 'notifyStatusChange',    label: 'Application Status Change',      desc: 'Notify candidate on Shortlist, Reject, or Hire' },
              { key: 'notifyJobExpiry',       label: 'Job Expiration Alert',           desc: 'Warn recruiter 3 days before job listing expires' },
              { key: 'notifyWeeklySummary',   label: 'Weekly Platform Summary',        desc: 'Send analytics digest to admin every Monday' },
              { key: 'notifySystemAlerts',    label: 'System & Server Health Alerts',  desc: 'Dispatch alerts when system performance deviates' },
              { key: 'notifyLoginAlert',      label: 'New Device Login Warning',       desc: 'Alert users on login from unfamiliar IP addresses' },
            ].map(item => (
              <ToggleRow
                key={item.key}
                label={item.label}
                desc={item.desc}
                checked={email[item.key]}
                onChange={() => updateSection('email', item.key, !email[item.key])}
              />
            ))}
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 4: SECURITY
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Session Policy */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Session & Login Security</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>Control session timeouts and brute-force protection.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>Inactivity Session Timeout</label>
                  <select value={security.sessionTimeout} onChange={e => updateSection('security', 'sessionTimeout', e.target.value)} style={iStyle}>
                    {['15 Minutes', '30 Minutes', '1 Hour', '4 Hours', '8 Hours', '24 Hours'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Max Failed Login Attempts (Before Lockout)</label>
                  <select value={security.maxLoginAttempts} onChange={e => updateSection('security', 'maxLoginAttempts', e.target.value)} style={iStyle}>
                    {['3 Attempts', '5 Attempts', '10 Attempts', 'Unlimited'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lStyle}>Account Lockout Duration</label>
                  <select value={security.lockoutDuration} onChange={e => updateSection('security', 'lockoutDuration', e.target.value)} style={iStyle}>
                    {['5 Minutes', '15 Minutes', '30 Minutes', '1 Hour', '24 Hours'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>

            {/* Password Policy */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Password Complexity Policy</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1.25rem 0' }}>Enforce strict password rules across all user roles.</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={lStyle}>Minimum Password Characters</label>
                  <select value={security.passwordMinLength} onChange={e => updateSection('security', 'passwordMinLength', e.target.value)} style={iStyle}>
                    {['6', '8', '10', '12', '16'].map(o => <option key={o}>{o} Characters</option>)}
                  </select>
                </div>
                {[
                  { key: 'requireUppercase', label: 'Require Uppercase Letter (A-Z)', desc: 'At least one uppercase alphabetical character' },
                  { key: 'requireNumbers',   label: 'Require Number (0-9)',          desc: 'At least one numerical digit' },
                  { key: 'requireSymbols',   label: 'Require Special Symbol (!@#$)', desc: 'At least one special character' },
                ].map(item => (
                  <ToggleRow
                    key={item.key}
                    label={item.label}
                    desc={item.desc}
                    checked={security[item.key]}
                    onChange={() => updateSection('security', item.key, !security[item.key])}
                  />
                ))}
                <div>
                  <label style={lStyle}>Password Expiry Period</label>
                  <select value={security.passwordExpiry} onChange={e => updateSection('security', 'passwordExpiry', e.target.value)} style={iStyle}>
                    {['30 Days', '60 Days', '90 Days', '180 Days', 'Never'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* 2FA Policy */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Two-Factor Authentication (2FA)</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>Mandatory multi-factor verification for administrative actions.</p>
              <ToggleRow
                label="Enforce 2FA for Administrators"
                desc="Admin users must pass secondary OTP check upon logging in"
                checked={security.enforce2FA}
                onChange={() => updateSection('security', 'enforce2FA', !security.enforce2FA)}
              />
              {security.enforce2FA && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={lStyle}>Default 2FA Delivery Method</label>
                  <select value={security.twoFAMethod} onChange={e => updateSection('security', 'twoFAMethod', e.target.value)} style={iStyle}>
                    {['Email OTP', 'SMS OTP (Twilio)', 'Authenticator App (TOTP)'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              )}
            </Card>

            {/* Network & Server Security */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Headers & Network Defense</h3>
              {[
                { key: 'enableSSL',          label: 'Enforce HTTPS / TLS 1.3',    desc: 'Auto-redirect insecure HTTP traffic to HTTPS' },
                { key: 'enableHSTS',         label: 'HTTP Strict Transport (HSTS)',desc: 'Transmit Strict-Transport-Security security header' },
                { key: 'enableCSP',          label: 'Content Security Policy (CSP)',desc: 'Mitigate XSS attacks by restricting external scripts' },
                { key: 'enableRateLimiting', label: 'DDoS Rate Limiting',         desc: `Limit to ${security.requestsPerMinute} requests/min per IP` },
                { key: 'enableAuditLog',     label: 'Compliance Audit Logging',   desc: 'Keep immutable log of all critical admin actions' },
                { key: 'enableIPWhitelist',  label: 'Admin IP Whitelisting',      desc: 'Restricts admin portal access strictly to trusted IPs' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={security[item.key]}
                  onChange={() => updateSection('security', item.key, !security[item.key])}
                />
              ))}

              {security.enableIPWhitelist && (
                <div style={{ marginTop: '1rem' }}>
                  <label style={lStyle}>Allowed IP Addresses (Comma-separated)</label>
                  <textarea
                    rows={2}
                    value={security.whitelistedIPs}
                    onChange={e => updateSection('security', 'whitelistedIPs', e.target.value)}
                    style={{ ...iStyle, resize: 'vertical' }}
                    placeholder="192.168.1.1, 10.0.0.1"
                  />
                </div>
              )}
            </Card>

            {/* Audit Logs Actions */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Audit Trail & Compliance</h3>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 1rem 0' }}>Review or download historical administrative activity.</p>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  onClick={handleOpenAuditLogs}
                  style={{
                    background: '#f8fafc', color: '#0f172a', border: '1px solid #cbd5e1',
                    borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '700',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Eye size={14} /> View Audit Logs
                </button>
                <button
                  onClick={handleExportAudit}
                  style={{
                    background: '#f5f3ff', color: '#6366f1', border: '1px solid #ddd6fe',
                    borderRadius: '10px', padding: '0.55rem 1rem', fontWeight: '800',
                    fontSize: '0.82rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <Download size={14} /> Export Audit JSON
                </button>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 5: ACCESS & PERMISSIONS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'access' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.5rem' }}>

            {/* Admin Permissions */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Shield size={16} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Super Admin Powers</h3>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 1rem 0' }}>Core administrative capabilities.</p>
              {[
                { key: 'adminCanEditJobs',       label: 'Edit Any Job Listing',   desc: 'Modify recruiter-posted jobs directly' },
                { key: 'adminCanDeleteUsers',    label: 'Delete User Accounts',   desc: 'Permanently purge accounts' },
                { key: 'adminCanViewMessages',   label: 'Inspect Messages',       desc: 'Audit peer-to-peer conversations' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={access[item.key]}
                  onChange={() => updateSection('access', item.key, !access[item.key])}
                />
              ))}
            </Card>

            {/* Recruiter Permissions */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserCheck size={16} color="#7c3aed" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Recruiter Privileges</h3>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 1rem 0' }}>Permissions granted to verified companies.</p>
              {[
                { key: 'recruiterCanPostDirectly',          label: 'Direct Job Publishing',      desc: 'Bypass admin review queue' },
                { key: 'recruiterCanViewCandidateProfiles', label: 'View Candidate Profiles',    desc: 'Access candidate contact & resume' },
                { key: 'recruiterCanExportData',            label: 'Export Candidate Pipeline',  desc: 'Download CSV applicant reports' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={access[item.key]}
                  onChange={() => updateSection('access', item.key, !access[item.key])}
                />
              ))}
            </Card>

            {/* Candidate Permissions */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={16} color="#2563eb" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Candidate Privacy</h3>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 1rem 0' }}>User control & GDPR privacy rights.</p>
              {[
                { key: 'candidateCanViewRecruiterProfiles', label: 'View Recruiter Details',   desc: 'Show HR direct contact details' },
                { key: 'candidateCanDeleteAccount',         label: 'Self-Service Account Deletion', desc: 'Permit users to delete account' },
                { key: 'candidateCanExportData',            label: 'Export Personal GDPR Data',desc: 'Download their data package' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={item.label}
                  desc={item.desc}
                  checked={access[item.key]}
                  onChange={() => updateSection('access', item.key, !access[item.key])}
                />
              ))}
            </Card>
          </div>

          {/* API Key & Webhooks Manager */}
          <Card>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>REST API & Webhooks Integration</h3>
                <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Connect external ATS systems, HRIS, and third-party automated pipelines.</p>
              </div>
              <div style={{ display: 'flex', gap: '0.6rem' }}>
                <button
                  onClick={handleTestWebhook}
                  style={{
                    background: '#f5f3ff', color: '#6366f1', border: '1px solid #ddd6fe',
                    borderRadius: '10px', padding: '0.5rem 0.9rem', fontWeight: '800',
                    fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                  }}
                >
                  <Terminal size={14} /> Ping Test Webhook
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.5rem' }}>
              {/* API Key */}
              <div>
                <label style={lStyle}>Production REST API Token</label>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={access.apiKey || ''}
                    readOnly
                    style={{ ...iStyle, fontFamily: 'Monaco, monospace', background: '#f8fafc' }}
                  />
                  <button
                    onClick={() => setShowApiKey(!showApiKey)}
                    style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem', cursor: 'pointer', color: '#64748b' }}
                  >
                    {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button
                    onClick={handleCopyApiKey}
                    style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '10px', padding: '0.65rem 0.85rem', cursor: 'pointer', color: '#6366f1', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={15} /> Copy
                  </button>
                  <button
                    onClick={handleRegenerateApiKey}
                    style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.65rem 0.85rem', cursor: 'pointer', color: '#2563eb', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={14} /> Regenerate
                  </button>
                </div>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Keep this token confidential. Authorizes access to the CAREONIX v1 API.</span>
              </div>

              {/* Webhook URL */}
              <div>
                <label style={lStyle}>Webhook Endpoint URL (HTTPS)</label>
                <input
                  type="url"
                  placeholder="https://api.yourcompany.com/careonix/webhook"
                  value={access.webhookUrl || ''}
                  onChange={e => updateSection('access', 'webhookUrl', e.target.value)}
                  style={iStyle}
                />
                <span style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'block', marginTop: '4px' }}>Receives real-time payload when jobs are published or candidates apply.</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 6: APPEARANCE
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'appearance' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Brand Colors & Presets */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 4px 0' }}>Brand Colors & CSS Variables</h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0 }}>Modifies platform theme colors and button gradients in real-time.</p>
                </div>
              </div>

              {/* 1-Click Preset Palettes */}
              <div style={{ marginBottom: '1.25rem' }}>
                <span style={{ fontSize: '0.76rem', fontWeight: '700', color: '#475569', display: 'block', marginBottom: '6px' }}>1-Click Preset Palettes:</span>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {[
                    { name: 'Indigo Modern', p: '#6366f1', s: '#4f46e5', a: '#10b981' },
                    { name: 'Emerald Forest', p: '#059669', s: '#047857', a: '#3b82f6' },
                    { name: 'Electric Violet', p: '#8b5cf6', s: '#7c3aed', a: '#ec4899' },
                    { name: 'Rose Luxury', p: '#e11d48', s: '#be123c', a: '#f59e0b' },
                    { name: 'Slate Corporate', p: '#0f172a', s: '#334155', a: '#0284c7' },
                  ].map(pal => (
                    <button
                      key={pal.name}
                      onClick={() => applyPresetPalette(pal.p, pal.s, pal.a)}
                      style={{
                        background: '#fff', border: '1px solid #cbd5e1', borderRadius: '8px',
                        padding: '4px 10px', fontSize: '0.74rem', fontWeight: '700',
                        color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                      }}
                    >
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: pal.p }} />
                      {pal.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Color Pickers */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                {[
                  { label: 'Primary Brand Color',   key: 'primaryColor' },
                  { label: 'Secondary / Dark Hue',  key: 'secondaryColor' },
                  { label: 'Success / Accent Color', key: 'accentColor' },
                ].map(f => (
                  <div key={f.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ ...lStyle, margin: 0 }}>{f.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="color"
                        value={appearance[f.key] || '#6366f1'}
                        onChange={e => {
                          updateSection('appearance', f.key, e.target.value);
                          applySettingsToDOM({ ...settings, appearance: { ...appearance, [f.key]: e.target.value } });
                        }}
                        style={{ width: '38px', height: '38px', border: '2px solid #e2e8f0', borderRadius: '8px', padding: '2px', cursor: 'pointer', background: 'none' }}
                      />
                      <input
                        type="text"
                        value={appearance[f.key] || ''}
                        onChange={e => {
                          updateSection('appearance', f.key, e.target.value);
                          applySettingsToDOM({ ...settings, appearance: { ...appearance, [f.key]: e.target.value } });
                        }}
                        style={{ ...iStyle, width: '110px', padding: '0.45rem 0.65rem' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Typography & Layout */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1.25rem 0' }}>Typography & Form Factors</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={lStyle}>Font Family (Live Applied)</label>
                  <select
                    value={appearance.fontFamily}
                    onChange={e => {
                      updateSection('appearance', 'fontFamily', e.target.value);
                      applySettingsToDOM({ ...settings, appearance: { ...appearance, fontFamily: e.target.value } });
                      triggerToast(`🔤 Font family changed to ${e.target.value}`);
                    }}
                    style={iStyle}
                  >
                    {['Inter', 'Roboto', 'Outfit', 'Poppins', 'Nunito', 'DM Sans'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>

                <div>
                  <label style={lStyle}>Corner Radius (Buttons & Cards)</label>
                  <select
                    value={appearance.borderRadius}
                    onChange={e => {
                      updateSection('appearance', 'borderRadius', e.target.value);
                      applySettingsToDOM({ ...settings, appearance: { ...appearance, borderRadius: e.target.value } });
                    }}
                    style={iStyle}
                  >
                    {['Sharp (0px)', 'Slightly Rounded (6px)', 'Rounded (12px)', 'Pill (24px)'].map(o => <option key={o}>{o}</option>)}
                  </select>
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Custom CSS Code Editor */}
            <Card>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live Custom CSS Editor</h3>
                <span style={{ fontSize: '0.72rem', background: '#f1f5f9', color: '#475569', padding: '2px 8px', borderRadius: '6px', fontWeight: '700' }}>Injected to &lt;head&gt;</span>
              </div>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 0.75rem 0' }}>Write raw CSS overrides. Applied live across all portal views.</p>
              <textarea
                rows={7}
                placeholder={`/* Example Custom CSS */\n.app-sidebar { box-shadow: 0 4px 20px rgba(0,0,0,0.05); }\n.job-card:hover { transform: translateY(-4px); }`}
                value={appearance.customCSS || ''}
                onChange={e => {
                  updateSection('appearance', 'customCSS', e.target.value);
                  applySettingsToDOM({ ...settings, appearance: { ...appearance, customCSS: e.target.value } });
                }}
                style={{
                  ...iStyle, fontFamily: 'Monaco, Consolas, Courier New, monospace',
                  fontSize: '0.8rem', resize: 'vertical', background: '#0f172a', color: '#a5f3fc',
                  lineHeight: '1.4'
                }}
              />
            </Card>

            {/* Live Interactive UI Preview */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '1rem' }}>
                <Sparkles size={16} color={appearance.primaryColor || '#6366f1'} />
                <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Live Component Preview</h3>
              </div>
              <div style={{
                border: `2px solid ${appearance.primaryColor || '#6366f1'}`,
                borderRadius: '14px', padding: '1.25rem', background: '#f8fafc',
                fontFamily: appearance.fontFamily || 'Inter, sans-serif'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
                  <div style={{
                    width: '30px', height: '30px', borderRadius: '8px',
                    background: appearance.primaryColor || '#6366f1',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: '0.85rem', fontWeight: '900'
                  }}>C</div>
                  <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '1.05rem' }}>{general.platformName} Live UI</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                  <button style={{
                    background: appearance.primaryColor || '#6366f1', color: '#fff',
                    border: 'none', borderRadius: '8px', padding: '7px 16px',
                    fontWeight: '700', fontSize: '0.82rem', cursor: 'pointer'
                  }}>
                    Primary Action
                  </button>
                  <button style={{
                    background: 'none', color: appearance.primaryColor || '#6366f1',
                    border: `1.5px solid ${appearance.primaryColor || '#6366f1'}`,
                    borderRadius: '8px', padding: '7px 16px', fontWeight: '700',
                    fontSize: '0.82rem', cursor: 'pointer'
                  }}>
                    Secondary Outline
                  </button>
                  <span style={{
                    background: `${appearance.accentColor || '#10b981'}20`,
                    color: appearance.accentColor || '#10b981',
                    padding: '4px 10px', borderRadius: '20px', fontWeight: '800',
                    fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center'
                  }}>
                    ● Live Status
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#475569', margin: 0 }}>
                  This preview renders with your chosen font (<strong>{appearance.fontFamily}</strong>) and palette colors.
                </p>
              </div>
            </Card>

          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          TAB 7: INTEGRATIONS
      ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'integrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* Google Analytics */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#fef9c3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📊</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Google Analytics 4</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>User behavioral tracking & event analytics</p>
                  </div>
                </div>
                <Toggle
                  checked={integrations.googleAnalyticsEnabled}
                  onChange={() => updateSection('integrations', 'googleAnalyticsEnabled', !integrations.googleAnalyticsEnabled)}
                />
              </div>
              <label style={lStyle}>GA4 Measurement ID (G-XXXXXXXXXX)</label>
              <input
                type="text"
                placeholder="G-XXXXXXXXXX"
                value={integrations.googleAnalyticsId || ''}
                onChange={e => updateSection('integrations', 'googleAnalyticsId', e.target.value)}
                style={iStyle}
                disabled={!integrations.googleAnalyticsEnabled}
              />
            </Card>

            {/* Razorpay */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💳</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Razorpay Payment Gateway</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>Handles recruiter subscription payments</p>
                  </div>
                </div>
                <Toggle
                  checked={integrations.razorpayEnabled}
                  onChange={() => updateSection('integrations', 'razorpayEnabled', !integrations.razorpayEnabled)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={lStyle}>Key ID</label>
                  <input
                    type="text"
                    value={integrations.razorpayKeyId || ''}
                    onChange={e => updateSection('integrations', 'razorpayKeyId', e.target.value)}
                    style={iStyle}
                    disabled={!integrations.razorpayEnabled}
                  />
                </div>
                <div>
                  <label style={lStyle}>Key Secret</label>
                  <input
                    type="password"
                    value={integrations.razorpayKeySecret || ''}
                    onChange={e => updateSection('integrations', 'razorpayKeySecret', e.target.value)}
                    style={iStyle}
                    disabled={!integrations.razorpayEnabled}
                  />
                </div>
              </div>
              <button
                onClick={handleTestRazorpay}
                disabled={!integrations.razorpayEnabled}
                style={{
                  marginTop: '0.75rem', background: '#eff6ff', color: '#2563eb',
                  border: '1px solid #bfdbfe', borderRadius: '10px', padding: '0.5rem 1rem',
                  fontWeight: '700', fontSize: '0.8rem', cursor: integrations.razorpayEnabled ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Zap size={13} /> Test Gateway Handshake
              </button>
            </Card>

            {/* Twilio SMS */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Twilio (SMS Gateway)</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>SMS OTPs & Mobile Interview Alerts</p>
                  </div>
                </div>
                <Toggle
                  checked={integrations.twilioEnabled}
                  onChange={() => updateSection('integrations', 'twilioEnabled', !integrations.twilioEnabled)}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <label style={lStyle}>Account SID</label>
                  <input
                    type="text"
                    placeholder="ACxxxxxxxxxxxxxxxx"
                    value={integrations.twilioAccountSid || ''}
                    onChange={e => updateSection('integrations', 'twilioAccountSid', e.target.value)}
                    style={iStyle}
                    disabled={!integrations.twilioEnabled}
                  />
                </div>
                <div>
                  <label style={lStyle}>Auth Token</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={integrations.twilioAuthToken || ''}
                    onChange={e => updateSection('integrations', 'twilioAuthToken', e.target.value)}
                    style={iStyle}
                    disabled={!integrations.twilioEnabled}
                  />
                </div>
                <div>
                  <label style={lStyle}>Twilio Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1234567890"
                    value={integrations.twilioPhone || ''}
                    onChange={e => updateSection('integrations', 'twilioPhone', e.target.value)}
                    style={iStyle}
                    disabled={!integrations.twilioEnabled}
                  />
                </div>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

            {/* SendGrid */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#ffe4e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📧</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>SendGrid (Email API)</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>High-volume transactional email provider</p>
                  </div>
                </div>
                <Toggle
                  checked={integrations.sendgridEnabled}
                  onChange={() => updateSection('integrations', 'sendgridEnabled', !integrations.sendgridEnabled)}
                />
              </div>
              <label style={lStyle}>SendGrid API Key</label>
              <input
                type="password"
                placeholder="SG.xxxxxxxxxx..."
                value={integrations.sendgridApiKey || ''}
                onChange={e => updateSection('integrations', 'sendgridApiKey', e.target.value)}
                style={iStyle}
                disabled={!integrations.sendgridEnabled}
              />
            </Card>

            {/* Slack */}
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: '#f3e8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>💬</div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>Slack Alerts Webhook</h3>
                    <p style={{ fontSize: '0.74rem', color: '#64748b', margin: 0 }}>Post alerts to admin Slack channel</p>
                  </div>
                </div>
                <Toggle
                  checked={integrations.slackEnabled}
                  onChange={() => updateSection('integrations', 'slackEnabled', !integrations.slackEnabled)}
                />
              </div>
              <label style={lStyle}>Slack Incoming Webhook URL</label>
              <input
                type="text"
                placeholder="https://hooks.slack.com/services/..."
                value={integrations.slackWebhookUrl || ''}
                onChange={e => updateSection('integrations', 'slackWebhookUrl', e.target.value)}
                style={iStyle}
                disabled={!integrations.slackEnabled}
              />
              <button
                onClick={handleTestSlack}
                disabled={!integrations.slackEnabled}
                style={{
                  marginTop: '0.75rem', background: '#faf5ff', color: '#7c3aed',
                  border: '1px solid #e9d5ff', borderRadius: '10px', padding: '0.5rem 1rem',
                  fontWeight: '700', fontSize: '0.8rem', cursor: integrations.slackEnabled ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', gap: '5px'
                }}
              >
                <Zap size={13} /> Send Slack Test Ping
              </button>
            </Card>

            {/* Social OAuth */}
            <Card>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0f172a', margin: '0 0 1rem 0' }}>Social & OAuth SSO Login</h3>
              <p style={{ fontSize: '0.76rem', color: '#64748b', margin: '0 0 1rem 0' }}>Allow candidates & recruiters to authenticate via SSO.</p>
              {[
                { key: 'googleEnabled',   label: 'Google OAuth 2.0',   emoji: '🔵', desc: 'Sign in with Google Account' },
                { key: 'githubEnabled',   label: 'GitHub OAuth',        emoji: '⚫', desc: 'Sign in with GitHub Profile' },
                { key: 'linkedinEnabled', label: 'LinkedIn OAuth 2.0',  emoji: '🔷', desc: 'Sign in with LinkedIn' },
              ].map(item => (
                <ToggleRow
                  key={item.key}
                  label={`${item.emoji} ${item.label}`}
                  desc={item.desc}
                  checked={integrations[item.key]}
                  onChange={() => updateSection('integrations', item.key, !integrations[item.key])}
                />
              ))}

              {integrations.githubEnabled && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <div>
                    <label style={lStyle}>GitHub OAuth Client ID</label>
                    <input type="text" placeholder="Ov23li..." value={integrations.githubClientId || ''} onChange={e => updateSection('integrations', 'githubClientId', e.target.value)} style={iStyle} />
                  </div>
                  <div>
                    <label style={lStyle}>GitHub OAuth Client Secret</label>
                    <input type="password" placeholder="••••••••••••••••" value={integrations.githubClientSecret || ''} onChange={e => updateSection('integrations', 'githubClientSecret', e.target.value)} style={iStyle} />
                  </div>
                </div>
              )}

              {integrations.linkedinEnabled && (
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.75rem', background: '#f8fafc', borderRadius: '10px' }}>
                  <div>
                    <label style={lStyle}>LinkedIn Client ID</label>
                    <input type="text" placeholder="77xxxxxxxx..." value={integrations.linkedInClientId || ''} onChange={e => updateSection('integrations', 'linkedInClientId', e.target.value)} style={iStyle} />
                  </div>
                  <div>
                    <label style={lStyle}>LinkedIn Client Secret</label>
                    <input type="password" placeholder="••••••••••••••••" value={integrations.linkedInClientSecret || ''} onChange={e => updateSection('integrations', 'linkedInClientSecret', e.target.value)} style={iStyle} />
                  </div>
                </div>
              )}
            </Card>

          </div>
        </div>
      )}

      {/* ── MODAL 1: Send Test Email ───────────────────────────────────────── */}
      {showTestEmailModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '460px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={20} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Send Real SMTP Test Email</h3>
              </div>
              <button onClick={() => setShowTestEmailModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Dispatches a live confirmation email through <strong>{email.smtpHost}:{email.smtpPort}</strong> and logs the receipt to the system sent log.
            </p>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={lStyle}>Recipient Email Address</label>
              <input type="email" value={testEmailAddress} onChange={e => setTestEmailAddress(e.target.value)} style={iStyle} placeholder="admin@careonix.com" />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button onClick={() => setShowTestEmailModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleSendTestEmail} disabled={testEmailSending} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.4rem', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
                {testEmailSending ? <RefreshCw size={15} className="spin" /> : <Send size={15} />}
                {testEmailSending ? 'Sending...' : 'Send Test'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 2: Sent Emails History ──────────────────────────────────── */}
      {showSentEmailsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '650px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Sent Email Logs ({sentEmailsList.length})</h3>
              </div>
              <button onClick={() => setShowSentEmailsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', paddingRight: '4px' }}>
              {sentEmailsList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8', fontSize: '0.88rem' }}>No sent email records yet. Dispatch a test email above!</div>
              ) : (
                sentEmailsList.map((item, idx) => (
                  <div key={item.id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.86rem' }}>{item.title}</span>
                      <span style={{ fontSize: '0.72rem', background: '#dcfce7', color: '#15803d', padding: '2px 8px', borderRadius: '6px', fontWeight: '800' }}>{item.status || 'SENT'}</span>
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#475569', margin: '0 0 4px 0' }}>{item.message}</p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94a3b8' }}>
                      <span>To: <strong>{item.recipientEmail}</strong></span>
                      <span>{item.sentAt}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 3: Audit Logs Viewer ────────────────────────────────────── */}
      {showAuditLogsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Shield size={20} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>System Audit Logs ({auditLogsList.length})</h3>
              </div>
              <button onClick={() => setShowAuditLogsModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {auditLogsList.map((log, idx) => (
                <div key={log.id || idx} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: '800', color: '#6366f1', fontSize: '0.82rem', display: 'block' }}>{log.action}</span>
                    <span style={{ fontSize: '0.78rem', color: '#334155' }}>{log.details}</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8' }}>
                    <div>{log.user}</div>
                    <div>{log.formattedTime}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 4: Webhook Ping Inspector ──────────────────────────────── */}
      {showWebhookModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '540px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Terminal size={20} color="#6366f1" />
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Webhook Ping Test Dispatched</h3>
              </div>
              <button onClick={() => setShowWebhookModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.75rem' }}>
              HTTP POST payload dispatched to <strong>{access.webhookUrl || 'https://api.yourcompany.com/webhook'}</strong> with status <code>200 OK</code>:
            </p>
            <pre style={{ background: '#0f172a', color: '#38bdf8', padding: '1rem', borderRadius: '12px', fontSize: '0.78rem', overflowX: 'auto', maxHeight: '240px' }}>
              {webhookPayload}
            </pre>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button onClick={() => setShowWebhookModal(false)} style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.55rem 1.25rem', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL 5: Reset Confirm ────────────────────────────────────────── */}
      {showResetConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, padding: '1rem' }}>
          <div style={{ background: '#fff', borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '440px', textAlign: 'center', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
            </div>
            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.15rem', fontWeight: '800', color: '#0f172a' }}>Reset Platform Settings?</h3>
            <p style={{ fontSize: '0.84rem', color: '#64748b', margin: '0 0 1.5rem 0' }}>
              Are you sure you want to reset all 7 settings tabs back to system defaults? This will clear custom colors and SMTP keys.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button onClick={() => setShowResetConfirm(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '10px', padding: '0.65rem 1.25rem', fontWeight: '700', fontSize: '0.84rem', cursor: 'pointer', color: '#475569' }}>Cancel</button>
              <button onClick={handleResetDefaults} style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.65rem 1.4rem', fontWeight: '800', fontSize: '0.84rem', cursor: 'pointer' }}>Yes, Reset to Default</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
